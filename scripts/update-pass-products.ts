/**
 * 観光パス系ページに「どのパスが誰に向くか」の判断材料を足す。
 *
 *   npx tsx scripts/update-pass-products.ts           # 差分を表示
 *   npx tsx scripts/update-pass-products.ts --apply   # DBへ反映
 *
 * これらのページには「着いてからの歩き方」を書けない(物理的な場所がない)。
 * 代わりに必要なのは、買う前の判断材料——とくに
 * 「自分にとって元が取れるのか」という一点。
 *
 * ロンドンパスの最大の注意点は、ロンドンの主要な博物館・美術館が軒並み
 * 無料だということ。大英博物館、ナショナル・ギャラリー、V&A、テート、自然史博物館、
 * サイエンス・ミュージアムはいずれも入場無料なので、パスの価値はゼロ。
 * 「100以上の施設に入れる」という宣伝文句だけを見て買うと、
 * 実際には行きたい場所の多くが最初から無料だった、ということが起こる。
 * これを書かないページは読者の役に立たない。
 *
 * クリスマス・ライト・バスツアーは季節商品で、ページが2025年版のまま
 * 止まっていた。2026-27年の会期へ更新する。
 *
 * 出典(2026-08時点):
 * - ロンドンパス: 1日券£99前後から、2日£139、3日£169、最長10日。
 *   対象は約111施設。ただし大英博物館・ナショナル・ギャラリー・V&A・
 *   テート・自然史博物館・サイエンス・ミュージアムは元から入場無料。
 *   チャーチル戦争指令室、シーライフ水族館、国会議事堂ツアーは対象外。
 *   バッキンガム宮殿は2026年は8/1〜9/27の期間のみ、12時以降の当日入場。
 *   乗り降り自由バスとテムズ川クルーズを含む(単体なら£35〜45相当)。
 *   特別展・音声ガイド・イベントは対象外のことがある。
 *   https://londontravelplanning.com/guide-to-the-london-pass/
 * - クリスマス・ライト・バスツアー: 2026-27シーズンは11/13〜2027/1/3。
 *   所要約90分(渋滞で2時間になることも)。運行会社は複数
 *   (ゴールデン・ツアーズ、トゥートバス、ビッグ・バス等)。
 *   オックスフォード・ストリート、リージェント・ストリート、
 *   トラファルガー広場、ピカデリー・サーカスを回る。
 *   https://www.visitlondon.com/things-to-do/place/51018879-christmas-lights-bus-tour
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

type Fix = {
  sectionId: number;
  note: string;
  find: string;
  replace: string;
  /** 適用後にだけ現れる文字列。二重適用の防止に使う。 */
  done: string;
};

