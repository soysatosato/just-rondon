/**
 * 既存 AttractionSection の本文から、実用情報(料金・所要時間・最寄駅・
 * 開館時間)を抽出して Attraction の構造化カラムへ移す。
 *
 *   npx tsx scripts/migrate-attraction-facts.ts            # dry-run。DBは変更しない
 *   npx tsx scripts/migrate-attraction-facts.ts --apply    # 実際に書き込む
 *   npx tsx scripts/migrate-attraction-facts.ts --slug=tower-of-london
 *
 * 方針: 確信が持てない行は抽出しない。
 * 料金や開館時間は読者が実際にその金額・時刻を前提に行動する情報なので、
 * 誤った値を出すのは無記載より悪い。パターンに素直に当てはまるものだけを
 * 拾い、外れたら null のままにして dry-run のレポートに未抽出として出す。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");
const SLUG_ARG = process.argv.find((a) => a.startsWith("--slug="));
const ONLY_SLUG = SLUG_ARG ? SLUG_ARG.split("=")[1] : null;

/* ------------------------------------------------------------------
   セクション見出しの分類

   同じ事実が4通りの見出しで書かれている(「料金・チケット情報」53件 /
   「チケット情報」40件 / 「チケット料金」9件 / 「料金」13件)ため、
   見出し名でどの事実を含むセクションかを判定する。
------------------------------------------------------------------ */

const PRICE_TITLES = /料金|チケット|入場料|価格/;
const DURATION_TITLES = /所要時間|滞在時間|見学時間/;
const ACCESS_TITLES = /アクセス|行き方|最寄|場所|所在地/;

/**
 * 「時間」だけで拾うと「所要時間」「年齢制限と所要時間」まで巻き込み、
 * 時刻表記の無い本文を開館時間として解析してしまう。
 * 開館/営業を表す語に限定し、「所要」を含む見出しは明示的に除く。
 */
const HOURS_TITLES = /開館|開園|開場|営業|オープン|開閉/;
const NOT_HOURS_TITLES = /所要|滞在|見学時間/;

/** 全角→半角、全角スペース、装飾markdownを落として正規化する。 */
function normalize(s: string) {
  return s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[（）]/g, (c) => (c === "（" ? "(" : ")"))
    .replace(/[：]/g, ":")
    .replace(/[〜～]/g, "〜")
    .replace(/\*\*/g, "")
    .replace(/　/g, " ");
}

/* ------------------------------------------------------------------
   料金
------------------------------------------------------------------ */

/**
 * "大人：35.8ポンド〜" / "大人 £35.8から" / "Adult £35.80" を拾う。
 *
 * 「£20〜£30」のような範囲はそのまま範囲として残す。丸めると
 * 予算を組む読者の役に立たなくなる。
 */
function extractPrice(text: string, who: "adult" | "child"): string | null {
  const label =
    who === "adult" ? /(大人|おとな|Adult)/i : /(子供|子ども|こども|小人|Child)/i;

  for (const rawLine of text.split("\n")) {
    // 行頭の markdown 箇条書き記号は先に落とす。これを残したまま範囲判定を
    // すると "- 大人:£28.00" の先頭のハイフンを「〜」と誤読し、定額を
    // 「£28.00〜(から)」という別の意味に変えてしまう。
    const line = normalize(rawLine).replace(/^\s*[-*・]\s*/, "");
    if (!label.test(line)) continue;

    // 「子供(15歳以下):無料」のように金額欄が「無料」の行を拾う。
    //
    // ただし説明文への誤爆に注意する。「料金は大人、子供、シニア…により
    // 異なります」のような文は、対象ラベルも無料の語も含みうるが価格行では
    // ない。これを無料と読むと有料施設(St Paul's 等)を無料と表示してしまう
    // ため、"ラベル:無料" の形に近い短い行だけを無料と認める。
    const freeValue = line.match(
      /^[^:]{0,20}[:はが]\s*(?:\**)?\s*(?:無料|Free)/i,
    );
    const shortFreeLine = /無料|free/i.test(line) && line.length <= 24;
    if (freeValue || shortFreeLine) return "無料";

    // 「大人料金は下記参照」のような誘導行は金額を含まないので落ちる
    const m = line.match(
      /(?:£|ポンド)?\s*(\d+(?:\.\d+)?)\s*(?:ポンド|£|pounds?)?\s*(?:〜|から|–)?\s*(\d+(?:\.\d+)?)?/,
    );
    if (!m) continue;
    const hasCurrency = /£|ポンド|pound/i.test(line);
    if (!hasCurrency) continue;

    const lo = m[1];
    const hi = m[2];
    // 箇条書き記号を除いたうえで、範囲を表す記号が実際に含まれるかを見る
    const range = /〜|から|–/.test(line);
    if (hi && hi !== lo) return `£${lo}〜£${hi}`;
    return range ? `£${lo}〜` : `£${lo}`;
  }
  return null;
}

