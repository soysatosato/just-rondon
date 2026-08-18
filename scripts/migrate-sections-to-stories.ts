/**
 * AttractionSection 1,018節を AttractionStory へ移す。
 *
 *   npx tsx scripts/migrate-sections-to-stories.ts           # 何が起きるか表示
 *   npx tsx scripts/migrate-sections-to-stories.ts --apply   # 投入
 *   npx tsx scripts/migrate-sections-to-stories.ts --slug=x  # 1スポットだけ
 *
 * 旧 AttractionSection は読まないだけで削除しない。表示側を切り替えたあと、
 * 本番で問題が無いことを確認してから別途消す。
 *
 * 冪等。投入前にそのスポットの AttractionStory を作り直すので、
 * 何度流しても同じ結果になる。
 *
 * ★ authored を1本でも持つスポットには触らない。
 *   seed-attraction-stories-*.ts が書き直したスポットは、旧 sections を
 *   すでに読み直した後なので、移行としてやることが無い。作り直すなら
 *   seed 側を流す。消すのも source: "migrated" の行だけに限定している。
 *
 *   以前はスポット単位で全削除して作り直していたため、最寄駅を29件
 *   補完したあとにこのスクリプトを流し直した際、level 5 と level 4 の
 *   書き直し(合計 約28,000字)を消している。手で書いた本文を足すときは
 *   必ず source: "authored" で入れること。
 *
 * 接続先が遠い(Supabase)ため、135スポットを1件ずつ処理すると2分では
 * 終わらない。--resume を付けると、既に migrated の行を持つスポットを
 * 飛ばして続きから流せる。途中で切れても同じコマンドで再開できる。
 *   npx tsx scripts/migrate-sections-to-stories.ts --apply --resume
 *
 * 分類の根拠は scripts/survey-attraction-sections.ts と
 * scripts/PLAN-attraction-story.md を参照。要点だけ再掲する:
 *
 *   facts     … 料金・アクセス・開館・所要。Attraction のカラムと重複するので
 *               移さない(393節・約61,000字)。もともと表示側で伏せられており、
 *               ページ上には出ていなかった。
 *   redundant … 「概要」系145件。summary の言い換えなので原則移さない。
 *               ただし summary に無い数値を持つものは捨てると情報が減るため、
 *               RESCUE に列挙して history / trivia として拾う。
 *   split     … 「所要時間・年齢制限」80件。全件が所要時間(=durationText と
 *               重複)と年齢制限の両方を含む。所要時間の行だけ落として移す。
 *   story     … 残り。kind を付けてそのまま移す。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");
const RESUME = process.argv.includes("--resume");
const SLUG = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

type StoryKind = "highlight" | "history" | "trivia" | "practical" | "context";

/**
 * 「概要」を捨てずに拾うもの。
 *
 * survey スクリプトが「summary に無い数値」を持つと判定した38件のうち、
 * 実際に読む価値のある事実を含むものを人が選んだ。
 * 値は移行先の kind。ここに無い「概要」は破棄する。
 *
 * 拾わなかったものの例: 「12 25 22 00 20 23 26」(開館時間の数字の羅列)、
 * 「30 00 8時間 16」(集合時刻)——いずれも事実だが、ファクトバーか
 * 本文の別の節に既にある。
 */
