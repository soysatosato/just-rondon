import Link from "next/link";
import {
  CLOSURE_GROUPS,
  holidayCell,
  type HolidayCell,
} from "@/lib/christmas/closures";
import { formatDay, weekdayOf } from "@/lib/christmas/season";
import type { VenueClosure } from "@/lib/christmas/types";
import { cn } from "@/lib/utils";

/**
 * 年末年始の営業の早見表。館ごとに 12/24・25・26・31・1/1 を並べる。
 *
 * マスに書くのは公式の案内にあることだけ。休みでない日を「開」にするのは、
 * 公式が「◯日以外は毎日開く」と書いている館だけで、それ以外は「—」
 * (記載なし)。書かれていない日を開館と言い切らないため。
 *
 * スマホでは表だけを横にスクロールさせ、館の名前の列は左に留める。
 */

function hrefFor(closure: VenueClosure): string | null {
  const spot = closure.places.find((p) => p.spot)?.spot;
  if (spot) return `/sightseeing/${spot}`;
  const museum = closure.places.find((p) => p.museum)?.museum;
  return museum ? `/museums/${museum}` : null;
}

function Cell({ cell }: { cell: HolidayCell }) {
  switch (cell.kind) {
    case "closed":
      return (
        <span className="inline-flex min-w-[2.5rem] justify-center rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-800 dark:bg-red-900/40 dark:text-red-300">
          {cell.longTerm ? "休館中" : "休"}
        </span>
      );
    case "short":
      return (
        <span className="inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-semibold leading-snug text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
          {cell.text}
        </span>
      );
    case "worship":
      return (
        <span className="inline-block rounded-md bg-sky-100 px-1.5 py-0.5 text-xs font-semibold text-sky-900 dark:bg-sky-900/40 dark:text-sky-200">
          礼拝のみ
        </span>
      );
    case "open":
      return (
        <span className="inline-flex min-w-[2.5rem] justify-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
          開
        </span>
      );
    case "unknown":
      return (
        <span className="text-xs text-neutral-500 dark:text-neutral-400" aria-label="記載なし">
          —
        </span>
      );
  }
}

export default function HolidayTable({
  closures,
  dates,
}: {
  closures: VenueClosure[];
  /** 列に出す日("YYYY-MM-DD")。 */
  dates: string[];
}) {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-neutral-50 px-3 py-2.5 font-semibold dark:bg-neutral-800"
              >
                館・場所
              </th>
              {dates.map((date) => {
                const christmas = date.endsWith("-12-25");
                return (
                  <th
                    key={date}
                    scope="col"
                    className={cn(
                      "px-2 py-2.5 text-center font-semibold tabular-nums",
                      christmas && "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200",
                    )}
                  >
                    {Number(date.slice(5, 7))}/{Number(date.slice(8))}
                    <span className="block text-xs font-normal">({weekdayOf(date)})</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {CLOSURE_GROUPS.map((group) => {
            const rows = closures.filter((c) => c.group === group.key);
            if (rows.length === 0) return null;
            return (
              <tbody key={group.key} className="divide-y divide-neutral-200 dark:divide-neutral-700">
                <tr className="bg-white dark:bg-neutral-950">
                  <th
                    scope="colgroup"
                    colSpan={dates.length + 1}
                    className="sticky left-0 bg-white px-3 pb-1.5 pt-4 text-xs font-bold text-red-800 dark:bg-neutral-950 dark:text-red-300"
                  >
                    {group.label}
                  </th>
                </tr>
                {rows.map((closure) => {
                  const href = hrefFor(closure);
                  const notes = closure.notes ?? [];
                  return (
                    <tr key={closure.id} className="align-top">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 w-[13rem] max-w-[13rem] bg-white px-3 py-2.5 font-medium dark:bg-neutral-950"
                      >
                        {href ? (
                          <Link href={href} className="text-link underline-offset-2 hover:underline">
                            {closure.name}
                          </Link>
                        ) : (
                          closure.name
                        )}
                        {notes.map((note) => (
                          <span
                            key={note}
                            className="mt-0.5 block text-xs font-normal leading-snug text-neutral-600 dark:text-neutral-400"
                          >
                            {note}
                          </span>
                        ))}
                      </th>
                      {dates.map((date) => (
                        <td
                          key={date}
                          className={cn(
                            "px-2 py-2.5 text-center",
                            date.endsWith("-12-25") && "bg-red-50/60 dark:bg-red-950/20",
                          )}
                        >
                          <Cell cell={holidayCell(closure, date)} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
        <li className="flex items-center gap-1.5">
          <Cell cell={{ kind: "open" }} />公式が「この日以外は毎日開く」と書いている
        </li>
        <li className="flex items-center gap-1.5">
          <Cell cell={{ kind: "closed", longTerm: false }} />休み
        </li>
        <li className="flex items-center gap-1.5">
          <Cell cell={{ kind: "short", text: "時間" }} />短縮・特別な時間
        </li>
        <li className="flex items-center gap-1.5">
          <Cell cell={{ kind: "worship" }} />観光の見学はできない
        </li>
        <li className="flex items-center gap-1.5">
          <Cell cell={{ kind: "unknown" }} />公式の案内に記載なし
        </li>
      </ul>
      <p className="mt-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {formatDay(dates[0])}〜{formatDay(dates[dates.length - 1])}の分です。出典は館ごとにページの末尾にまとめています。
      </p>
    </div>
  );
}
