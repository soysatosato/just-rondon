/**
 * ロンドンパス(Go City All-Inclusive)の対象スポットに印を付ける。
 *
 *   npx tsx scripts/set-london-pass-attractions.ts           # 差分を表示
 *   npx tsx scripts/set-london-pass-attractions.ts --apply   # DBへ反映
 *
 * 出典: Go City の対象一覧(2026年9月時点、約110件)。
 *   https://gocity.com/london/en-us/products/all-inclusive
 *   https://www.londoncitypass.com/en/attractions/
 *
 * ## 立てる条件を狭くしてある
 *
 * 対象一覧に載っていることと、読者にとって「パスで入れる」ことは違う。
 * true にするのは**パスがそのスポットの有料入場料を肩代わりする場合だけ**。
 *
 * とくに重要なのが、元から無料の館を外すこと。Go City の一覧には
 * 大英博物館・テート・モダン・自然史博物館・サイエンス・ミュージアム・
 * 帝国戦争博物館が載っているが、パスが付けるのは音声ガイド、
 * 館内ツアー、IMAX、土産のガイドブックであって入場料ではない。
 * これらに「ロンドンパス対象」と出すと、/sightseeing/passes が
 * 「主要館は元から無料だからパスは要らない」と書いている隣で、
 * サイトが自分の結論と反対の合図を出すことになる。
 *
 * 同じ理由で次も外した:
 * - ビスター・ヴィレッジ(対象は村ではなく送迎コーチ。村の入場は元から無料)
 * - カティサークのリグクライム(通常入場とは別の追加体験)
 * - バッキンガム宮殿(ステートルームは年により公開期間中の条件付き。
 *   毎年変わる条件を boolean で持つと必ず古くなる)
 * - サイエンス・ミュージアムのIMAX、ピーター・ハリソン・プラネタリウム
 *   (館は無料/別料金で、対象は上映のみ)
 *
 * 明示的に対象外と告知されているもの(チャーチル戦争指令室、
 * ワーナー・ブラザース スタジオツアー、国会議事堂ツアー、
 * シーライフ水族館ほかマーリン系)も当然 false のまま。
 *
 * ## 更新するとき
 *
 * 販売側の対象一覧は入れ替わる。**古い「対象」表示は無表示より害が大きい**
 * ——読者がその施設を当てにしてパスを買うため。一覧を更新したら
 * lib/sightseeing/passes.ts の PASS_AS_OF も一緒に動かすこと。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

/**
 * 対象スポット。note を持つ行は「対象だが条件付き」。
 *
 * 並びは分類順(名所 → 王室 → 博物館 → 体験 → スタジアム → 郊外)。
 * 一覧を目で照合するときにこの順のほうが抜けに気づく。
 */
const COVERED: { slug: string; note?: string }[] = [
  /* ---- 中心部の名所 ---- */
  { slug: "tower-of-london" },
  { slug: "westminster-abbey" },
  { slug: "st-pauls-cathedral" },
  { slug: "london-tower-bridge" },
  { slug: "monument-to-the-great-fire-of-london" },
  { slug: "the-view-from-the-shard" },
  { slug: "london-eye" },
  { slug: "royal-albert-hall" },
  { slug: "shakespeares-globe-guided-tour" },
  { slug: "hms-belfast" },
  { slug: "old-royal-naval-college" },

  /* ---- 王室関連 ---- */
  { slug: "kensington-palace" },
  { slug: "hampton-court-palace" },
  { slug: "windsor-castle" },
  { slug: "kings-gallery-buckingham-palace" },
  { slug: "royal-mews" },

  /* ---- 博物館・美術館(いずれも有料館) ---- */
  { slug: "london-transport-museum" },
  { slug: "museum-of-brands-london" },
  { slug: "florence-nightingale-museum" },
  { slug: "household-cavalry-museum" },
  { slug: "moco-museum-london" },
  { slug: "royal-observatory-greenwich" },

  /* ---- 体験・娯楽 ---- */
  { slug: "frameless-london" },
  { slug: "madame-tussauds-london" },
  { slug: "f1-drive-london" },
  { slug: "chimney-lift-battersea-power-station" },
  { slug: "the-dare-skywalk-tottenham-hotspur-stadium" },

  /* ---- スタジアムツアー ---- */
  { slug: "tottenham-hotspur-stadium-tour" },
  { slug: "arsenal-emirates-stadium-tour" },
  { slug: "chelsea-stamford-bridge-tour" },
  { slug: "wembley-stadium-tour" },
  { slug: "london-stadium-tour" },
  { slug: "kia-oval-cricket-tour" },

  /* ---- 郊外 ---- */
  { slug: "kew-gardens-london" },
  { slug: "london-zoo" },
  { slug: "chessington-world-of-adventures" },
  { slug: "legoland-windsor" },

  /* ---- 条件付き ---- */
  {
    slug: "hop-on-hop-off-bus-tour-london",
    note: "対象は Big Bus の2日券です。トゥートバスなど他社のバスには乗れません",
  },
];

async function main() {
  const slugs = COVERED.map((c) => c.slug);
  const rows = await db.attraction.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, name: true, londonPass: true, londonPassNote: true },
  });

  const missing = slugs.filter((s) => !rows.some((r) => r.slug === s));
  for (const m of missing) console.log(`SKIP ${m} — 該当スポットなし`);

  /* 対象から外れた行を戻す。一覧から消したのに印が残ると、
     「対象」表示だけが生き続ける。 */
  const stale = await db.attraction.findMany({
    where: { londonPass: true, slug: { notIn: slugs } },
    select: { slug: true, name: true },
  });
  for (const s of stale) console.log(`外す   ${s.slug} — ${s.name}`);

  let changed = 0;
  for (const c of COVERED) {
    const row = rows.find((r) => r.slug === c.slug);
    if (!row) continue;
    const note = c.note ?? null;
    if (row.londonPass && row.londonPassNote === note) continue;
    changed++;
    console.log(`付ける ${c.slug} — ${row.name}${note ? `（注記あり）` : ""}`);
  }

  console.log(
    `\n対象 ${COVERED.length}件 / 変更 ${changed + stale.length}件` +
      `${missing.length ? ` / 見つからず ${missing.length}件` : ""}`,
  );

  if (!APPLY) {
    console.log("--apply を付けるとDBへ反映します。");
    return;
  }

  if (stale.length > 0) {
    await db.attraction.updateMany({
      where: { slug: { in: stale.map((s) => s.slug) } },
      data: { londonPass: false, londonPassNote: null },
    });
  }

  for (const c of COVERED) {
    if (!rows.some((r) => r.slug === c.slug)) continue;
    await db.attraction.update({
      where: { slug: c.slug },
      data: { londonPass: true, londonPassNote: c.note ?? null },
    });
  }

  const total = await db.attraction.count({ where: { londonPass: true } });
  console.log(`反映しました。現在の対象は ${total}件です。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
