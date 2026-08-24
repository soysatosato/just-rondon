import { Umbrella } from "lucide-react";

import type { DailyForecast } from "@/lib/weather/forecast";
import { cn } from "@/lib/utils";

/**
 * 号の会期と重なる日の天気予報。
 *
 * 設計上の判断:
 *
 * 1. **催しの一覧より前に置かない。** 号の主役はその週の催しであって
 *    天気ではない。「どれに行くか」を決めたあとで「傘が要るか」を
 *    確かめる順序になるよう、定番イベントの手前に補足として挟む。
 * 2. 降水確率を主役にする。lib/weather/forecast.ts の方針どおり、
 *    イギリスでは気温より「雨が降るか」が旅程を左右する。気温は
 *    添え物として最高/最低を1行に畳む。
 * 3. 予報が7日ぶんしか無いので、会期の後半が欠けることがある。
 *    欠けた日を空欄で見せると「予報が無い」のか「載せ忘れ」なのか
 *    区別がつかないため、取れた日だけを並べて注記で理由を書く。
 * 4. 過去号では呼び出し側が丸ごと出さない。終わった週の予報は
 *    情報として無価値なうえ、予報APIは過去日を返さない。
 */

/** この確率以上なら傘の印を出す。40%はロンドンだと「降ると思って動く」境目。 */
const UMBRELLA_THRESHOLD = 40;

export default function WeekForecast({
  days,
  /** 会期の日数。予報が足りているかの判定に使う。 */
  weekLength,
}: {
  days: DailyForecast[];
  weekLength: number;
}) {
  if (days.length === 0) return null;

  const isPartial = days.length < weekLength;

  return (
    <section>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
        {days.map((day) => {
          const rainy =
            day.precipitation !== null && day.precipitation >= UMBRELLA_THRESHOLD;

          return (
            <div
              key={day.date}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border border-border px-2 py-3 dark:border-neutral-700",
                day.isToday && "border-primary/50 bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums text-muted-foreground dark:text-gray-400",
                  day.isToday && "text-primary"
                )}
              >
                {day.label}
              </span>

              <span className="text-xl leading-none" aria-hidden>
                {day.icon}
              </span>
              <span className="sr-only">{day.weather}</span>

              {day.precipitation !== null && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold tabular-nums",
                    rainy
                      ? "text-sky-700 dark:text-sky-400"
                      : "text-muted-foreground dark:text-gray-400"
                  )}
                >
                  {rainy && <Umbrella className="h-3 w-3 shrink-0" />}
                  {day.precipitation}%
                </span>
              )}

              <span className="text-[11px] tabular-nums text-muted-foreground dark:text-gray-400">
                {day.tempMax}° / {day.tempMin}°
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground dark:text-gray-400">
        出典: Open-Meteo。数字は降水確率。
        {isPartial && "予報は7日先までのため、会期の後半は出していない。"}
      </p>
    </section>
  );
}
