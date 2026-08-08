import Link from "next/link";
import { format } from "date-fns";
import { CalendarRange, Search, CalendarDays, MapPin } from "lucide-react";
import type { Event, WeeklyBrief, WeeklyBriefItem } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatWeekRange,
  getIssueFreshness,
  getKindMeta,
  GROUP_META,
  GROUP_ORDER,
  type BriefGroup,
} from "@/lib/weekly";
import BriefItemCard from "@/components/events/BriefItemCard";

type BriefWithItems = WeeklyBrief & { items: WeeklyBriefItem[] };

function StapleEventCard({ event }: { event: Event }) {
  const sameDay = event.startDate.getTime() === event.endDate.getTime();
  const dateLabel = sameDay
    ? format(event.startDate, "M月d日")
    : `${format(event.startDate, "M月d日")}〜${format(event.endDate, "M月d日")}`;

  return (
    <Card className="h-full rounded-2xl dark:border-neutral-700 dark:bg-neutral-900">
      <CardContent className="p-4">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </span>
          {event.isFree && (
            <Badge
              variant="outline"
              className="border-emerald-600/40 bg-emerald-600/10 text-[10px] text-emerald-700 dark:text-emerald-400"
            >
              無料
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium leading-snug dark:text-white">
          {event.title}
        </p>
        {event.venue && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function WeeklyBriefView({
  brief,
  staples,
  /** h1 として出すか(=そのページの主役か)。 */
  asHeading = true,
  now = new Date(),
}: {
  brief: BriefWithItems;
  staples: Event[];
  asHeading?: boolean;
  now?: Date;
}) {
  const freshness = getIssueFreshness(brief.weekStart, now);
  const Title = asHeading ? "h1" : "h2";

  // 項目を「注意 / 耳寄り / 前提」の3グループに束ねる。
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: brief.items.filter(
      (item) => getKindMeta(item.kind).group === (group as BriefGroup)
    ),
  })).filter(({ items }) => items.length > 0);

  return (
    <div>
      <header className="mb-8 text-center">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary"
          >
            {freshness.label}
          </Badge>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground dark:text-gray-400">
            <CalendarRange className="h-4 w-4" />
            {formatWeekRange(brief.weekStart, brief.weekEnd)}
          </span>
        </div>

        <Title className="text-2xl font-bold md:text-3xl dark:text-white">
          {brief.title}
        </Title>

        <p className="mx-auto mt-4 max-w-2xl text-left text-base font-medium leading-relaxed dark:text-gray-100">
          {brief.headline}
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-left text-sm leading-relaxed text-muted-foreground dark:text-gray-400">
          {brief.summary}
        </p>

        {/* いつ時点の情報かを出さないと、ストライキや休館の記述は誤情報になりうる。 */}
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground dark:bg-neutral-800 dark:text-gray-400">
          <Search className="h-3 w-3" />
          {format(brief.researchedAt, "yyyy年M月d日")} 時点の調査
        </p>
      </header>

      {/* 過去号は情報が古い。読者が気づかず従うのを防ぐ。 */}
      {freshness.isPast && (
        <div className="mb-8 rounded-xl border border-amber-600/30 bg-amber-600/5 p-4 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold">
            この号は{freshness.label}の情報です
          </p>
          <p className="mt-1 leading-relaxed">
            運行状況や開催情報は変わっている可能性があります。
            <Link href="/events" className="underline underline-offset-2">
              最新号
            </Link>
            を確認してください。
          </p>
        </div>
      )}

      {grouped.map(({ group, items }) => {
        const meta = GROUP_META[group];
        return (
          <section key={group} className="mb-10">
            <h2 className="text-xl font-semibold dark:text-white">
              {meta.heading}
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground dark:text-gray-400">
              {meta.note}
            </p>
            <div className="grid gap-5">
              {items.map((item) => (
                <BriefItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      {staples.length > 0 && (
        <>
          <Separator className="my-8 dark:bg-neutral-700" />
          <section className="mb-10">
            <h2 className="text-xl font-semibold dark:text-white">
              今週開催中の定番
            </h2>
            <p className="mt-1 mb-4 text-xs text-muted-foreground dark:text-gray-400">
              毎年の恒例行事や会期の長い展覧会など、この週に開催中のもの。
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staples.map((event) => (
                <StapleEventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        </>
      )}

      {brief.items.length === 0 && staples.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground dark:text-gray-400">
          この週に特筆すべき情報はありませんでした。
        </p>
      )}
    </div>
  );
}
