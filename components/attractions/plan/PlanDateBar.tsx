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
import { trackPlan } from "./track";

/**
 * 旅程の起点。1日目の日付と、宿を出る時刻。
 *
 * 日付を入れると「1日目」が「10月3日(金)」になり、その曜日に閉まっている
 * スポットに警告が出る。任意にしているのは、日程が決まる前に組み始める
 * 人が多いため。空のままでも道具としては全部動く。
 *
 * 欄の名前は以前「出発日」だった。日本を発つ日とも読め、その日をロンドンの
 * 1日目として入れると、全日の曜日が1日ずれる。何の日付かを名前で言う。
 *
 * 曜日の警告が効くのは、休館曜日を出典で確かめたスポット
 * (Attraction.closedDaysCheckedAt があるもの)だけなので、「警告が出ない =
 * 開いている」ではない。確かめていない行き先は日のカードで名指しする。
 *
 * 宿を出る時刻のほうは必須で、既定は9時。各スポットの到着時刻は、ここに
 * 宿から1ヶ所目までの目安(lib/plan の legFromHome)を足して積む。
 * 日ごとに変えられるようにはしていない——旅程を組む段階で日ごとの
 * 起床時刻まで決めている人はまずおらず、選択欄が日数ぶん増えるだけになる。
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
            1日目の日付
          </label>
          <input
            id="plan-start-date"
            type="date"
            value={startDate ?? ""}
            onChange={(e) => {
              setStartDate(e.target.value || null);
              if (e.target.value) trackPlan("set_date");
            }}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-base sm:text-xs"
          />
          {start && (
            <button
              type="button"
              onClick={() => setStartDate(null)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
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
            宿を出る時刻
          </label>
          <select
            id="plan-start-time"
            value={startMinutes}
            onChange={(e) => setStartMinutes(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-base sm:text-xs tabular-nums"
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
            {formatClock(startMinutes)}に宿を出て、1ヶ所目までは地下鉄・バスで約30分
            (ロンドン市外なら約1時間30分)として到着時刻を出しています。
            曜日で閉まるスポットの警告は、休館する曜日を公式の案内で確かめた
            スポットだけが対象です。確かめていないスポットは各日のカードに出します。
          </>
        ) : (
          <>
            ロンドンでの1日目の日付を入れると各日に日付と曜日が付き、
            <span className="font-semibold text-foreground">
              月曜休館のような曜日で閉まるスポット
            </span>
            に警告が出ます。到着時刻は{formatClock(startMinutes)}に宿を出て、
            1ヶ所目まで約30分かかる前提で出しているので、朝が遅い日程ならここを変えてください。
          </>
        )}
      </p>
    </div>
  );
}
