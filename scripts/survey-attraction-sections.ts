/**
 * AttractionSection 1,018節を分類し、AttractionStory へ移行する計画を出す。
 *
 *   npx tsx scripts/survey-attraction-sections.ts            # 全体の集計
 *   npx tsx scripts/survey-attraction-sections.ts --detail   # 節ごとの割り当て
 *   npx tsx scripts/survey-attraction-sections.ts --review   # 要判断のものだけ
 *   npx tsx scripts/survey-attraction-sections.ts --slug=xxx # 1スポットだけ見る
 *
 * ★ このスクリプトはDBを一切変更しない。読むだけ。
 *
 * 背景:
 * AttractionSection.title が自由文字列なので、同じ話題に172種類の見出しが
 * 生まれた(「アクセス」「アクセス方法」「所在地」「場所」が全部同義)。
 * うち138種類は1件しか使われていない。この状態では表示側で
 * 「見どころを先に出す」「料金はファクトバーと重複するので伏せる」といった
 * 判断が正規表現頼みになり、実際 isRedundantOverview は0/145で機能していない。
 *
 * 移行先の考え方:
 * 節を中身の性質で3つに仕分ける。
 *
 *   1. facts    … 構造化すべき事実(料金・アクセス・開館・所要)
 *                 本来カラムかテーブルであって、文章である必要がない。
 *                 現在も表示側で伏せられており、409節83,000字が死んでいる。
 *   2. story    … 読み物(見どころ・歴史・豆知識・そのスポット固有の話)
 *                 AttractionStory へ kind を付けて移す。
 *   3. redundant… summary の言い換え(「概要」系)
 *                 原則削除。ただし summary に無い事実を含むものがあるので
 *                 (実測で25件中24件)、必ず退避候補として出す。
 *
 * 出力の見方:
 * - [facts]     → カラム/AttractionAccess へ吸い上げ。移行後この節は消す
 * - [story:*]   → AttractionStory へそのまま移す。kind は自動判定
 * - [redundant] → 削除候補。ただし unique 欄に語があるものは要確認
 * - [review]    → 自動判定できない。人が見て決める
 */

import db from "@/utils/db";

const DETAIL = process.argv.includes("--detail");
const REVIEW = process.argv.includes("--review");
const SLUG = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

/** AttractionStory.kind の候補。自由文字列にしないための固定リスト。 */
type StoryKind = "highlight" | "history" | "trivia" | "practical" | "context";

type Verdict =
  | { bucket: "facts"; target: string }
  | { bucket: "story"; kind: StoryKind }
  /** 1つの節に事実と読み物が同居。事実側を落として残りを story へ移す。 */
  | { bucket: "split"; keep: StoryKind; drop: string }
  | { bucket: "redundant" }
  | { bucket: "review"; why: string };

/**
 * 見出しから移行先を決める。
 *
 * 順番が意味を持つ。先に「実用情報以外の話も含む複合見出し」を拾わないと、
 * 「所要時間・年齢制限」が facts に落ちて年齢制限の記述ごと消える。
 */
function classify(title: string, body: string): Verdict {
  const t = title.trim();

  /*
    「所要時間・年齢制限」80件。
    実データを見ると、全80件が「所要時間(=durationText と重複する事実)」と
    「年齢制限・推奨時間帯(=読み物として残すべき実用情報)」の両方を含む。
    所要時間だけの節は0件だった。
    → 事実側は durationText が既にあるので捨て、残りを practical として移す。
       本文から所要時間の行だけを落とす作業が要るので split として印を付ける。
  */
  if (/所要時間・年齢制限/.test(t)) {
    return { bucket: "split", keep: "practical", drop: "durationText" };
  }

  /*
    「見どころ・体験内容」80件。
    複合見出しに見えるが、実データはどれも読み物そのもの
    (ガーキンの外観の見方、カティーサークの登攀手順、フレームレスの各室)。
    事実の混入は無いので、そのまま highlight として移せる。
  */
  if (/見どころ・体験内容/.test(t)) {
    return { bucket: "story", kind: "highlight" };
  }

  // --- summary の言い換え ---
  if (/^概要|とは[？?]\s*$|について\s*$/.test(t)) return { bucket: "redundant" };

  // --- 構造化すべき事実 ---
  if (/アクセス|行き方|最寄|所在地|^場所|出発場所|集合/.test(t))
    return { bucket: "facts", target: "AttractionAccess / nearestStation" };
  if (/料金|チケット|入場料|価格|含まれるもの|含まれる内容/.test(t))
    return { bucket: "facts", target: "priceAdult / priceChild" };
  if (/開館|開園|開場|営業|オープン|開閉|運行時間/.test(t))
    return { bucket: "facts", target: "openingHours" };
  if (/所要時間|滞在時間|見学時間/.test(t))
    return { bucket: "facts", target: "durationText" };

  // --- 読み物 ---
  if (/見どころ|必見|ハイライト|見られるもの|展示|体験内容|景観|楽しみ方|できること/.test(t))
    return { bucket: "story", kind: "highlight" };
  if (/歴史|由来|建築|設計|創立|誕生|変遷/.test(t))
    return { bucket: "story", kind: "history" };
  if (/豆知識|エピソード|裏話|なぜ/.test(t))
    return { bucket: "story", kind: "trivia" };
  if (/服装|持ち物|注意|年齢制限|予約|よくある質問|アクセシビリティ|ドレスコード|混雑|ベスト|おすすめの訪問|対象年齢|対応言語|多言語/.test(t))
    return { bucket: "story", kind: "practical" };
  if (/ショップ|飲食|食事|カフェ|レストラン|お土産|ギフト|購入/.test(t))
    return { bucket: "story", kind: "practical" };

  // --- 残り: そのスポット固有の話が多いが、要確認 ---
  if (body.length >= 150) return { bucket: "story", kind: "context" };
  return { bucket: "review", why: "分類できず、本文も短い" };
}