const FIXES: Fix[] = [
  {
    sectionId: 199,
    note:
      "ロンドンパス: ロンドンの主要博物館・美術館は元から入場無料であり、" +
      "パスの価値がゼロであることを明記する。これを書かないと" +
      "『100以上の施設』という宣伝だけで判断させることになる。",
    find:
      "**The London Pass（ロンドン・パス）** は、ロンドンの人気観光スポット100カ所以上に入場できる、デジタル形式の観光パスです。",
    replace:
      "> **買う前に必ず確認したいこと**\n" +
      "> ロンドンの主要な博物館・美術館は**もともと入場無料**です。" +
      "大英博物館、ナショナル・ギャラリー、V&A、テート・モダン／ブリテン、" +
      "自然史博物館、サイエンス・ミュージアム——これらにパスは一切必要ありません。\n" +
      "> パスが効くのは、ロンドン塔（大人£35.8〜）、ウェストミンスター寺院（£31〜）、" +
      "セント・ポール大聖堂（£27〜）といった**有料の施設**です。\n" +
      "> つまり「行きたい有料施設が1日に2〜3か所以上あるか」が損得の分かれ目になります。" +
      "無料の博物館をゆっくり回りたい旅程では、まず元が取れません。\n" +
      "\n" +
      "**The London Pass（ロンドン・パス）** は、ロンドンの人気観光スポット100カ所以上に入場できる、デジタル形式の観光パスです。",
    done: "> **買う前に必ず確認したいこと**",
  },
  {
    sectionId: 363,
    note:
      "クリスマス・ライト・バスツアー: ページが2025年版のまま。" +
      "2026-27シーズン(11/13〜2027/1/3)へ更新し、" +
      "運行会社が複数あってチケットが会社ごとに別であることを明記する。",
    find: "**Christmas Lights London by Night Bus Tour**は、ロンドンの街全体がクリスマスの光に包まれる季節限定の夜景バスツアー。",
    replace:
      "> **【2026-27シーズン】11月13日〜2027年1月3日の運行予定です。**\n" +
      "> このツアーは1社ではなく、ゴールデン・ツアーズ、トゥートバス、ビッグ・バスなど" +
      "**複数の会社がそれぞれ運行**しています。チケットは会社ごとで、他社のバスには乗れません。" +
      "所要は約90分ですが、渋滞で2時間近くかかることもあります。\n" +
      "> 日程・料金は毎年変わるため、予約前に各社の公式サイトでご確認ください。\n" +
      "\n" +
      "**Christmas Lights London by Night Bus Tour**は、ロンドンの街全体がクリスマスの光に包まれる季節限定の夜景バスツアー。",
    done: "> **【2026-27シーズン】11月13日〜2027年1月3日の運行予定です。**",
  },
];

/**
 * 表示名の年号だけを差し替える。slug は変えない
 * (変えると既存URLが404になり検索流入と外部リンクを失う)。
 */
const RENAMES: { slug: string; from: string; to: string }[] = [
  {
    slug: "christmas-lights-london-bus-tour-2025",
    from: "クリスマス・ライト・ロンドン・バスツアー 2025",
    to: "クリスマス・ライト・ロンドン・バスツアー 2026",
  },
];

async function main() {
  for (const r of RENAMES) {
    const a = await db.attraction.findUnique({
      where: { slug: r.slug },
      select: { id: true, name: true },
    });
    if (!a) {
      console.log(`SKIP ${r.slug} — 該当スポットなし`);
      continue;
    }
    if (a.name === r.to) {
      console.log(`=== ${r.slug}\n  表示名は適用済み (${r.to})`);
      continue;
    }
    if (a.name !== r.from) {
      console.log(`=== ${r.slug}\n  表示名が想定と違う (${a.name}) — スキップ`);
      continue;
    }
    console.log(`=== ${r.slug}\n  name: ${r.from} → ${r.to}`);
    if (!APPLY) continue;
    await db.attraction.update({ where: { id: a.id }, data: { name: r.to } });
    console.log("  → 更新しました");
  }

  for (const fix of FIXES) {
    const section = await db.attractionSection.findUnique({
      where: { id: fix.sectionId },
      select: { id: true, title: true, description: true, attraction: { select: { name: true } } },
    });

    if (!section) {
      console.log(`SKIP id:${fix.sectionId} — セクションが見つかりません`);
      continue;
    }

    const before = section.description ?? "";
    console.log(`\n=== ${section.attraction.name} / ${section.title} (id:${section.id})`);
    console.log(`  ${fix.note}`);

    if (before.includes(fix.done)) {
      console.log("  → 適用済み");
      continue;
    }
    if (!before.includes(fix.find)) {
      console.log("  → 対象の文言なし(本文が変わった可能性)");
      continue;
    }

    fix.replace.split("\n").slice(0, 4).forEach((l) => console.log(`  + ${l}`));

    if (!APPLY) continue;
    await db.attractionSection.update({
      where: { id: section.id },
      data: { description: before.replace(fix.find, fix.replace) },
    });
    console.log("  → 更新しました");
  }

  if (!APPLY) console.log("\n反映するには --apply を付けて再実行してください。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
