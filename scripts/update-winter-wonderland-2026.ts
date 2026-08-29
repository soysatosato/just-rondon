/**
 * ウィンター・ワンダーランドを2026年開催の情報へ更新する。
 *
 *   npx tsx scripts/update-winter-wonderland-2026.ts           # 差分を表示
 *   npx tsx scripts/update-winter-wonderland-2026.ts --apply   # DBへ反映
 *
 * このスポットは毎年開催の季節イベントで、DB上は2025年版のまま
 * (name に「（2025）」が入り、本文も2025年の日程とラインナップ)止まって
 * いた。level 4 の他26件に「着いてからの歩き方」を入れる作業の途中で
 * 気づいたもの。
 *
 * 歩き方(AttractionVisitStep)を入れる前に、まず年次情報を直す。古い年の
 * 日程が載ったページに現地での歩き方だけ足しても、読者は混乱する。
 *
 * slug は "hyde-park-winter-wonderland-2025" のまま変えていない。
 * 変えると既存URLが404になり、検索流入と外部リンクを失うため。
 * 表示名と本文だけを毎年更新する運用にする。
 *
 * 来年やること: このファイルの YEAR 定数と DATES、目玉アトラクションを
 * 公式サイトで確認して差し替え、再実行する。
 *
 * 出典(2026-08時点):
 * - 2026年の会期は11/19(木)〜2027/1/3(日)、クリスマス当日のみ休み。
 *   22:00まで開場。11/19〜20と11/23〜26は12:00開場。
 * - 要事前予約(日時指定)。11月の月〜木はオフピーク£1枠があり、
 *   前年比で3倍に拡大された。予約手数料は表示価格に込み。
 * - 2026年の新規: ピーター・パンをテーマにした Magical Ice Kingdom、
 *   Gandeys K-Pop Dragon Circus。アトラクション総数は約150。
 *   https://hydeparkwinterwonderland.com/
 *
 * 毎年変わる。来年そのまま流用しないこと。
 */

import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");
const SLUG = "hyde-park-winter-wonderland-2025";

/** 表示名。slug は変えずにここだけ毎年更新する。 */
const NAME = "ハイドパーク ウィンターワンダーランド（2026）";

const TAGLINE = "ロンドン最大のクリスマスパーク、ハイドパークに降臨";

const SUMMARY =
  "ハイドパークで毎年開催されるロンドン最大級のクリスマスイベント。2026年は11月19日から2027年1月3日まで（クリスマス当日は休み）。巨大観覧車、氷の王国、サーカス、アイススケート、マーケットなど約150のアトラクションが並ぶ。入場は日時指定の事前予約制で、11月の月〜木にはオフピークの£1枠がある。";

/** 差し替えるセクション。id 指定なのは他スポットを巻き込まないため。 */
const SECTION_UPDATES: { id: number; title: string; description: string }[] = [
  {
    id: 370,
    title: "概要",
    description: `**Winter Wonderland London（ウィンターワンダーランド）** は、ハイドパークで毎年開催される、ロンドン最大級のクリスマスフェスティバルです。

アイススケート、サーカスショー、巨大観覧車、マーケット、テーマバーなど、約150のアトラクションが並び、**朝から夜まで楽しめる冬の王国**になります。

**2026年の会期は11月19日（木）から2027年1月3日（日）まで**。クリスマス当日（12月25日）のみ休みです。閉場は毎日22:00。会期最初の数日（11月19〜20日、11月23〜26日）は12:00開場と、通常より遅く始まります。`,
  },
  {
    id: 371,
    title: "アトラクション",
    description: `**2026年の目玉**：

### ■ 氷の世界
- **Magical Ice Kingdom**：2026年のテーマは*ピーター・パン*。500トン超の氷と雪で作られた彫刻の中を歩きます
- **Real Ice Slide**：実際に滑れる氷の滑り台

### ■ ショー
- **Gandeys K-Pop Dragon Circus**：2026年の新作サーカス
- そのほかアクロバット系のファミリーショー

### ■ 絶叫・体験系
- **Giant Observation Wheel**：高さ60m超の観覧車から夜景を眺望
- **Munich Looping**：世界最大級の移動式ローラーコースター
- **Aeronaut Starflyer**：空を舞う高速系ライド

伝統的なメリーゴーラウンドやヘルタースケルターも健在です。

なお、**入場料と各アトラクションの料金は別**です。乗り物やアイススケートは中で個別にチケットを買う仕組みなので、予算は多めに見ておいてください。`,
  },
];

/**
 * チケットの説明は本文のどこにも独立した節が無かったので、
 * 「概要」の次に入る形で新規に作る。
 */
const NEW_SECTION = {
  title: "チケットと予約",
  displayOrder: 2,
  description: `入場には**日時指定の事前予約が必要**です（当日券は売り切れることがあります）。

- **11月の月〜木はオフピーク£1枠**があり、2026年は前年の3倍に拡大されました
- 週末と12月中旬以降は最も高く、早く埋まります
- 表示価格に予約手数料が含まれているので、決済時に金額が増えることはありません

**入場券は「会場に入る権利」だけ**で、観覧車・アイススケート・Bar Ice・一部のショーはそれぞれ別料金です。無料で楽しめるのはマーケットの散策と雰囲気そのもの。何に乗るか決めてから行くと、支払いで戸惑いません。`,
};

async function main() {
  const attraction = await db.attraction.findUnique({
    where: { slug: SLUG },
    select: { id: true, name: true, sections: { select: { id: true, title: true } } },
  });

  if (!attraction) {
    console.log(`SKIP ${SLUG} — 該当スポットなし`);
    return;
  }

  console.log(`=== ${attraction.name}`);
  console.log(`  name    : ${attraction.name}\n         → ${NAME}`);
  console.log(`  tagline → ${TAGLINE}`);
  console.log(`  summary → ${SUMMARY.slice(0, 60)}…`);
  for (const u of SECTION_UPDATES) {
    const cur = attraction.sections.find((s) => s.id === u.id);
    console.log(
      cur
        ? `  section id:${u.id} 「${cur.title}」を更新 (${u.description.length}字)`
        : `  section id:${u.id} が見つかりません — スキップします`,
    );
  }
  const hasNew = attraction.sections.some((s) => s.title === NEW_SECTION.title);
  console.log(
    hasNew
      ? `  section 「${NEW_SECTION.title}」は作成済み — スキップします`
      : `  section 「${NEW_SECTION.title}」を新規作成 (${NEW_SECTION.description.length}字)`,
  );

  if (!APPLY) {
    console.log("\n反映するには --apply を付けて再実行してください。");
    return;
  }

  await db.attraction.update({
    where: { id: attraction.id },
    data: { name: NAME, tagline: TAGLINE, summary: SUMMARY },
  });

  for (const u of SECTION_UPDATES) {
    if (!attraction.sections.some((s) => s.id === u.id)) continue;
    await db.attractionSection.update({
      where: { id: u.id },
      data: { title: u.title, description: u.description },
    });
  }

  // 二重作成を防ぐ。タイトルで存在確認してから作る。
  if (!hasNew) {
    await db.attractionSection.create({
      data: {
        attractionId: attraction.id,
        displayOrder: NEW_SECTION.displayOrder,
        title: NEW_SECTION.title,
        description: NEW_SECTION.description,
      },
    });
  }

  console.log("→ 更新しました");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
