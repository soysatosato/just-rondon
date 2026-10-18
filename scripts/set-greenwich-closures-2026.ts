/**
 * グリニッジ天文台とプラネタリウムの長期休館を、スポットのページに出す。
 *
 *   npx tsx scripts/set-greenwich-closures-2026.ts           # 差分を表示
 *   npx tsx scripts/set-greenwich-closures-2026.ts --apply   # DBへ反映
 *
 * 2026-10-18、クリスマス特集の年末年始の営業を調べていて見つかった。
 * ロイヤル・ミュージアムズ・グリニッジの案内(Royal Observatory closures)によると、
 *
 *   - 天文台は 2026年11月2日から、改修のため全館が長期休館(再開日は未発表)
 *   - ピーター・ハリソン・プラネタリウムと天文センターは 2025年9月8日から長期休館
 *
 * どちらのページも開館時間だけを出していて、開いているように読めていた。
 * ファクトバーの「休館日」の欄(closedNote)に書く。再開が発表されたら
 * closedNote を null に戻すこと。
 *
 * クリスマス特集の早見表(lib/christmas/closures.ts)にも同じ休館を入れてある。
 *
 * https://www.rmg.co.uk/royal-observatory/plan-your-visit/closures
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

const NOTES: Record<string, string> = {
  "royal-observatory-greenwich":
    "2026年11月2日から改修のため全館休館(再開日は未発表)",
  "peter-harrison-planetarium-greenwich":
    "2025年9月8日から長期休館中(再開日は未発表)",
};

async function main() {
  for (const [slug, closedNote] of Object.entries(NOTES)) {
    const spot = await db.attraction.findUnique({
      where: { slug },
      select: { id: true, closedNote: true },
    });
    if (!spot) throw new Error(`${slug} が見つからない`);
    console.log(`\n[${slug}]`);
    console.log("  before:", JSON.stringify(spot.closedNote));
    console.log("  after: ", JSON.stringify(closedNote));
    if (apply) {
      await db.attraction.update({ where: { id: spot.id }, data: { closedNote } });
    }
  }
  console.log(apply ? "\n反映しました。" : "\n(dry run。--apply で反映する)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
