import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { fetchEvents2026 } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import EventMonthCard from "@/components/events/EventMonthCard";
import { Button } from "@/components/ui/button";

export const revalidate = 60 * 60;

export const metadata = buildPageMetadata({
  path: "/events/calendar",
  title: "ロンドンイベントカレンダー2026 | 月別の祭り・マーケット・季節の行事",
  description:
    "ロンドンで開催されるイベントを月別にまとめた年間カレンダー。春のフラワーショー、夏の野外フェス、秋の芸術イベント、冬のクリスマスマーケットまで、旅行の時期選びに役立つ季節の行事を紹介します。",
  keywords: [
    "ロンドン イベントカレンダー",
    "ロンドン イベント 月別",
    "ロンドン 祭り",
    "ロンドン 季節",
    "ロンドン クリスマスマーケット",
    "ロンドン 旅行 時期",
  ],
});

export default async function EventsCalendarPage() {
  const contents = await fetchEvents2026();

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <Link href="/events">
          <Button variant="outline" className="dark:border-neutral-600">
            ← 今週のロンドンへ
          </Button>
        </Link>
      </div>

      <div className="mb-10 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarRange className="h-7 w-7" />
        </span>
        <h1 className="text-3xl font-bold dark:text-white">
          ロンドンイベントカレンダー 2026
        </h1>
        <p className="mt-3 text-muted-foreground dark:text-gray-400">
          四季を巡る、ロンドンの一年。旅行の時期を決めるときに使ってください。
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground dark:text-gray-400">
          こちらは1年前から日程が決まっている恒例行事のカレンダーです。ストライキや突発的な催しなど、
          その週にならないと分からない情報は
          <Link href="/events" className="mx-1 underline hover:text-primary">
            今週のロンドン
          </Link>
          にまとめています。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contents.map((content, index) => (
          <EventMonthCard
            key={content.id}
            content={content}
            fallbackMonthNumber={index + 1}
          />
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground dark:text-gray-400">
        <Link
          href="/events/archive/2025"
          className="underline hover:text-primary"
        >
          2025年のカレンダーを見る
        </Link>
      </p>
    </main>
  );
}
