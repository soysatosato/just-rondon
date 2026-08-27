import { format } from "date-fns";
import type { Event } from "@prisma/client";

function periodLabel(start: Date, end: Date): string {
  if (start.getTime() === end.getTime()) return format(start, "M/d");
  return `${format(start, "M/d")}〜${format(end, "M/d")}`;
}

/**
 * その週に開催中の定番イベント。
 *
 * 号の主役ではない補足情報なので、1行1件のリストにする。8件前後に
 * なることが多く、狭い画面ではカードだと縦に伸びすぎる。
 * 角丸の外枠をやめて上下の細罫だけにしたのは、号の本体(罫で区切った項目の
 * 並び)と同じ組みに揃えるため。囲うと、補足のほうが本体より強く見えてしまう。
 */
export default function StapleEventList({ events }: { events: Event[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border dark:divide-neutral-800 dark:border-neutral-800">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 py-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-baseline sm:gap-5 dark:hover:bg-neutral-900"
        >
          <span className="shrink-0 font-serif text-xs tabular-nums text-muted-foreground sm:w-24 dark:text-gray-500">
            {periodLabel(event.startDate, event.endDate)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug dark:text-white">
              {event.title}
              {event.isFree && (
                <span className="ml-2 align-middle text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  無料
                </span>
              )}
            </p>
            {event.venue && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground dark:text-gray-400">
                {event.venue}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
