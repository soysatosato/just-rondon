import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { CalendarDays, MapPin, Train, Ticket, Lightbulb, Check } from "lucide-react";
import type { Event } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatPeriod(start: Date, end: Date): string {
  if (start.getTime() === end.getTime()) return format(start, "M月d日");
  return `${format(start, "M月d日")}〜${format(end, "M月d日")}`;
}

export default function EventDetailCard({
  event,
  index,
  iconWrapClass,
}: {
  event: Event;
  index: number;
  iconWrapClass: string;
}) {
  const facts = [
    { icon: CalendarDays, label: formatPeriod(event.startDate, event.endDate) },
    event.venue ? { icon: MapPin, label: event.venue } : null,
    event.nearestStation ? { icon: Train, label: event.nearestStation } : null,
    event.priceInfo ? { icon: Ticket, label: event.priceInfo } : null,
  ].filter((f): f is { icon: typeof CalendarDays; label: string } => f !== null);

  return (
    <Card className="rounded-2xl transition-shadow hover:shadow-md dark:bg-neutral-900 dark:border-neutral-700">
      <CardContent className="flex gap-4 p-5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            iconWrapClass
          )}
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold dark:text-white">{event.title}</h3>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {event.isFree && (
              <Badge className="border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400" variant="outline">
                入場無料
              </Badge>
            )}
            {event.bookingRequired && (
              <Badge variant="outline" className="dark:border-neutral-600 dark:text-gray-300">
                要予約
              </Badge>
            )}
            {event.category && (
              <Badge variant="outline" className="dark:border-neutral-600 dark:text-gray-300">
                {event.category}
              </Badge>
            )}
          </div>

          <dl className="mt-3 space-y-1.5">
            {facts.map(({ icon: Icon, label }) => (
              <div key={label} className="flex gap-2 text-xs text-muted-foreground dark:text-gray-400">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0">{label}</span>
              </div>
            ))}
          </dl>

          {event.description && (
            <div className="prose prose-sm mt-3 max-w-none text-muted-foreground dark:prose-invert dark:text-gray-300">
              <ReactMarkdown>{event.description}</ReactMarkdown>
            </div>
          )}

          {event.highlights.length > 0 && (
            <div className="mt-4 rounded-xl bg-muted/50 p-3 dark:bg-neutral-800/60">
              <p className="mb-2 text-xs font-semibold dark:text-white">おすすめポイント</p>
              <ul className="space-y-1.5">
                {event.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2 text-xs text-muted-foreground dark:text-gray-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="prose prose-xs max-w-none dark:prose-invert [&_p]:m-0">
                      <ReactMarkdown>{highlight}</ReactMarkdown>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {event.tips && (
            <div className="mt-3 flex gap-2 rounded-xl border border-amber-600/30 bg-amber-600/5 p-3">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">訪問のヒント</p>
                <p className="mt-1 text-xs text-muted-foreground dark:text-gray-300">{event.tips}</p>
              </div>
            </div>
          )}

          {event.website && (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-primary underline underline-offset-2"
            >
              公式サイトを見る
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
