/**
 * ミュージカル情報の鮮度を棚卸しする。
 *
 * 背景。/musicals は全作品が isOnShow = true のまま放置され、実際には
 * 終演した限定公演や、改名前の劇場名が残っていた。読者が「上演中」と
 * 読んで劇場へ向かう情報なので、古さがそのまま実害になる。
 *
 * これを自動で直そうとして Ticketmaster Discovery API を調べたが、
 * 在庫を持つ作品しか返らず31本中3本しか照合できなかった。さらに
 * "Hadestown (Touring)" のような別公演が正解のように混ざるため、
 * 自動同期はむしろ誤情報を増やす。結論として、更新は人が行い、
 * 機械は「そろそろ確認すべき作品」を挙げるところまでを受け持つ。
 *
 * 実行:
 *   npx tsx scripts/check-musical-freshness.ts          一覧を出す
 *   npx tsx scripts/check-musical-freshness.ts --stale  要確認だけ出す
 *   npx tsx scripts/check-musical-freshness.ts --verify <slug> [<slug>...]
 *       確認できた作品に今日の日付を打つ
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 何日で「要確認」に落とすか。
 *
 * 90日。West End の公演は3〜6か月単位でクロージングが決まり、
 * 発表から終演までは1〜2か月あることが多い。四半期ごとに見れば
 * 終演を跨いで載せ続ける期間が実用上ほぼ出ない。
 * 30日だと毎月31本を見ることになって続かず、放置に戻る。
 */
const STALE_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / DAY_MS);
}

/** 未確認は Infinity 扱い。古い順に並べたとき先頭へ来てほしい。 */
function staleness(lastVerifiedAt: Date | null): number {
  return lastVerifiedAt === null ? Number.POSITIVE_INFINITY : daysSince(lastVerifiedAt);
}

function formatAge(lastVerifiedAt: Date | null): string {
  if (lastVerifiedAt === null) return "未確認";
  return `${daysSince(lastVerifiedAt)}日前`;
}

async function list(staleOnly: boolean) {
  const musicals = await prisma.musical.findMany({
    select: { slug: true, engName: true, theatreName: true, isOnShow: true, lastVerifiedAt: true },
  });

  const sorted = musicals
    .map((m) => ({ ...m, age: staleness(m.lastVerifiedAt) }))
    .sort((a, b) => b.age - a.age);

  const stale = sorted.filter((m) => m.age >= STALE_DAYS);
  const rows = staleOnly ? stale : sorted;

  if (rows.length === 0) {
    console.log(`要確認の作品はありません(基準: ${STALE_DAYS}日)。`);
    return;
  }

  for (const m of rows) {
    // 上演中として出している作品ほど、古いときの実害が大きい。
    const flag = m.age >= STALE_DAYS ? (m.isOnShow ? "!!" : " !") : "  ";
    const status = m.isOnShow ? "上演中" : "終演  ";
    console.log(
      `${flag} ${formatAge(m.lastVerifiedAt).padStart(6)} | ${status} | ${m.engName} @ ${m.theatreName}`,
    );
    console.log(`        ${m.slug}`);
  }

  console.log(`\n要確認 ${stale.length} / 全 ${musicals.length} 件(基準: ${STALE_DAYS}日)`);
  console.log("!! = 上演中として公開しているが未確認。優先して見ること。");
  console.log("\n確認できたら:");
  console.log("  npx tsx scripts/check-musical-freshness.ts --verify <slug> [<slug>...]");
}

async function verify(slugs: string[]) {
  // 打つ前に実在を確かめる。updateMany は存在しない slug を黙って
  // 0件更新で通すので、打ち間違えたまま「確認済みにした」と
  // 誤解したまま進む事故が起きる。
  const found = await prisma.musical.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, engName: true },
  });

  const missing = slugs.filter((s) => !found.some((m) => m.slug === s));
  if (missing.length > 0) {
    console.error(`該当しない slug があります: ${missing.join(", ")}`);
    console.error("何も更新していません。");
    process.exitCode = 1;
    return;
  }

  const now = new Date();
  await prisma.musical.updateMany({
    where: { slug: { in: slugs } },
    data: { lastVerifiedAt: now },
  });

  console.log(`${found.length}件を確認済みにしました (${now.toISOString().slice(0, 10)}):`);
  found.forEach((m) => console.log(`  ${m.engName}`));
}

async function main() {
  const args = process.argv.slice(2);
  const verifyIndex = args.indexOf("--verify");

  if (verifyIndex !== -1) {
    const slugs = args.slice(verifyIndex + 1).filter((a) => !a.startsWith("--"));
    if (slugs.length === 0) {
      console.error("--verify には slug を1つ以上渡してください。");
      process.exitCode = 1;
      return;
    }
    await verify(slugs);
    return;
  }

  await list(args.includes("--stale"));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
