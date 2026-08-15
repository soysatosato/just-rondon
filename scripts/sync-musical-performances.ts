/**
 * Ticketmaster から公演日程を取り込む。
 *
 * 対象は ticketmasterAttractionId が入っている作品だけ。ID は
 * scripts/link-musical-ticketmaster.ts で人が確認した組しか入らない。
 *
 * 日次で流す想定。全件を消してから入れ直すのではなく eventId で upsert し、
 * 消えた公演だけを削る。全消しにすると同期が途中で失敗したときに
 * 日程が空のページが公開されてしまう。
 *
 * 実行: npx tsx scripts/sync-musical-performances.ts
 *      npx tsx scripts/sync-musical-performances.ts --dry
 *      npx tsx scripts/sync-musical-performances.ts --slug hamilton
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { fetchPerformances } from "../lib/ticketmaster/performances";

dotenv.config();

const prisma = new PrismaClient();

/**
 * 過去公演を残す日数。
 *
 * 0 にして当日ぶんを消すと、まだ開演していない今夜の公演が
 * 昼の同期で消える。1日残しておけば当日の公演は必ず残る。
 */
const KEEP_PAST_DAYS = 1;

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry");
  const slugIndex = args.indexOf("--slug");
  const onlySlug = slugIndex !== -1 ? args[slugIndex + 1] : undefined;

  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.error("TICKETMASTER_API_KEY が .env にありません。");
    process.exitCode = 1;
    return;
  }

  const musicals = await prisma.musical.findMany({
    where: {
      ticketmasterAttractionId: { not: null },
      ...(onlySlug ? { slug: onlySlug } : {}),
    },
    select: { id: true, slug: true, engName: true, ticketmasterAttractionId: true },
  });

  if (musicals.length === 0) {
    console.error(
      onlySlug
        ? `${onlySlug} に attraction ID がありません。先に link-musical-ticketmaster.ts を実行してください。`
        : "attraction ID が入った作品がありません。",
    );
    process.exitCode = 1;
    return;
  }

  const cutoff = new Date(Date.now() - KEEP_PAST_DAYS * 24 * 60 * 60 * 1000);
  let totalUpserted = 0;
  let totalRemoved = 0;
  const failures: string[] = [];

  for (const musical of musicals) {
    try {
      const performances = await fetchPerformances(musical.ticketmasterAttractionId!, apiKey);

      if (performances.length === 0) {
        // 在庫が尽きた(終演した)可能性がある。既存の日程は消さずに残し、
        // 人が確認できるように警告だけ出す。自動で消すと、API の一時的な
        // 不調と本当の終演を区別できないまま日程が消える。
        console.log(`!  ${musical.engName}: 公演が0件。終演した可能性があります(既存データは残しました)`);
        continue;
      }

      if (dryRun) {
        const first = performances[0];
        const last = performances[performances.length - 1];
        console.log(
          `[dry] ${musical.engName}: ${performances.length}件 ` +
            `${first.startsAt.toISOString().slice(0, 10)}..${last.startsAt.toISOString().slice(0, 10)}`,
        );
        continue;
      }

      for (const p of performances) {
        await prisma.musicalPerformance.upsert({
          where: { eventId: p.eventId },
          create: {
            musicalId: musical.id,
            eventId: p.eventId,
            startsAt: p.startsAt,
            timeTba: p.timeTba,
            url: p.url,
            status: p.status,
          },
          update: {
            startsAt: p.startsAt,
            timeTba: p.timeTba,
            url: p.url,
            status: p.status,
          },
        });
      }
      totalUpserted += performances.length;

      // TM 側から消えた公演を削る。取得できた範囲(未来ぶん)に限る。
      const fetchedIds = performances.map((p) => p.eventId);
      const removed = await prisma.musicalPerformance.deleteMany({
        where: {
          musicalId: musical.id,
          startsAt: { gte: cutoff },
          eventId: { notIn: fetchedIds },
        },
      });
      totalRemoved += removed.count;

      console.log(
        `OK ${musical.engName}: ${performances.length}件取り込み` +
          (removed.count > 0 ? ` / ${removed.count}件削除` : ""),
      );
    } catch (error) {
      // 1作品の失敗で全体を止めない。残りは取り込めるほうがよい。
      const message = error instanceof Error ? error.message : String(error);
      console.error(`NG ${musical.engName}: ${message}`);
      failures.push(musical.slug);
    }
  }

  // 過去公演の掃除。作品ページは未来ぶんしか出さないので溜めても意味がない。
  if (!dryRun) {
    const purged = await prisma.musicalPerformance.deleteMany({
      where: { startsAt: { lt: cutoff } },
    });
    if (purged.count > 0) console.log(`\n過去公演を ${purged.count}件 削除`);
  }

  console.log(
    `\n対象 ${musicals.length}件 / 取り込み ${totalUpserted}件 / 削除 ${totalRemoved}件` +
      (failures.length > 0 ? ` / 失敗 ${failures.length}件: ${failures.join(", ")}` : ""),
  );
  if (dryRun) console.log("--dry のため書き込んでいません。");
  if (failures.length > 0) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