/* ------------------------------------------------------------------
   所要時間
------------------------------------------------------------------ */

/**
 * "最低でも3時間の見学を推奨" → "3時間〜"
 * "1〜2時間" → "1〜2時間"
 * "約90分" → "90分"
 */
function extractDuration(text: string): string | null {
  const t = normalize(text);

  const range = t.match(/(\d+(?:\.\d+)?)\s*〜\s*(\d+(?:\.\d+)?)\s*(時間|分)/);
  if (range) return `${range[1]}〜${range[2]}${range[3]}`;

  const atLeast = t.match(
    /(?:最低でも|少なくとも|最低)\s*(?:約)?\s*(\d+(?:\.\d+)?)\s*(時間|分)/,
  );
  if (atLeast) return `${atLeast[1]}${atLeast[2]}〜`;

  const single = t.match(/(?:約|およそ)?\s*(\d+(?:\.\d+)?)\s*(時間|分)(?:程度|ほど|前後|くらい)?/);
  if (single) return `${single[1]}${single[2]}`;

  return null;
}

/* ------------------------------------------------------------------
   最寄駅
------------------------------------------------------------------ */

/**
 * "最寄駅はタワーヒル駅(ディストリクト線、サークル線)、徒歩5分"
 *   → "タワーヒル駅 徒歩5分"
 * "- **地下鉄**:ウェストミンスター駅(ジュビリー線)、徒歩約5分"
 *   → "ウェストミンスター駅 徒歩5分"
 *
 * 路線名は落とす。ファクトバーは一目で読める長さに収めたいので、
 * 詳細は下の本文セクションに残っているほうを読んでもらう。
 *
 * 駅名にスペースを許すのが要点。"St John's Wood" のような複数語の駅名で
 * 区切りにスペースを入れると "Wood駅" に切り詰められ、実在する別の駅を
 * 指してしまう。行頭の装飾やラベル("**地下鉄**:")を先に剥がしてから、
 * 直前のラベル・句読点までを駅名として取る。
 */

/** 駅名の手前に付く定型ラベル。ここまでを捨てる。 */
const STATION_LABEL =
  /^[\s\-・*>]*(?:\*\*)?(?:最寄(?:り)?(?:の)?(?:地下鉄)?駅|地下鉄|チューブ|Tube|鉄道|国鉄|電車|DLR|Underground)(?:\*\*)?\s*(?:駅)?\s*[:：はが]?\s*/i;

