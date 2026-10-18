import Link from "next/link";
import {
  KIND_LABELS,
  KIND_ORDER,
  addDays,
  axisPercent,
  daysBetween,
  effectiveEnd,
  formatRange,
  type ResolvedItem,
  type SeasonAxis,
} from "@/lib/christmas";
import { cn } from "@/lib/utils";
import styles from "./christmas.module.css";

/**
 * シーズンの暦。灯り・マーケット・リンク・催しの会期を横棒で並べ、
 * 今日と12月25日に線を引く。
 *
 * 「いつ行けば何が見られるか」は、表で1件ずつ読むより、棒が重なって
 * いるところを目で探すほうが早い。会期の文字は各行の読み上げ用の文と、
 * 下の一覧(各節)に書いてあるので、棒は形だけを伝える。
 *
 * スマホでは横にスクロールさせる。71日ぶんを画面の幅に詰めると、
 * 1日が3pxを切って25日の欠けが見えなくなるため。
 */

const BAR: Record<ResolvedItem["kind"], string> = {
  lights: "bg-amber-400",
  market: "bg-red-500",
  rink: "bg-sky-500",
  event: "bg-emerald-500",
};

const LABEL_COL = "grid grid-cols-[8.5rem_1fr] gap-3 sm:grid-cols-[10rem_1fr]";

type Segment = { start: string; end: string; open: boolean };

/** 会期を、休みの日で切った区間に分ける。終わりが未発表なら軸の端まで。 */
function segments(item: ResolvedItem, axis: SeasonAxis): Segment[] {
  const edition = item.edition;
  if (!edition?.start) return [];
  const start = edition.start < axis.start ? axis.start : edition.start;
  // 終わりが未発表なら、飾りを片付ける1月6日まで(先を薄くして描く)。
  const end = effectiveEnd(edition) > axis.end ? axis.end : effectiveEnd(edition);
  const closed = new Set(edition.closedDates ?? []);
  if (edition.christmasDay === "closed") {
    closed.add(`${start.slice(0, 4)}-12-25`);
  }

  const result: Segment[] = [];
  let runStart: string | null = null;
  const span = daysBetween(start, end);
  for (let i = 0; i <= span; i++) {
    const day = addDays(start, i);
    if (closed.has(day)) {
      if (runStart) result.push({ start: runStart, end: addDays(day, -1), open: true });
      runStart = null;
    } else if (!runStart) {
      runStart = day;
    }
  }
  if (runStart) result.push({ start: runStart, end, open: true });
  // 終わりが未発表の帯は、最後の区間だけ先を薄くする。
  if (!edition.end && result.length > 0) result[result.length - 1].open = false;
  return result;
}

function widthPercent(axis: SeasonAxis, start: string, end: string) {
  return ((daysBetween(start, end) + 1) / axis.days) * 100;
}

function monthStarts(axis: SeasonAxis): { date: string; label: string }[] {
  const result: { date: string; label: string }[] = [];
  for (let i = 0; i < axis.days; i++) {
    const day = addDays(axis.start, i);
    if (day.endsWith("-01")) result.push({ date: day, label: `${Number(day.slice(5, 7))}月` });
  }
  return result;
}

export default function SeasonCalendar({
  items,
  axis,
  today,
  year,
}: {
  items: ResolvedItem[];
  axis: SeasonAxis;
  today: string;
  year: number;
}) {
  const christmas = `${year}-12-25`;
  const months = monthStarts(axis);
  const showToday = today >= axis.start && today <= axis.end;

  return (
    <figure className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="overflow-x-auto p-3 sm:p-4">
        <div className="relative min-w-[640px]">
          {/* 月の目盛り */}
          <div className={LABEL_COL}>
            <div />
            <div className="relative h-6 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              {months.map((m) => (
                <span
                  key={m.date}
                  className="absolute top-0 -translate-x-px border-l border-neutral-300 pl-1 dark:border-neutral-600"
                  style={{ left: `${axisPercent(axis, m.date)}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {KIND_ORDER.map((kind) => {
            const rows = items.filter((i) => i.kind === kind);
            if (rows.length === 0) return null;
            return (
              <div key={kind} className="mt-3">
                <p className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span className={cn("h-2.5 w-2.5 rounded-full", BAR[kind])} aria-hidden="true" />
                  {KIND_LABELS[kind]}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {rows.map((item) => {
                    const segs = segments(item, axis);
                    const summary = item.edition
                      ? formatRange(item.edition)
                      : `未発表(${item.usualTiming})`;
                    return (
                      <li key={item.slug} className={cn(LABEL_COL, "items-center")}>
                        <Link
                          href={item.href}
                          className="truncate text-sm text-neutral-800 underline-offset-2 hover:underline dark:text-neutral-200"
                        >
                          {item.shortTitle}
                        </Link>
                        <div className="relative h-5 rounded bg-neutral-100 dark:bg-neutral-800">
                          <span className="sr-only">{summary}</span>
                          {segs.length === 0 ? (
                            <span className="absolute inset-y-0 left-2 flex items-center text-xs font-medium text-amber-800 dark:text-amber-300">
                              {item.edition ? "日程は未発表" : "未発表"}
                            </span>
                          ) : (
                            segs.map((seg) => (
                              <span
                                key={seg.start}
                                aria-hidden="true"
                                className={cn(
                                  "absolute inset-y-0.5 rounded-sm",
                                  BAR[kind],
                                  !seg.open && styles.fade,
                                )}
                                style={{
                                  left: `${axisPercent(axis, seg.start)}%`,
                                  width: `${widthPercent(axis, seg.start, seg.end)}%`,
                                }}
                              />
                            ))
                          )}
                          {item.edition?.christmasDay === "closed" &&
                            christmas >= axis.start &&
                            christmas <= axis.end && (
                              <span
                                aria-hidden="true"
                                className={cn("absolute inset-y-0 rounded-sm", styles.hatch)}
                                style={{
                                  left: `${axisPercent(axis, christmas)}%`,
                                  width: `${widthPercent(axis, christmas, christmas)}%`,
                                }}
                              />
                            )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {/* 今日と12月25日の線。行の列だけにかける。 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-[9.25rem] right-0 sm:left-[10.75rem]"
          >
            <span
              className="absolute inset-y-0 border-l-2 border-dashed border-red-600/70"
              style={{ left: `${axisPercent(axis, christmas)}%` }}
            />
            {showToday && (
              <span
                className="absolute inset-y-0 border-l-2 border-neutral-900 dark:border-white"
                style={{ left: `${axisPercent(axis, today)}%` }}
              >
                <span className="absolute -top-0.5 left-1 whitespace-nowrap rounded bg-neutral-900 px-1 text-xs font-bold leading-4 text-white dark:bg-white dark:text-neutral-900">
                  今日
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
      <figcaption className="border-t border-neutral-200 px-4 py-3 text-xs leading-relaxed text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
        棒は会期、赤い斜線は12月25日の休み、赤い点線は12月25日。先が薄くなっている棒は、終わりの日が発表されていないもの(灯りは例年1月上旬に外されます)。
        {showToday ? "黒い線が今日です。" : ""}
      </figcaption>
    </figure>
  );
}
