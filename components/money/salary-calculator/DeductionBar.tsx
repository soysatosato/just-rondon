"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatGbp, formatGbpDelta, formatPercent } from "@/lib/money/take-home/format";
import { SERIES, type SeriesKey } from "./series";

/**
 * 額面の£100がどこへ行くか、の帯グラフと内訳。
 *
 * 円グラフにしないのは、所得税とNIのように近い大きさの項目の比較が
 * 角度では読めないため。1本の帯に並べ、同じ行に名前・金額・割合を書く。
 * 帯の区切りは線を引かず、2px の隙間で分ける。
 *
 * 帯にカーソルを載せると内訳の行が、内訳の行に載せると帯の区間が
 * 強調される。どちらからでも同じ項目を指せるようにしてある。
 */
export default function DeductionBar({
  values,
  gross,
  divisor,
  deltas,
}: {
  /** 年額。 */
  values: Record<SeriesKey, number>;
  gross: number;
  /** 表示単位に割る数(月なら12)。 */
  divisor: number;
  /** 保存した条件との差(年額)。無ければ出さない。 */
  deltas?: Record<SeriesKey, number> | null;
}) {
  const [active, setActive] = useState<SeriesKey | null>(null);
  const visible = SERIES.filter((s) => values[s.key] > 0.004);

  return (
    <div>
      <div
        className="flex h-3.5 w-full gap-[2px] overflow-hidden rounded bg-muted"
        role="img"
        aria-label={`額面の内訳: ${visible
          .map(
            (s) =>
              `${s.label} ${formatPercent(gross > 0 ? values[s.key] / gross : 0)}`,
          )
          .join("、")}`}
      >
        {gross > 0 &&
          visible.map((s) => (
            <div
              key={s.key}
              onPointerEnter={() => setActive(s.key)}
              onPointerLeave={() => setActive(null)}
              className={cn(
                "h-full transition-[width,opacity] duration-500 ease-out",
                s.fill,
                active && active !== s.key && "opacity-35",
              )}
              style={{ width: `${(values[s.key] / gross) * 100}%` }}
            />
          ))}
      </div>

      <ul className="mt-4 divide-y divide-border/70">
        {SERIES.map((s) => {
          const value = values[s.key];
          if (value <= 0.004 && s.key !== "takeHome" && !(deltas && Math.abs(deltas[s.key]) > 0.5)) {
            return null;
          }
          const delta = deltas?.[s.key] ?? 0;
          return (
            <li
              key={s.key}
              onPointerEnter={() => setActive(s.key)}
              onPointerLeave={() => setActive(null)}
              className={cn(
                "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-2 transition-opacity",
                active && active !== s.key && "opacity-50",
              )}
            >
              <span
                aria-hidden
                className={cn("h-2.5 w-2.5 rounded-[3px]", s.fill)}
              />
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm",
                    s.key === "takeHome"
                      ? "font-semibold text-foreground"
                      : "text-foreground/90",
                  )}
                >
                  {s.label}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {s.english}
                </span>
              </span>
              <span className="text-right">
                <span
                  className={cn(
                    "block text-sm tabular-nums",
                    s.key === "takeHome" ? "font-semibold" : "font-medium",
                  )}
                >
                  {s.key === "takeHome" ? "" : "−"}
                  {formatGbp(value / divisor)}
                </span>
                <span className="block text-[11px] tabular-nums text-muted-foreground">
                  {formatPercent(gross > 0 ? value / gross : 0)}
                  {deltas && Math.abs(delta) >= 0.5 && (
                    <span
                      className={cn(
                        "ml-1.5 font-medium",
                        // 年金は自分の資産なので、増減に良し悪しの色を付けない。
                        s.key === "pension"
                          ? "text-foreground/80"
                          : (s.key === "takeHome" ? delta > 0 : delta < 0)
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {formatGbpDelta(delta / divisor)}
                    </span>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
