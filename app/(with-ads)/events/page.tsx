import Link from "next/link";
import { format } from "date-fns";
import { fetchEvents2026, fetchUpcomingEvents } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import EventMonthCard from "@/components/events/EventMonthCard";
import { getMonthSlug } from "@/lib/events";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = buildPageMetadata({
  path: "/events",
  title: "ロンドンイベントカレンダー | 月別の祭り・マーケット・季節の行事",
  description:
    "ロンドンで開催されるイベントを月別にまとめたカレンダー。春のフラワーショー、夏の野外フェス、秋の芸術イベント、冬のクリスマスマーケットまで、旅行の時期選びに役立つ季節の行事を紹介します。",
  keywords: [
    "ロンドン イベント",
    "ロンドン イベントカレンダー",
    "ロンドン 祭り",
    "ロンドン 季節",
    "ロンドン クリスマスマーケット",
    "ロンドン 旅行 時期",
  ],
});

export default async function Events2026Page() {
  const now = new Date();
  const contents = await fetchEvents2026();
  const upcomingEvents = await fetchUpcomingEvents(6, now);

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
        ロンドンイベントカレンダー 2026
      </h1>

      <p className="text-center text-muted-foreground mb-10 dark:text-gray-400">
        四季を巡る、ロンドンの一年。気になる月を選んでください。
      </p>

      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
            開催中・近日開催のイベント
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => {
              const sameDay = event.startDate.getTime() === event.endDate.getTime();
              const dateLabel = sameDay
                ? format(event.startDate, "M月d日")
                : `${format(event.startDate, "M月d日")}〜${format(event.endDate, "M月d日")}`;
              // 開催中の長期イベントは開始月ではなく今月のページに送る
              const ongoing = event.startDate <= now;
              const linkTarget = ongoing ? now : event.startDate;
              const monthSlug = getMonthSlug(
                linkTarget.getUTCFullYear(),
                linkTarget.getUTCMonth() + 1
              );

              return (
                <Link key={event.id} href={`/events/${monthSlug}`}>
                  <Card className="h-full rounded-2xl transition-shadow hover:shadow-md dark:bg-neutral-900 dark:border-neutral-700">
                    <CardContent className="p-4">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-primary">
                          {dateLabel}
                        </span>
                        {ongoing && (
                          <Badge
                            variant="outline"
                            className="border-primary/40 bg-primary/10 text-[10px] text-primary"
                          >
                            開催中
                          </Badge>
                        )}
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
                        <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground dark:text-gray-400">
                          {event.venue}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contents.map((content, index) => (
          <EventMonthCard
            key={content.id}
            content={content}
            fallbackMonthNumber={index + 1}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-10 dark:text-gray-400">
        <Link href="/events/archive/2025" className="underline hover:text-primary">
          2025年のカレンダーを見る
        </Link>
      </p>
    </main>
  );
}
