import { format } from "date-fns";
import { MapPin } from "lucide-react";
import type { Event } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

function periodLabel(start: Date, end: Date): string {
  if (start.getTime() === end.getTime()) return format(start, "M/d");
  return `${format(start, "M/d")}〜${format(end, "M/d")}`;
}

/**
 * その週に開催中の定番イベント。
 *
 * 号の主役ではない補足情報なので、カードを並べず1行1件のリストにする。
 * 8件前後になることが多く、狭い画面ではカードだと縦に伸びすぎる。
 */
export default function StapleEventList({ events }: { events: Event[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border dark:divide-neutral-800 dark:border-neutral-700">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-baseline sm:gap-4 dark:hover:bg-neutral-800/40"
        >
          <span className="shrink-0 text-xs font-semibold tabular-nums text-primary sm:w-24">
            {periodLabel(event.startDate, event.endDate)}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug dark:text-white">
              {event.title}
              {event.isFree && (
                <Badge
                  variant="outline"
                  className="ml-2 border-emerald-600/40 bg-emerald-600/10 align-middle text-[10px] text-emerald-700 dark:text-emerald-400"
                >
                  無料
                </Badge>
              )}
            </p>
            {event.venue && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
                <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                <span className="line-clamp-1">{event.venue}</span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
