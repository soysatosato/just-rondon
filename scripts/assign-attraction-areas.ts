/**
 * Attraction.area を埋める。
 *
 * 座標からの自動導出はしない。理由は3つある:
 *
 * 1. テムズ川。テート・モダンとシェイクスピアズ・グローブは対岸なので
 *    緯度経度ではシティの矩形に入るが、歩く単位としてはサウスバンク。
 *    川を渡る/渡らないは徒歩の体験を決定的に変える。
 * 2. 象徴性。セント・ポール大聖堂はシティの中心的存在だが、矩形を
 *    素直に引くとシティの北西外に落ちる。
 * 3. 隣接エリアの境界。ナショナル・ギャラリー(トラファルガー広場)は
 *    ソーホーともウェストミンスターとも言えるが、観光動線としては
 *    「広場から官庁街へ下る」ほうが自然なのでウェストミンスターに置く。
 *
 * どれも境界線をいくら精緻にしても表現できないので、135件を手で割る。
 * 判断に迷ったものは UNASSIGNED に置いて null のままにしてある。
 * 無理に寄せると「半日この辺りを歩く」の精度が落ちるため。
 *
 * 実行: npx tsx scripts/assign-attraction-areas.ts
 *      npx tsx scripts/assign-attraction-areas.ts --dry
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * slug → エリア。
 *
 * components/sightseeing/areas/areas.ts の AreaSlug と一致させること。
 * ここに無い slug は area = null のままになる。
 */
const ASSIGNMENTS: Record<string, string[]> = {
  /**
   * サウスバンク。テムズ川南岸を西から東へ歩く帯。
   *
   * ロンドン・アイからテート・モダンまで、川沿いの遊歩道が
   * ほぼ一本道で繋がっている。北岸の観光地とは橋でしか行き来
   * できないので、回遊単位としては独立させるのが正しい。
   */
  southbank: [
    "london-eye",
    "sea-life-london-aquarium",
    "london-dungeon",
    "shreks-adventure-london",
    "merlin-london-attractions-pass",
    "nye-london-eye-riverside-rooms",
    "paddington-bear-experience",
    "florence-nightingale-museum",
    // 川の南側。座標だけ見るとシティ寄りだが、歩くならサウスバンクの帯。
    "tate-modern",
    "shakespeares-globe-guided-tour",
    "the-clink-prison-museum",
    "london-bridge-experience-and-tombs",
    "the-view-from-the-shard",
    // 両岸を繋ぐ橋。南岸の遊歩道からテート・モダンへ渡る動線上にある。
    "millennium-bridge",
    "lambeth-palace",
  ],

  /**
   * ウェストミンスター／セント・ジェームズ。王室と政治の中枢。
   *
   * バッキンガム宮殿・議事堂・寺院が徒歩圏に固まっていて、
   * 衛兵交代式を軸に半日が組める、最も密度の高いエリア。
   */
  westminster: [
    "buckingham-palace",
    "changing-the-guard-buckingham-palace",
    "royal-mews",
    "kings-gallery-buckingham-palace",
    "westminster-abbey",
    "big-ben",
    "houses-of-parliament-self-guided-audio-tour",
    "parliament-square",
    "jewel-tower-westminster",
    "churchill-war-rooms",
    "banqueting-house-london",
    "household-cavalry-museum",
    "st-jamess-palace",
    "clarence-house-london",
    "spencer-house-london",
    "royal-academy-of-arts",
    // トラファルガー広場。ソーホーとの境界だが、官庁街へ下る動線に置く。
    "national-gallery-london",
    "the-fourth-plinth-trafalgar-square",
    "tate-britain",
  ],

  /**
   * ソーホー／コヴェント・ガーデン。劇場・買い物・夜。
   *
   * 大英博物館を北端、レスター・スクエアを南端とする範囲。
   * ミュージカル観劇の前後に歩く時間帯が主戦場になる。
   */
  soho: [
    "british-museum-london",
    "london-transport-museum",
    "royal-ballet-opera-london",
    "movie-statue-street-leicester-square",
    "the-crystal-maze-live-experience-london",
    "monopoly-lifesized-london",
    "wee-toast-tours",
    "sir-john-soanes-museum",
    "moco-museum-london",
    "frameless-london",
    "bt-tower-london",
    "grant-museum-of-zoology",
  ],

  /**
   * シティ／タワー地区。金融街と中世。
   *
   * 平日と週末で街の顔が完全に変わる。高層ビルの展望台が
   * 集中しているのもここ。ロンドン塔とタワーブリッジが東端。
   */
  city: [
    // 矩形では外れるが、シティの象徴なので明示的にここへ。
    "st-pauls-cathedral",
    "tower-of-london",
    "london-tower-bridge",
    "sky-garden-london",
    "20-fenchurch-street-walkie-talkie",
    "the-gherkin-30-st-mary-axe",
    "leadenhall-market-london",
    "monument-to-the-great-fire-of-london",
    "mansion-house-london",
    "barbican-centre",
    "barbican-art-gallery",
    "the-charterhouse-london",
  ],

  /**
   * ショーディッチ／イーストエンド。マーケットとストリートアート。
   *
   * スポット登録数は6エリア中最少。記事は個別スポットより
   * 「歩くこと自体」と曜日ごとのマーケットを軸に組む必要がある。
   */
  shoreditch: [
    "columbia-road-flower-market",
    "ballie-ballerson-london",
    "alcotraz-immersive-prison-cocktail-experience",
    "jack-the-ripper-museum",
    "young-va-bethnal-green",
  ],

  /**
   * グリニッジ。世界遺産地区。
   *
   * 中心部から離れている代わりに、エリア内が徒歩で完結する。
   * 往復の交通時間があるので、半日ではなく1日の単位になりやすい。
   */
  greenwich: [
    "royal-observatory-greenwich",
    "peter-harrison-planetarium-greenwich",
    "old-royal-naval-college",
    "queens-house-greenwich",
    "royal-museums-greenwich-day-pass",
    "cutty-sark-rig-climb-experience",
  ],
};