function extractStation(text: string): string | null {
  for (const rawLine of text.split("\n")) {
    let line = normalize(rawLine).trim();
    if (!/駅|Station/i.test(line)) continue;

    // markdown の見出し行(「### 最寄駅」)は駅名ではなくラベル。
    // 本文中に見出しを持つセクションがあるため、明示的に飛ばす。
    if (/^#{1,6}\s/.test(line)) continue;

    // 「ロンドン・パディントン駅から〜まで約22分」のような、出発地を説明する
    // 行は最寄駅ではない。距離の起点として書かれているだけなので飛ばす。
    if (/から.*(?:まで|行|乗)/.test(line)) continue;

    // ラベルは連なることがある("**地下鉄**:最寄駅はタワーヒル駅…")。
    // 1回だけ剥がすと "最寄駅は…" が残り、下の除外条件に当たって
    // その行を捨て、より遠い駅の行を拾ってしまう。剥がれなくなるまで回す。
    for (let i = 0; i < 3; i++) {
      const stripped = line.replace(STATION_LABEL, "");
      if (stripped === line) break;
      line = stripped;
    }

    // 駅名 = 行頭から最初の「駅」/「Station」まで。ただし読点・括弧・コロンで
    // 区切られたらそこで打ち切る(スペースは駅名の一部として許す)。
    const station = line.match(/^([^:,、。()（）]*?(?:駅|Station))/i);
    if (!station) continue;

    const name = station[1]
      .replace(/^[-・*\s]+/, "")
      // "Peckham Rye 駅" のように英語駅名へ全角「駅」が付く形は空白を詰める。
      // "Barbican Station" の空白は英語表記として正しいので残す。
      .replace(/\s+駅$/, "駅")
      .trim();
    if (!name || name.length > 30) continue;
    // ラベル剥がしに漏れたものを弾く
    if (/^(地下鉄|最寄|最寄り|鉄道|各|複数)/.test(name)) continue;

    const walk = line.match(/徒歩\s*(?:約)?\s*(\d+)\s*分/);
    return walk ? `${name} 徒歩${walk[1]}分` : name;
  }
  return null;
}

/* ------------------------------------------------------------------
   開館時間
------------------------------------------------------------------ */

/**
 * "3月〜10月：火〜土 9:00〜17:30(最終入場16:30)" のように季節で
 * 何行にも分かれるのが普通なので、最初に現れた時刻レンジを代表値として
 * 取り、最終入場があれば添える。
 *
 * 季節変動そのものは本文の「開館時間」セクションに残るので、
 * ここでは「だいたい何時に開いて何時に閉まるか」だけを担う。
 */
function extractHours(text: string): string | null {
  const t = normalize(text);
  const m = t.match(/(\d{1,2}:\d{2})\s*〜\s*(\d{1,2}:\d{2})/);
  if (!m) return null;

  const last = t.match(/最終入場\s*:?\s*(\d{1,2}:\d{2})/);
  return last
    ? `${m[1]}〜${m[2]} (最終入場${last[1]})`
    : `${m[1]}〜${m[2]}`;
}

/* ------------------------------------------------------------------
   1件ぶんの抽出
------------------------------------------------------------------ */

type Extracted = {
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
};

function extractFor(attraction: {
  isFree: boolean;
  sections: { title: string; description: string | null }[];
}): Extracted {
  const join = (re: RegExp) =>
    attraction.sections
      .filter((s) => re.test(s.title))
      .map((s) => s.description ?? "")
      .join("\n");

  const priceText = join(PRICE_TITLES);
  const durationText = join(DURATION_TITLES);
  const accessText = join(ACCESS_TITLES);
  const hoursText = attraction.sections
    .filter((s) => HOURS_TITLES.test(s.title) && !NOT_HOURS_TITLES.test(s.title))
    .map((s) => s.description ?? "")
    .join("\n");

  // isFree が立っているスポットは本文に金額が無いのが正しいので、
  // パースを試みずに「無料」を入れる。
  const priceAdult = attraction.isFree
    ? "無料"
    : extractPrice(priceText, "adult");
  const priceChild = attraction.isFree
    ? "無料"
    : extractPrice(priceText, "child");

  return {
    priceAdult,
    priceChild,
    // 所要時間は専用セクションが無く概要に混ざっている場合があるので、
    // 専用セクションが空なら見どころ系セクションも見る。
    durationText:
      extractDuration(durationText) ||
      extractDuration(join(/見どころ|体験内容|概要/)),
    nearestStation: extractStation(accessText),
    openingHours: extractHours(hoursText),
  };
}

/* ------------------------------------------------------------------
   実行
------------------------------------------------------------------ */

async function main() {
  const attractions = await db.attraction.findMany({
    where: ONLY_SLUG ? { slug: ONLY_SLUG } : {},
    include: { sections: true },
    orderBy: { slug: "asc" },
  });

  const stats: Record<keyof Extracted, number> = {
    priceAdult: 0,
    priceChild: 0,
    durationText: 0,
    nearestStation: 0,
    openingHours: 0,
  };

  const samples: string[] = [];
  const misses: string[] = [];

  for (const a of attractions) {
    const got = extractFor(a);

    (Object.keys(stats) as (keyof Extracted)[]).forEach((k) => {
      if (got[k]) stats[k]++;
    });

    const filled = Object.values(got).filter(Boolean).length;
    if (filled === 0) {
      misses.push(`  ${a.slug} (${a.name}) — sections: ${a.sections.length}`);
    } else if (samples.length < 12) {
      samples.push(
        `  ${a.slug}\n` +
          (Object.entries(got) as [string, string | null][])
            .filter(([, v]) => v)
            .map(([k, v]) => `      ${k.padEnd(15)}: ${v}`)
            .join("\n"),
      );
    }

    if (APPLY) {
      await db.attraction.update({ where: { id: a.id }, data: got });
    }
  }

  const total = attractions.length;
  console.log(APPLY ? "=== APPLIED ===" : "=== DRY RUN (書き込みなし) ===");
  console.log(`対象: ${total}件\n`);

  (Object.keys(stats) as (keyof Extracted)[]).forEach((k) => {
    const n = stats[k];
    const pct = ((n / total) * 100).toFixed(1);
    console.log(`${k.padEnd(16)}: ${String(n).padStart(3)}/${total} (${pct}%)`);
  });

  console.log("\n--- 抽出サンプル ---");
  console.log(samples.join("\n"));

  if (misses.length) {
    console.log(`\n--- 1つも抽出できなかったスポット (${misses.length}件) ---`);
    console.log(misses.join("\n"));
  }

  if (!APPLY) {
    console.log("\n書き込むには --apply を付けて再実行してください。");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
