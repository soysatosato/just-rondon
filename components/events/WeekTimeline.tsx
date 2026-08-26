import { Umbrella } from "lucide-react";

import type { DailyForecast } from "@/lib/weather/forecast";
import type { DaySlot } from "@/lib/weekly";
import { cn } from "@/lib/utils";

/**
 * 会期の7日を1列ずつ並べ、その日の件数と天気を1枚に重ねたもの。
 *
 * 設計上の判断:
 *
 * 1. **号の冒頭に置く。** 以前は天気だけを一覧の下に置いていたが、
 *    「どれに行くか」を決めたあとにしか傘の情報が見えなかった。件数と
 *    天気を同じ列に載せると「土曜は4件あるが降水60%」が一目で分かり、
 *    行く日を決める前に判断できる。
 * 2. **件数は「その日に始まる/終わる」もの。** 会期の長い展示を毎日
 *    数えると全日が同じ件数になり、曜日の差が消える。
 * 3. **天気は無くても崩れない。** 予報は7日先までしか取れず、来週号や
 *    過去号では days が空になる。列は日付側で作り、天気は載っていれば
 *    重ねる、という向きにしている。
 * 4. 件数が0の日も列は残す。「その日は何も無い」ことも旅程を組む情報。
 */

/** この確率以上なら傘の印を出す。40%はロンドンだと「降ると思って動く」境目。 */
const UMBRELLA_THRESHOLD = 40;

export default function WeekTimeline({
  slots,
  /** 会期と重なる日の予報。無い場合は空配列。 */
  forecast = [],
  /**
   * 着地点の id が振られている日付。ここに無い日はリンクにしない。
   * 件数が0の日はもちろん、件数があっても代表の項目に id が振られて
   * いない日はリンク切れになるため、呼び出し側の実際の割り当てを見る。
   */
  linkableDates,
}: {
  slots: DaySlot[];
  forecast?: DailyForecast[];
  linkableDates: ReadonlySet<string>;
}) {
  if (slots.length === 0) return null;

  const byDate = new Map(forecast.map((d) => [d.date, d]));
  const hasForecast = forecast.length > 0;
  const isPartial = hasForecast && forecast.length < slots.length;

  // 件数の最も多い日を控えめに強調する。その週の山がどこかを示す。
  const maxCount = Math.max(...slots.map((s) => s.count));

  return (
    <section aria-label="今週の日別の予定と天気" className="mb-8">
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {slots.map((slot) => {
          const day = byDate.get(slot.date);
          const rainy =
            day?.precipitation != null &&
            day.precipitation >= UMBRELLA_THRESHOLD;
          const isPeak = slot.count > 0 && slot.count === maxCount;

          // 飛び先が無い日はリンクにしない。押しても動かないリンクは
          // 「壊れている」と受け取られるので、最初から div で出す。
          const linkable = linkableDates.has(slot.date);
          const Cell = linkable ? "a" : "div";

          return (
            <li key={slot.date}>
              <Cell
                href={linkable ? `#day-${slot.date}` : undefined}
                className={cn(
                  "flex h-full flex-col items-center gap-1 rounded-xl border px-1.5 py-2.5 text-center",
                  linkable &&
                    "transition-colors hover:bg-muted/60 dark:hover:bg-neutral-800/50",
                  day?.isToday
                    ? "border-primary/50 bg-primary/5"
                    : "border-border dark:border-neutral-700"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    day?.isToday
                      ? "text-primary"
                      : slot.isWeekend
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground dark:text-gray-400"
                  )}
                >
                  {slot.label}({slot.weekday})
                </span>

                {day && (
                  <>
                    <span className="text-lg leading-none" aria-hidden>
                      {day.icon}
                    </span>
                    <span className="sr-only">{day.weather}</span>
                  </>
                )}

                {day?.precipitation != null && (
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
                      rainy
                        ? "text-sky-700 dark:text-sky-400"
                        : "text-muted-foreground dark:text-gray-400"
                    )}
                  >
                    {rainy && <Umbrella className="h-3 w-3 shrink-0" />}
                    {day.precipitation}%
                  </span>
                )}

                {day && (
                  <span className="text-[10px] tabular-nums text-muted-foreground dark:text-gray-400">
                    {day.tempMax}° / {day.tempMin}°
                  </span>
                )}

                {/* 件数は列の下端に置き、天気の有無で位置がぶれないよう mt-auto で押し下げる。 */}
                <span
                  className={cn(
                    "mt-auto pt-1 text-[11px] font-semibold tabular-nums",
                    slot.count === 0
                      ? "text-muted-foreground/50 dark:text-gray-600"
                      : isPeak
                        ? "text-primary"
                        : "text-foreground dark:text-gray-200"
                  )}
                >
                  {slot.count === 0 ? "—" : `${slot.count}件`}
                </span>
              </Cell>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground dark:text-gray-400">
        件数はその日に始まる・終わるもの。
        {hasForecast && "数字は降水確率。天気の出典は Open-Meteo。"}
        {isPartial && "予報は7日先までのため、会期の後半は出していない。"}
      </p>
    </section>
  );
}