const RESCUE: Record<string, StoryKind> = {
  "st-pauls-cathedral": "history",       // 1666年の大火、1710年完成、ドーム111m
  "big-ben": "trivia",                   // 鐘13.7トン
  "natural-history-museum": "history",   // 1753年創設、1881年移転、8,000万点
  "royal-observatory-greenwich": "history", // 1675年、1884年の子午線会議
  "the-view-from-the-shard": "practical",// 68・69階と72階の構成
  "tate-modern": "history",              // 発電所時代から2000年開館まで
  "hyde-park-london": "history",         // 142ヘクタール、17世紀からの経緯
  "harrods-london": "history",           // 160年の歴史、売場面積
  "bt-tower-london": "history",          // 1965年開業、高さ177m
  "arcelormittal-orbit-zip-world-london": "history", // 2012年五輪、高さ76m
  "20-fenchurch-street-walkie-talkie": "history",    // 2014年竣工、34階
  "sir-john-soanes-museum": "history",   // 1753-1837年、1833年の法
  "down-house-charles-darwin": "history",// 1842年転居、1882年没
  "millennium-bridge": "history",        // 21世紀最初の橋
  "monument-to-the-great-fire-of-london": "history", // 1671-1677年建造
  "fulham-craven-cottage-tour": "history",           // 1879年創設
  "banqueting-house-london": "history",  // 17世紀、1649年の処刑
  "sutton-house-breakers-yard": "history",           // 16世紀の邸宅
  "emery-walkers-house": "history",      // 19-20世紀の内装
  "gripped-london": "practical",         // 高さ24m、滑降50m
  "the-crystal-maze-live-experience-london": "practical", // 所要75分
  "florence-nightingale-museum": "practical",        // 所要1時間
  "monopoly-lifesized-london": "practical",          // 大人1人につき5人まで
};

/** 所要時間だけを述べている行。split のときに落とす。 */
const DURATION_LINE = /^[\s\-*・]*\**\s*(所要時間|滞在時間|見学時間|所要)\b.*$/;

type Plan =
  | { action: "move"; kind: StoryKind; heading: string | null; body: string }
  | { action: "drop"; why: string };

/** カラムに値が入っているか。事実の節を捨ててよいかの判断に使う。 */
type FactCols = {
  priceAdult: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
};

/**
 * 見出しから移行方針を決める。
 * survey スクリプトの classify() と同じ判定順を保つこと。
 *
 * 事実の節を捨てるのは「対応するカラムに値が入っているとき」だけにする。
 * これは components/sightseeing/sections.ts の visibleSections が
 * 元から守っているルールで、無条件に捨てると
 * 「アクセス節を消したのに nearestStation が空」というページが46件出る
 * (料金7件・開館24件・所要1件も同様)。
 * カラムが空のときは practical として本文に残し、情報を落とさない。
 */
