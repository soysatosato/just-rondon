import "dotenv/config";
import db from "../utils/db";
import {
  formatMonthJa,
  getMonthSlugForDate,
  getMonthStart,
  parseMonthSlug,
} from "../lib/changes";
import {
  formatScheduledDate,
  parseJaDate,
  scheduledChangesBetween,
} from "../lib/changes-schedule";
import { TRANSPORT_UPDATED_AT } from "../lib/transport/rates";
import { RATES_UPDATED_AT } from "../lib/visa/rates";
import { JOBS_UPDATED_AT } from "../lib/jobs/rates";
import { HOUSING_UPDATED_AT } from "../lib/housing/rates";
import { BILLS_UPDATED_AT, ENERGY_CAP } from "../lib/bills/rates";
import { HEALTH_UPDATED_AT } from "../lib/health/rates";
import { MONEY_UPDATED_AT } from "../lib/money/rates";
import { RAIL_UPDATED_AT } from "../lib/beyond-london/rates";
import { FOOD_UPDATED_AT } from "../lib/food/prices";
import { BUDGET_UPDATED_AT } from "../lib/sightseeing/budget";
import { PASS_UPDATED_AT } from "../lib/sightseeing/passes";
import { TAKE_HOME_UPDATED_AT } from "../lib/money/take-home/tax-years";

/**
 * 「今月変わったロンドン」を書く前の下調べ。読み取り専用。
 *
 *   npx tsx scripts/report-monthly-changes.ts [2026-10]
 *
 * 出すもの:
 *   1. その月と続く3か月に予定されている改定(lib/changes-schedule.ts)
 *   2. 観光スポットの料金の変更履歴(AttractionPriceChange)。前号の調査日以降
 *   3. 料金・制度の定数ファイルを最後に確認した日。古いものから
 *   4. 既にある号
 *
 * 1 と 2 は「号に載せる候補」、3 は「調べ直す候補」。どれも候補でしかなく、
 * 号に載せる前に一次ソースで確かめる(スキルの Step 3)。
 */

const LOOKAHEAD_MONTHS = 4;
/** これより前に確認した定数ファイルは、調べ直す候補として目立たせる。 */
const STALE_DAYS = 60;

