/**
 * 大晦日ロンドンアイ花火パーティー(Riverside Rooms)のスポットを伏せ、
 * 公式サイトの欄を直す。
 *
 *   npx tsx scripts/unpublish-nye-riverside-rooms-2026-10.ts           # 差分を表示
 *   npx tsx scripts/unpublish-nye-riverside-rooms-2026-10.ts --apply   # DBへ反映
 *
 * 2026-10-27 の AdSense 審査向けの監査で見つかったもの。
 *
 *   - website に URL ではなく催しの英語名が入っていて、ページの「公式サイト」
 *     のリンク2つが /sightseeing/<英語名> を指す 404 になっていた(サイト内で
 *     唯一のリンク切れ)。英語名は Visit London の掲載ページの題と同じなので、
 *     その URL に直す。
 *   - 本文の予定表は「2025年12月31日」のままで、2026年の回は販売元の
 *     Golden Tours の年越しの一覧にも見当たらない(10/27 時点)。
 *     Attraction.isPublished の説明どおり、会期の終わった催しとして行は
 *     消さずに伏せる。2026年の回が発表されたら、予定表の年を直して true に戻す
 *     (戻すときは lib/annual-events/content/new-years-eve-fireworks.ts の
 *     links にも戻す)。
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

const SLUG = "nye-london-eye-riverside-rooms";
const WEBSITE_FROM =
  "New Year’s Eve Party by the London Eye with Fireworks at Riverside Rooms";
const WEBSITE_TO =
  "https://www.visitlondon.com/things-to-do/place/51130627-riverside-room-nye-party";

async function main() {
  const spot = await db.attraction.findUnique({
    where: { slug: SLUG },
    select: { website: true, isPublished: true },
  });
  if (!spot) throw new Error(`${SLUG} が DB に無い`);

  const data: { website?: string; isPublished?: boolean } = {};
  if (spot.website === WEBSITE_FROM) data.website = WEBSITE_TO;
  if (spot.isPublished) data.isPublished = false;

  if (Object.keys(data).length === 0) {
    console.log("適用済み。変更なし。");
    return;
  }
  console.log(`${apply ? "✓" : "·"} ${SLUG}:`, data);
  if (apply) await db.attraction.update({ where: { slug: SLUG }, data });
  else console.log("差分のみ(--apply で反映)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
