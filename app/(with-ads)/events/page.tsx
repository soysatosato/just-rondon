import Link from "next/link";
import { fetchEvents2026 } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import EventMonthCard from "@/components/events/EventMonthCard";

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
  const contents = await fetchEvents2026();

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
        ロンドンイベントカレンダー 2026
      </h1>

      <p className="text-center text-muted-foreground mb-10 dark:text-gray-400">
        四季を巡る、ロンドンの一年。気になる月を選んでください。
      </p>

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