/** 固有名詞・数値を抜く。「概要」に summary が持たない事実があるかを見る。 */
function factTokens(text: string): Set<string> {
  const t = text.replace(/[*#>\-—]/g, " ");
  const out = new Set<string>();
  for (const m of t.matchAll(
    /[\d０-９][\d０-９,，.]*\s*(?:年|世紀|万人|人|点|種|m|km|時間|分|階|室|£|ポンド)?/g,
  )) {
    const s = m[0].replace(/[,，\s]/g, "");
    if (s.length >= 2) out.add(s);
  }
  for (const m of t.matchAll(/[ァ-ヴー]{4,}/g)) out.add(m[0]);
  for (const m of t.matchAll(/[A-Za-z][A-Za-z'&]{3,}/g)) out.add(m[0].toLowerCase());
  return out;
}

async function main() {
  const attractions = await db.attraction.findMany({
    where: SLUG ? { slug: SLUG } : undefined,
    include: { sections: { orderBy: { displayOrder: "asc" } }, visitFlow: true },
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  const tally: Record<string, { n: number; chars: number }> = {};
  const bump = (k: string, chars: number) => {
    tally[k] = tally[k] ?? { n: 0, chars: 0 };
    tally[k].n++;
    tally[k].chars += chars;
  };

  const reviews: string[] = [];
  const rescue: string[] = [];

  for (const a of attractions) {
    const sumFacts = factTokens(a.summary ?? "");
    const lines: string[] = [];

    for (const s of a.sections) {
      const body = s.description ?? "";
      const v = classify(s.title, body);
      const key =
        v.bucket === "story" ? `story:${v.kind}`
        : v.bucket === "split" ? `split:${v.keep}`
        : v.bucket === "facts" ? "facts"
        : v.bucket;
      bump(key, body.length);

      let note = "";
      if (v.bucket === "redundant") {
        /*
          summary に無い「事実」を拾う。
          単に語が違うだけ(スポット名の英字表記、地名の言い換え)は退避に
          値しないので、数値を含む語だけを見る。年号・料金・高さ・人数など、
          消えると本当に情報が減るものはほぼ数値を伴う。
        */
        const only = [...factTokens(body)].filter(
          (f) => !sumFacts.has(f) && /[\d０-９]/.test(f),
        );
        if (only.length >= 2) {
          note = `  ← summaryに無い数値: ${only.slice(0, 8).join(" ")}`;
          rescue.push(`${a.name} / ${s.title}: ${only.slice(0, 10).join(" ")}`);
        }
      }
      if (v.bucket === "review") {
        reviews.push(`${a.name} / ${s.title} (${body.length}字) — ${v.why}`);
      }

      lines.push(
        `    [${key.padEnd(17)}] ${s.title} (${body.length}字)` +
          (v.bucket === "facts" ? ` → ${v.target}` : "") +
          (v.bucket === "split" ? ` → ${v.drop} の記述を落として移す` : "") +
          note,
      );
    }

    if (DETAIL || SLUG) {
      console.log(`\n## ${a.name} (${a.slug})  lv${a.recommendLevel} flow:${a.visitFlow.length}`);
      lines.forEach((l) => console.log(l));
    }
  }

  if (REVIEW) {
    console.log("=== 人が判断すべき節 ===");
    reviews.forEach((r) => console.log("  " + r));
    console.log(`\n=== 「概要」を消す前に退避を検討すべきもの (${rescue.length}件) ===`);
    rescue.forEach((r) => console.log("  " + r));
    return;
  }

  if (!DETAIL && !SLUG) {
    const totalN = Object.values(tally).reduce((n, v) => n + v.n, 0);
    const totalC = Object.values(tally).reduce((n, v) => n + v.chars, 0);
    console.log(`対象: ${attractions.length}スポット / ${totalN}節 / ${totalC.toLocaleString()}字\n`);
    console.log("=== 移行先の内訳 ===");
    Object.entries(tally)
      .sort((x, y) => y[1].chars - x[1].chars)
      .forEach(([k, v]) =>
        console.log(`  ${k.padEnd(17)} ${String(v.n).padStart(4)}節 ${String(v.chars).padStart(7)}字`),
      );
    console.log(`\n人が判断すべき節: ${reviews.length}件`);
    console.log(`「概要」で退避を検討すべきもの: ${rescue.length}件`);
    console.log("\n--detail で節ごとの割り当て、--review で要判断のものだけ出ます。");
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
