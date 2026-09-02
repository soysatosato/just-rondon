"use client";

import { CalendarDays, Clock3, X } from "lucide-react";

import {
  formatClock,
  MAX_START_MINUTES,
  MIN_START_MINUTES,
} from "@/lib/plan";
import { formatPlanDate, parseIsoDate } from "@/lib/plan/dates";
import {
  setStartDate,
  setStartMinutes,
  usePlanStartDate,
  usePlanStartMinutes,
} from "./plan-store";

/**
 * 旅程の起点。出発日と、1日の開始時刻。
 *
 * 出発日を入れると「1日目」が「10月3日(金)」になり、その曜日に閉まっている
 * スポットに警告が出る。任意にしているのは、日程が決まる前に組み始める
 * 人が多いため。空のままでも道具としては全部動く。
 *
 * 曜日の判定に使えるのは openingHours の原文が曜日に触れているぶんだけ
 * (144件中12件)なので、「警告が出ない = 開いている」ではない。そこを
 * 黙っていると、出ないことを保証と受け取られる。文言で断っている。
 *
 * 開始時刻のほうは必須で、既定は9時。これが決まっていないと各スポットの
 * 到着時刻が出せない。日ごとに変えられるようにはしていない——旅程を
 * 組む段階で日ごとの起床時刻まで決めている人はまずおらず、選択欄が
 * 日数ぶん増えるだけになる。
 */

/** 選べる開始時刻。30分刻みで十分——この道具が出すのは概算。 */
const START_STEP = 30;

const START_OPTIONS = (() => {
  const values: number[] = [];
  for (let m = MIN_START_MINUTES; m <= MAX_START_MINUTES; m += START_STEP) {
    values.push(m);
  }
  return values;
})();

export default function PlanDateBar({ dayCount }: { dayCount: number }) {
  const startDate = usePlanStartDate();
  const startMinutes = usePlanStartMinutes();
  const start = parseIsoDate(startDate);

  const end =
    start && dayCount > 1
      ? (() => {
          const d = new Date(start);
          d.setDate(d.getDate() + dayCount - 1);
          return d;
        })()
      : null;

  return (
    <div className="space-y-2 rounded-2xl border border-border px-4 py-3 print:hidden">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="plan-start-date"
            className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold"
          >
            <CalendarDays
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden
            />
            出発日
          </label>
          <input
            id="plan-start-date"
            type="date"
            value={startDate ?? ""}
            onChange={(e) => setStartDate(e.target.value || null)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
          />
          {start && (
            <button
              type="button"
              onClick={() => setStartDate(null)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground transition hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="h-3 w-3" aria-hidden />
              外す
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="plan-start-time"
            className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold"
          >
            <Clock3
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden
            />
            動き出す時刻
          </label>
          <select
            id="plan-start-time"
            value={startMinutes}
            onChange={(e) => setStartMinutes(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs tabular-nums"
          >
            {START_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {formatClock(minutes)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {start ? (
          <>
            {formatPlanDate(start)}
            {end && ` 〜 ${formatPlanDate(end)}`}の{dayCount}日間。
            {formatClock(startMinutes)}に宿を出る前提で、各スポットの到着時刻を出しています。
            曜日で閉まるスポットには警告を出しますが、判定に使えるのは開館時間の
            記載が曜日に触れているスポットだけなので、警告が出ないことは
            開いている保証ではありません。
          </>
        ) : (
          <>
            出発日を入れると各日に日付と曜日が付き、
            <span className="font-semibold text-foreground">
              月曜休館のような曜日で閉まるスポット
            </span>
            に警告が出ます。到着時刻は{formatClock(startMinutes)}に宿を出る前提で
            出しているので、朝が遅い日程ならここを変えてください。
          </>
        )}
      </p>
    </div>
  );
}