function plan(title: string, body: string, slug: string, facts: FactCols): Plan {
  const t = title.trim();

  /*
    事実と読み物が同居。所要時間の行だけ落として残りを移す。
    ただし durationText が空なら、その行はページ上の唯一の所要時間の
    記載なので落とさない。
  */
  if (/所要時間・年齢制限/.test(t)) {
    const kept = facts.durationText
      ? body.split("\n").filter((l) => !DURATION_LINE.test(l)).join("\n").trim()
      : body;
    if (kept.length < 30) return { action: "drop", why: "所要時間を除くと残らない" };
    return { action: "move", kind: "practical", heading: "訪問前に知っておきたいこと", body: kept };
  }

  // 名前に反して中身は読み物。実データで確認済み。
  if (/見どころ・体験内容/.test(t)) {
    return { action: "move", kind: "highlight", heading: null, body };
  }

  /*
    summary の言い換え。RESCUE にあるものだけ拾う。

    heading は null にしない。「概要」のままだと summary の焼き直しに
    見えるが、既定ラベル任せにすると他の節と label がぶつかる
    (ザ・シャードでは RESCUE した概要と「ショップ・飲食」が
    どちらも practical になり、「訪問のヒント」が2つ並んだ)。
    kind に応じた具体的な見出しを与える。
  */
  if (/^概要|とは[？?]\s*$|について\s*$/.test(t)) {
    const kind = RESCUE[slug];
    if (!kind) return { action: "drop", why: "summary の言い換え" };
    /*
      1スポットに「概要」系が2本あることがある(セント・ポールの
      「概要」+「セント・ポール大聖堂の有名な理由」、ビッグベンの
      「ビッグ・ベンとは？」+「内部見学について」など)。
      kind から見出しを作ると同じ文字列が並ぶので、
      「概要」以外は元の見出しをそのまま使う。
    */
    if (!/^概要$/.test(t)) return { action: "move", kind, heading: t, body };
    const heading =
      kind === "history" ? "成り立ち"
      : kind === "trivia" ? "この場所の豆知識"
      : kind === "practical" ? "基本情報"
      : kind === "highlight" ? "この場所の見どころ"
      : "この場所について";
    return { action: "move", kind, heading, body };
  }

  /*
    事実。対応するカラムが埋まっているときだけ捨てる。
    空のまま捨てると、そのページから料金やアクセスの記載が丸ごと消える。
  */
  if (/アクセス|行き方|最寄|所在地|^場所|出発場所|集合/.test(t)) {
    return facts.nearestStation
      ? { action: "drop", why: "アクセス(カラムが持つ)" }
      : { action: "move", kind: "practical", heading: t, body };
  }
  if (/料金|チケット|入場料|価格|含まれるもの|含まれる内容/.test(t)) {
    return facts.priceAdult
      ? { action: "drop", why: "料金(カラムが持つ)" }
      : { action: "move", kind: "practical", heading: t, body };
  }
  if (/開館|開園|開場|営業|オープン|開閉|運行時間/.test(t)) {
    return facts.openingHours
      ? { action: "drop", why: "開館時間(カラムが持つ)" }
      : { action: "move", kind: "practical", heading: t, body };
  }
  if (/所要時間|滞在時間|見学時間/.test(t)) {
    return facts.durationText
      ? { action: "drop", why: "所要時間(カラムが持つ)" }
      : { action: "move", kind: "practical", heading: t, body };
  }

  // 読み物。
  const kind: StoryKind | null =
    /見どころ|必見|ハイライト|見られるもの|展示|体験内容|景観|楽しみ方|できること/.test(t) ? "highlight"
    : /歴史|由来|建築|設計|創立|誕生|変遷/.test(t) ? "history"
    : /豆知識|エピソード|裏話|なぜ/.test(t) ? "trivia"
    : /服装|持ち物|注意|年齢制限|予約|よくある質問|アクセシビリティ|ドレスコード|混雑|ベスト|おすすめの訪問|対象年齢|対応言語|多言語/.test(t) ? "practical"
    : /ショップ|飲食|食事|カフェ|レストラン|お土産|ギフト|購入/.test(t) ? "practical"
    : null;

  if (kind) {
    /*
      heading を null にできるのは「既定ラベルと同じ意味」のときだけ。

      「ショップ・飲食」を null にすると既定ラベルの「訪問のヒント」で
      描かれ、何の節なのか分からなくなる(ザ・シャードで実際に
      「訪問のヒント」が2つ並んだ)。practical は守備範囲が広いので、
      元の見出しを残すほうが読者に親切。
      null にしてよいのは kind の既定ラベルと一対一で対応する見出しに限る。
    */
    const genericFor: Record<StoryKind, RegExp> = {
      highlight: /^(見どころ|見どころ・体験内容|ハイライト)$/,
      // 「歴史・豆知識」は既定ラベル「歴史」に寄せない。中身を確認したところ
      // 歴史の記述が中心だが、豆知識も混ざる。元の見出しのほうが正確。
      history: /^歴史$/,
      trivia: /^豆知識$/,
      practical: /^(訪問のヒント|実用情報)$/,
      context: /^$/,
    };
    const generic = genericFor[kind].test(t);
    return { action: "move", kind, heading: generic ? null : t, body };
  }

  // 残り。そのスポット固有の話なので見出しごと残す。
  if (body.trim().length >= 60) {
    return { action: "move", kind: "context", heading: t, body };
  }
  return { action: "drop", why: "分類できず本文も短い" };
}