const RATE_FILES: { file: string; updatedAt: string }[] = [
  { file: "lib/transport/rates.ts(地下鉄・バス・空港)", updatedAt: TRANSPORT_UPDATED_AT },
  { file: "lib/sightseeing/budget.ts(入場料・旅費の目安)", updatedAt: BUDGET_UPDATED_AT },
  { file: "lib/sightseeing/passes.ts(ロンドンパス等)", updatedAt: PASS_UPDATED_AT },
  { file: "lib/beyond-london/rates.ts(鉄道)", updatedAt: RAIL_UPDATED_AT },
  { file: "lib/bills/rates.ts(光熱費・Council Tax)", updatedAt: BILLS_UPDATED_AT },
  { file: "lib/jobs/rates.ts(最低賃金)", updatedAt: JOBS_UPDATED_AT },
  { file: "lib/visa/rates.ts(ビザ申請料・要件)", updatedAt: RATES_UPDATED_AT },
  { file: "lib/housing/rates.ts(賃貸の制度)", updatedAt: HOUSING_UPDATED_AT },
  { file: "lib/health/rates.ts(NHS)", updatedAt: HEALTH_UPDATED_AT },
  { file: "lib/money/rates.ts(銀行・送金)", updatedAt: MONEY_UPDATED_AT },
  { file: "lib/money/take-home/tax-years.ts(所得税・NI)", updatedAt: TAKE_HOME_UPDATED_AT },
  { file: "lib/food/prices.ts(食費)", updatedAt: FOOD_UPDATED_AT },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const ymd = (d: Date) => d.toISOString().slice(0, 10);

async function main() {
  const arg = process.argv[2];
  const slug = arg ?? getMonthSlugForDate(new Date());
  const parsed = parseMonthSlug(slug);
  if (!parsed) throw new Error(`month must look like "2026-10", got "${arg}"`);

  const monthStart = getMonthStart(parsed.year, parsed.month);
  const until = getMonthStart(parsed.year, parsed.month + LOOKAHEAD_MONTHS);
  const now = new Date();

  console.log(`\n=== ${formatMonthJa(monthStart)}号の下調べ (${slug}) ===`);

  // 1. 予定表 ------------------------------------------------------------
  console.log(`\n■ 予定表にある改定(${ymd(monthStart)} 〜 ${LOOKAHEAD_MONTHS}か月)`);
  // 毎年の改定は「号の月から見た次の回」で出す。
  const scheduled = scheduledChangesBetween(monthStart, until, monthStart);
  if (scheduled.length === 0) console.log("  (なし)");
  for (const c of scheduled) {
    const inMonth = c.date.slice(0, 7) === slug;
    const delta = c.before && c.after ? `  ${c.before} → ${c.after}` : "";
    console.log(
      `  ${inMonth ? "★今月" : "  予告"} ${formatScheduledDate(c)}${c.recurring ? "(例年)" : ""}  [${c.kind}] ${c.title}${delta}  ${c.sitePath}`,
    );
  }
  // 予定表は定数から作るので、定数の「次の改定日」が過ぎたまま放置されると
  // その項目が予定表から黙って消える。過ぎていたら知らせる。
  const energyNext = parseJaDate(ENERGY_CAP.nextChange);
  if (energyNext && energyNext.date <= ymd(now)) {
    console.log(
      `  ! ENERGY_CAP.nextChange(${ENERGY_CAP.nextChange})を過ぎている。lib/bills/rates.ts の price cap を新しい期間に直す`,
    );
  }

  // 2. 入場料の変更履歴 ----------------------------------------------------
  const previous = await db.monthlyChangeIssue.findFirst({
    where: { monthStart: { lt: monthStart } },
    orderBy: { monthStart: "desc" },
    select: { slug: true, researchedAt: true },
  });
  const since = previous?.researchedAt ?? new Date(monthStart.getTime() - 31 * DAY_MS);
  const priceChanges = await db.attractionPriceChange.findMany({
    where: { changedAt: { gte: since } },
    orderBy: { changedAt: "asc" },
    include: { attraction: { select: { name: true, slug: true, isPublished: true } } },
  });
  console.log(
    `\n■ 観光スポットの料金の変更(${ymd(since)} 以降${previous ? `・前号 ${previous.slug} の調査日から` : ""}): ${priceChanges.length}件`,
  );
  for (const p of priceChanges) {
    console.log(
      `  ${ymd(p.changedAt)} ${p.attraction.name}${p.attraction.isPublished ? "" : "(非公開)"} /sightseeing/${p.attraction.slug}  ${p.field}: ${p.before ?? "(空)"} → ${p.after ?? "(空)"}`,
    );
  }
  console.log("  ※ 表記の揺れを直しただけの行も混ざる。改定かどうかは公式サイトで判断する");

  // 3. 定数ファイルの確認日 --------------------------------------------------
  console.log(`\n■ 料金・制度の定数ファイル(最後に確認した日。${STALE_DAYS}日より前に !)`);
  const rows = RATE_FILES.map((r) => ({
    ...r,
    days: Math.floor((now.getTime() - new Date(`${r.updatedAt}T00:00:00Z`).getTime()) / DAY_MS),
  })).sort((a, b) => b.days - a.days);
  for (const r of rows) {
    console.log(`  ${r.days > STALE_DAYS ? "!" : " "} ${r.updatedAt} (${r.days}日前)  ${r.file}`);
  }

  // 4. 既刊 --------------------------------------------------------------
  const issues = await db.monthlyChangeIssue.findMany({
    orderBy: { monthStart: "desc" },
    take: 6,
    select: { slug: true, publishedAt: true, researchedAt: true, _count: { select: { items: true } } },
  });
  console.log("\n■ 既にある号");
  if (issues.length === 0) console.log("  (なし)");
  for (const i of issues) {
    console.log(
      `  ${i.slug}  ${i.publishedAt ? `公開 ${ymd(i.publishedAt)}` : "下書き"}  調査 ${ymd(i.researchedAt)}  ${i._count.items}項目`,
    );
  }
  console.log("");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