/**
 * 意図的に null のままにするもの(記録用。コードとしては未使用)。
 *
 * - 郊外(ウィンザー城、キューガーデン、ハンプトン・コート、スタジアム群):
 *   そもそも「この辺りを歩く」の対象外。単独で行って帰る目的地。
 * - 市内でも回遊に乗らないもの(ハイドパーク周辺、ケンジントン、
 *   バタシー発電所、帝国戦争博物館など): 6エリアのいずれからも
 *   歩いて外れる。エリアを増やすより null が正しい。
 * - 出発地が固定されないツアー・パス類(ロンドンパス、バスツアー各種):
 *   街区に属さない商品なので、エリアに紐付けると誤誘導になる。
 */

async function main() {
  const dry = process.argv.includes("--dry");

  const slugToArea = new Map<string, string>();
  for (const [area, slugs] of Object.entries(ASSIGNMENTS)) {
    for (const slug of slugs) {
      const existing = slugToArea.get(slug);
      if (existing) {
        throw new Error(
          `slug "${slug}" が ${existing} と ${area} の両方に入っています`,
        );
      }
      slugToArea.set(slug, area);
    }
  }

  const all = await prisma.attraction.findMany({
    select: { slug: true, name: true, area: true },
  });
  const known = new Set(all.map((a) => a.slug));

  // 存在しない slug を書いていたら、黙って無視せず止める。
  const ghosts = [...slugToArea.keys()].filter((s) => !known.has(s));
  if (ghosts.length > 0) {
    throw new Error(`DBに存在しない slug: ${ghosts.join(", ")}`);
  }

  let updated = 0;
  for (const [slug, area] of slugToArea) {
    const current = all.find((a) => a.slug === slug);
    if (current?.area === area) continue;

    if (!dry) {
      await prisma.attraction.update({ where: { slug }, data: { area } });
    }
    updated++;
  }

  const counts = new Map<string, number>();
  for (const area of slugToArea.values()) {
    counts.set(area, (counts.get(area) ?? 0) + 1);
  }

  console.log(dry ? "=== dry run ===" : "=== 更新しました ===");
  for (const [area, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${area.padEnd(12)} ${n}件`);
  }
  console.log(`  ${"(未分類)".padEnd(12)} ${all.length - slugToArea.size}件`);
  console.log(`更新対象: ${updated}件 / 全${all.length}件`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