async function main() {
  const attractions = await db.attraction.findMany({
    where: SLUG ? { slug: SLUG } : undefined,
    include: { sections: { orderBy: { displayOrder: "asc" } } },
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  // --resume: 既に投入済みのスポットを飛ばす。途中で切れたときの再開用。
  const done = new Set<string>();
  if (RESUME) {
    // authored しか持たないスポットを「投入済み」と数えないよう、
    // migrated の行があるかどうかで判定する。
    const rows = await db.attractionStory.groupBy({
      by: ["attractionId"],
      where: { source: "migrated" },
    });
    rows.forEach((r) => done.add(r.attractionId));
    console.log(`--resume: ${done.size}スポットは投入済みとして飛ばします\n`);
  }

  const tally: Record<string, number> = {};
  let moved = 0;
  let dropped = 0;
  let skipped = 0;
  let authoredSkipped = 0;
  const emptied: string[] = [];

  for (const a of attractions) {
    if (RESUME && done.has(a.id)) {
      skipped++;
      continue;
    }
    // 書き直し済み(authored がある)スポットには手を出さない。
    //
    // source を見て削除を避けるだけでは足りない。ここで旧 sections から
    // 作り直すと、authored の隣に古い history / highlight がもう一度
    // 積まれ、同じ話題の節が2本並ぶ(実際 tower-of-london で再現した)。
    // 書き直し済みということは旧 sections はすでに読み直された後なので、
    // 移行としてやることは無い。作り直すなら seed-attraction-stories-*.ts を流す。
    const authored = await db.attractionStory.count({
      where: { attractionId: a.id, source: "authored" },
    });
    if (authored > 0) {
      authoredSkipped++;
      continue;
    }

    const rows: { kind: StoryKind; heading: string | null; body: string }[] = [];
    const log: string[] = [];

    for (const s of a.sections) {
      const body = (s.description ?? "").trim();
      if (!body) continue;
      const p = plan(s.title, body, a.slug, a);
      if (p.action === "drop") {
        dropped++;
        tally[`drop:${p.why}`] = (tally[`drop:${p.why}`] ?? 0) + 1;
        log.push(`    - ${s.title} … ${p.why}`);
        continue;
      }
      moved++;
      tally[`move:${p.kind}`] = (tally[`move:${p.kind}`] ?? 0) + 1;
      rows.push({ kind: p.kind, heading: p.heading, body: p.body });
      log.push(`    + [${p.kind}] ${p.heading ?? "(既定ラベル)"} ← ${s.title}`);
    }

    if (rows.length === 0) emptied.push(a.name);

    if (SLUG) {
      console.log(`\n## ${a.name} (${a.slug})`);
      log.forEach((l) => console.log(l));
    }

    if (!APPLY) continue;

    // 作り直し。何度流しても同じ結果になるようにする。
    //
    // ★ source: "migrated" の行だけを消すこと。
    // seed-attraction-stories-*.ts で手で書いた本文は "authored" で入っており、
    // ここで巻き添えにすると書き直しが消える。実際、最寄駅の補完後に
    // このスクリプトを流し直して level 5 / level 4 の書き直しを消している。
    await db.attractionStory.deleteMany({
      where: { attractionId: a.id, source: "migrated" },
    });
    if (rows.length) {
      await db.attractionStory.createMany({
        data: rows.map((r, i) => ({
          attractionId: a.id,
          kind: r.kind,
          heading: r.heading,
          body: r.body,
          displayOrder: i + 1,
          source: "migrated",
        })),
      });
    }
  }

  if (!SLUG) {
    console.log(
      `対象 ${attractions.length}スポット` +
        (skipped ? ` (うち${skipped}件は投入済みで飛ばした)` : "") +
        (authoredSkipped
          ? ` (うち${authoredSkipped}件は書き直し済みなので触っていない)`
          : "") +
        ` / 移行 ${moved}節 / 破棄 ${dropped}節\n`,
    );
    console.log("=== 内訳 ===");
    Object.entries(tally)
      .sort((x, y) => y[1] - x[1])
      .forEach(([k, n]) => console.log(`  ${k.padEnd(34)} ${String(n).padStart(4)}`));
    if (emptied.length) {
      console.log(`\n★ 読み物が0本になるスポット (${emptied.length}件):`);
      emptied.forEach((n) => console.log(`  ${n}`));
    }
  }

  if (!APPLY) console.log("\n投入するには --apply を付けて再実行してください。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
