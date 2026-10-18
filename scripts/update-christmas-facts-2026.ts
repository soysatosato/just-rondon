/**
 * クリスマス特集(/events/christmas)を作るときに見つかった、DB の古い事実を直す。
 *
 *   npx tsx scripts/update-christmas-facts-2026.ts           # 差分を表示
 *   npx tsx scripts/update-christmas-facts-2026.ts --apply   # DBへ反映
 *
 * 2026-10-18 に公式発表と突き合わせた3件:
 *
 * 1. 年間カレンダーの「Regent Street Christmas Lights Switch-On」が
 *    2026-11-06 だった。6日は2025年の点灯日。2026年は11月5日(木)で、
 *    17:00〜21:00 に通りが車両通行止めになる(Regent Street 公式、10月1日)。
 * 2. 「クリスマス・ライト・ロンドン・バスツアー 2026」の説明が、オックスフォード・
 *    ストリートを通る前提だった。10月26日からオーチャード・ストリート〜
 *    グレート・ポートランド・ストリートは車両通行止め(TfL)。運行会社の案内は
 *    まだ通る書き方のままなので、断定せずに「区間を走れない」とだけ書く。
 *    見どころの「オックスフォードストリートのサステナブル・スターライト」は
 *    前年までの飾りで、2026年は一部がハリー・ポッターの飾りになる。
 * 3. 「チェルシー・ウィンタービレッジ(2026)」の大人料金が £23.95〜 だった。
 *    主催者の券売ページは大人 £18〜£29.95。
 *
 * 会期の本体は lib/christmas が持つ。ここで直すのは、特集の外(年間カレンダーと
 * スポットのページ)に残っていた値だけ。
 *
 * 2026-10-18 に流した。それ以前の値:
 *   Event Regent Street switch-on   startDate/endDate 2026-11-06、website null
 *   christmas-lights-london-bus-tour summary「…リージェントストリートやオックスフォード
 *                                    ストリートなど、光り輝く主要スポットを約90分で堪能。…」
 *   AttractionStory 2198             行程例に「オックスフォードストリートのサステナブル・
 *                                    スターライト」の1行
 *   chelsea-winter-village           priceAdult "£23.95〜"
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

const BUS_TOUR = "christmas-lights-london-bus-tour";
const CHELSEA = "chelsea-winter-village";

const BUS_SUMMARY =
  "ロンドンの夜を彩るクリスマスイルミネーションを、オープントップバスで巡るツアー。リージェント・ストリートやピカデリー・サーカス、トラファルガー広場などの灯りを約75〜90分で回る。2026年10月26日から、オックスフォード・ストリートのオーチャード・ストリート〜グレート・ポートランド・ストリートの区間は車両通行止めで、バスはこの区間を走れない。運行会社の案内はまだこの通りを含む書き方なので、通る道は乗る前に確かめたい。";

const OLD_STAR_LINE = "- **オックスフォードストリートのサステナブル・スターライト**\n";

function show(label: string, before: unknown, after: unknown) {
  console.log(`\n[${label}]`);
  console.log("  before:", JSON.stringify(before));
  console.log("  after: ", JSON.stringify(after));
}

async function main() {
  // 1. リージェント・ストリートの点灯日
  const regent = await db.event.findFirst({
    where: { title: { startsWith: "Regent Street Christmas Lights Switch-On" } },
  });
  if (!regent) throw new Error("リージェント・ストリートの行が見つからない");
  const regentDate = new Date("2026-11-05T00:00:00.000Z");
  const regentWebsite = "https://www.regentstreetonline.com/news/festive-spirits-return-for-2026";
  show(
    "Event: Regent Street switch-on",
    { start: regent.startDate, end: regent.endDate, website: regent.website },
    { start: regentDate, end: regentDate, website: regentWebsite },
  );

  // 2. バスツアーの説明と見どころ
  const bus = await db.attraction.findUnique({
    where: { slug: BUS_TOUR },
    include: { stories: true },
  });
  if (!bus) throw new Error(`${BUS_TOUR} が見つからない`);
  show("Attraction.summary: bus tour", bus.summary, BUS_SUMMARY);
  const starStories = bus.stories.filter((s) => s.body.includes(OLD_STAR_LINE));
  for (const story of starStories) {
    show(
      `AttractionStory ${story.id}: bus tour highlight`,
      story.body,
      story.body.replace(OLD_STAR_LINE, ""),
    );
  }

  // 3. チェルシー・ウィンタービレッジの料金
  const chelsea = await db.attraction.findUnique({ where: { slug: CHELSEA } });
  if (!chelsea) throw new Error(`${CHELSEA} が見つからない`);
  show("Attraction.priceAdult: Chelsea Winter Village", chelsea.priceAdult, "£18〜");

  if (!apply) {
    console.log("\n(dry run。--apply で反映する)");
    return;
  }

  await db.$transaction([
    db.event.update({
      where: { id: regent.id },
      data: { startDate: regentDate, endDate: regentDate, website: regentWebsite },
    }),
    db.attraction.update({ where: { id: bus.id }, data: { summary: BUS_SUMMARY } }),
    ...starStories.map((story) =>
      db.attractionStory.update({
        where: { id: story.id },
        data: { body: story.body.replace(OLD_STAR_LINE, "") },
      }),
    ),
    db.attraction.update({ where: { id: chelsea.id }, data: { priceAdult: "£18〜" } }),
  ]);
  console.log("\n反映しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
