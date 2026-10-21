/**
 * 旅行プランのひな形(lib/plan/templates.ts)を、/plan と同じ計算に通して点検する。
 *
 *   npx tsx scripts/check-plan-templates.ts
 *
 * 見るもの:
 * - 道具自身の警告(詰め込みすぎ・大型施設・休館・市外)
 * - 開館前に着く・閉館後まで居る・最終入場に間に合わない
 * - 決まった時刻に始まる催しに、始まる前に着いているか
 * - 曜日を前提にしたひな形(assumedWeekdays)は、その曜日での休館
 *
 * 開館時刻は openingHours の原文から読む。読み方は点検用の目安で、
 * 曜日ごとに時刻が違う書き方は「いちばん遅い開館・いちばん早い閉館」で
 * 厳しく見る。原文を読むのはここだけで、/plan には持ち込まない
 * (原文を正規表現で読む仕組みは 2026-09 に休館曜日で破綻している)。
 *
 * 2026-10 の監査で、看板のひな形「はじめてのロンドン」が11:00開始の
 * 衛兵交代式に13:20に着くことが分かった。ひな形を直したらこれを通す。
 * 問題があれば終了コード1で終わる。DB は読むだけ。
 */

import "dotenv/config";
import db from "../utils/db";
import { buildDayPlan, formatClock, type PlanSpot } from "../lib/plan";
import { PLAN_TEMPLATES, templateOverrides } from "../lib/plan/templates";
import { PLAN_SPOT_SELECT, toPlanSpot } from "../utils/plan-spots";

const LABELS = ["月", "火", "水", "木", "金", "土", "日"];

/**
 * 決まった時刻に始まる催し。着く時刻の幅と、居なければならない時刻。
 * 衛兵交代式は11:00開始。場所を取るなら30分前には宮殿前にいる。
 */
const FIXED_EVENTS: Record<
  string,
  { label: string; arriveFrom: number; arriveBy: number; stayUntil: number }
> = {
  "changing-the-guard-buckingham-palace": {
    label: "11:00開始",
    arriveFrom: 10 * 60,
    arriveBy: 10 * 60 + 45,
    stayUntil: 11 * 60 + 30,
  },
};

const toMinutes = (h: string, m: string) => Number(h) * 60 + Number(m);

/** 原文から開館・閉館・最終入場を読む。読めなければ null。 */
function readHours(text: string | null) {
  if (!text) return null;
  const ranges = [
    ...text.matchAll(/(\d{1,2}):(\d{2})\s*[〜~\-–]\s*(\d{1,2}):(\d{2})/g),
  ];
  const openOnly = text.match(/(\d{1,2}):(\d{2})\s*[〜~]\s*日没/);
  const last = text.match(/最終入場\s*(\d{1,2}):(\d{2})/);
  if (ranges.length === 0 && !openOnly && !last) return null;
  return {
    open:
      ranges.length > 0
        ? Math.max(...ranges.map((r) => toMinutes(r[1], r[2])))
        : openOnly
          ? toMinutes(openOnly[1], openOnly[2])
          : null,
    close:
      ranges.length > 0
        ? Math.min(...ranges.map((r) => toMinutes(r[3], r[4])))
        : null,
    lastEntry: last ? toMinutes(last[1], last[2]) : null,
  };
}

/** 2026-11-02 は月曜。曜日を前提にしたひな形の日付をここから作る。 */
function dateForWeekday(weekday: number): Date {
  const date = new Date(2026, 10, 2);
  date.setDate(date.getDate() + weekday);
  return date;
}

async function main() {
  const rows = await db.attraction.findMany({
    where: { isPublished: true },
    select: PLAN_SPOT_SELECT,
  });
  const bySlug = new Map(rows.map((row) => [row.slug, toPlanSpot(row)]));

  let problems = 0;
  const problem = (message: string) => {
    problems++;
    console.log(`    ✗ ${message}`);
  };

  for (const template of PLAN_TEMPLATES) {
    console.log(
      `\n== ${template.label} (${template.id}) 宿を${formatClock(template.startMinutes)}に出る`,
    );
    const overrides = templateOverrides(template);

    template.days.forEach((stops, index) => {
      const day = index + 1;
      const spots: PlanSpot[] = [];
      for (const stop of stops) {
        const spot = bySlug.get(stop.slug);
        if (spot) spots.push(spot);
        else problem(`${day}日目: ${stop.slug} が公開中のスポットにない`);
      }

      const weekday = template.assumedWeekdays?.[index];
      const date = weekday === undefined ? null : dateForWeekday(weekday);
      const plan = buildDayPlan(day, spots, {
        startMinutes: template.startMinutes,
        overrides,
        date,
      });

      console.log(
        `  ${day}日目${weekday === undefined ? "" : `(${LABELS[weekday]})`} ` +
          `${formatClock(plan.startMinutes)}→${formatClock(plan.endMinutes)} ` +
          `滞在${plan.stayMinutes}分・移動${plan.travelMinutes}分`,
      );

      for (const row of plan.rows) {
        const { spot } = row;
        console.log(
          `    ${formatClock(row.arriveMinutes).padStart(5)}–${formatClock(row.leaveMinutes).padEnd(5)} ` +
            `${spot.name}  [${spot.openingHours ?? "開館時間の記載なし"}]`,
        );

        const hours = readHours(spot.openingHours);
        if (hours?.open != null && row.arriveMinutes < hours.open) {
          problem(`${spot.name}: 開館(${formatClock(hours.open)})の前に着く`);
        }
        if (hours?.close != null && row.leaveMinutes > hours.close) {
          problem(`${spot.name}: 閉館(${formatClock(hours.close)})のあとまで居る`);
        }
        if (hours?.lastEntry != null && row.arriveMinutes > hours.lastEntry) {
          problem(`${spot.name}: 最終入場(${formatClock(hours.lastEntry)})に間に合わない`);
        }

        const fixed = FIXED_EVENTS[spot.slug];
        if (fixed) {
          if (
            row.arriveMinutes < fixed.arriveFrom ||
            row.arriveMinutes > fixed.arriveBy
          ) {
            problem(
              `${spot.name}(${fixed.label}): ${formatClock(row.arriveMinutes)}に着く。` +
                `${formatClock(fixed.arriveFrom)}〜${formatClock(fixed.arriveBy)}に着くこと`,
            );
          }
          if (row.leaveMinutes < fixed.stayUntil) {
            problem(`${spot.name}(${fixed.label}): ${formatClock(row.leaveMinutes)}に離れる`);
          }
        }
      }

      for (const warning of plan.warnings) {
        problem(`道具の警告(${warning.kind}): ${warning.message}`);
      }

      // 曜日を決めていないひな形は、どの曜日なら休館に当たるかだけ知らせる。
      if (weekday === undefined) {
        const closedOn = LABELS.filter((_, wd) =>
          spots.some((spot) => spot.closedWeekdays.includes(wd)),
        );
        if (closedOn.length > 0) {
          console.log(`    (この日を${closedOn.join("・")}曜にすると休館に当たる)`);
        }
      }
    });
  }

  console.log(problems === 0 ? "\n問題なし" : `\n問題 ${problems}件`);
  if (problems > 0) process.exitCode = 1;
  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
