"use client";

import { useState } from "react";
import { dayPlans, oneDayRoute } from "./content";

/**
 * 「何日ありますか」から、実行する Day を返す。
 *
 * 多くの読者がこのページに来て最初に持つ問いなのに、以前は
 * 「滞在日数が短い場合の削り方」として9節中7番目に置かれていた。
 * 冒頭に上げて、押すと該当の Day へ飛べるようにする。
 *
 * 5案とも DOM に描画したうえで選択中以外を hidden で伏せる。
 * 選択中だけを描画すると、他の日数の案がプリレンダー結果に出ず、
 * JS 無効では1案しか読めなくなる。
 */
export default function DayPicker() {
  const [nights, setNights] = useState(3);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {dayPlans.map((p) => {
          const on = p.nights === nights;
          return (
            <button
              key={p.nights}
              type="button"
              onClick={() => setNights(p.nights)}
              aria-pressed={on}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                on
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:border-emerald-400 dark:border-neutral-700 dark:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {dayPlans.map((p) => (
        <div
          key={p.nights}
          hidden={p.nights !== nights}
          className="mt-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {p.headline}
          </p>

          <ul className="mt-3 flex flex-wrap gap-2">
            {p.days.map((d) => (
              <li key={d}>
                <a
                  href={`#day-${d}`}
                  className="inline-block rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  Day {d} へ
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {p.body}
          </p>

          {p.nights === 1 && (
            <ol className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1.5 rounded-lg bg-gray-50 p-3 dark:bg-neutral-800/60">
              {oneDayRoute.map((r, i) => (
                <li
                  key={r}
                  className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300"
                >
                  {i > 0 && (
                    <span aria-hidden className="text-gray-400">
                      →
                    </span>
                  )}
                  {r}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  );
}
