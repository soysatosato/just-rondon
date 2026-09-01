"use client";

import { CalendarDays, X } from "lucide-react";

import { formatPlanDate, parseIsoDate } from "@/lib/plan/dates";
import { setStartDate, usePlanStartDate } from "./plan-store";

/**
 * 出発日の入力。
 *
 * 日付を入れると「1日目」が「10月3日(金)」になり、その曜日に閉まっている
 * スポットに警告が出る。任意にしているのは、日程が決まる前に組み始める
 * 人が多いため。空のままでも道具としては全部動く。
 *
 * 曜日の判定に使えるのは openingHours の原文が曜日に触れている
 * ぶんだけ(144件中7件)なので、「警告が出ない = 開いている」ではない。
 * そこを黙っていると、出ないことを保証と受け取られる。文言で断っている。
 */
export default function PlanDateBar({ dayCount }: { dayCount: number }) {
  const startDate = usePlanStartDate();
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
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border px-4 py-3">
      <label
        htmlFor="plan-start-date"
        className="flex items-center gap-2 text-xs font-semibold"
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

      {start ? (
        <>
          <p className="text-xs text-muted-foreground">
            {formatPlanDate(start)}
            {end && ` 〜 ${formatPlanDate(end)}`}
            の{dayCount}日間。曜日で閉まるスポットには警告を出します。
          </p>
          <button
            type="button"
            onClick={() => setStartDate(null)}
            className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <X className="h-3 w-3" aria-hidden />
            日付を外す
          </button>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          入れると各日に日付と曜日が付き、
          <span className="font-semibold text-foreground">
            月曜休館のような曜日で閉まるスポット
          </span>
          に警告が出ます。判定に使えるのは開館時間の記載が曜日に触れている
          スポットだけなので、警告が出ないことは開いている保証ではありません。
        </p>
      )}
    </div>
  );
}

