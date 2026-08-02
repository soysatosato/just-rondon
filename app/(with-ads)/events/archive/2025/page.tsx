import { fetchEvents2025 } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import EventMonthCard from "@/components/events/EventMonthCard";

export const metadata = buildPageMetadata({
  path: "/events/archive/2025",
  title: "ロンドンイベントカレンダー 2025年アーカイブ | 月別の祭り・マーケット・季節の行事",
  description:
    "2025年にロンドンで開催されたイベントを月別にまとめたアーカイブ。最新のカレンダーは2026年版をご覧ください。",
  keywords: [
    "ロンドン イベント 2025",
    "ロンドン イベントカレンダー",
    "ロンドン 祭り",
  ],
});

export default async function Events2025ArchivePage() {
  const contents = await fetchEvents2025();

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 text-center dark:text-white">
        ロンドンイベントカレンダー 2025（アーカイブ）
      </h1>

      <p className="text-center text-muted-foreground mb-10 dark:text-gray-400">
        2025年に開催されたイベントのアーカイブです。最新の情報は
        <a href="/events" className="underline hover:text-primary">
          2026年版カレンダー
        </a>
        をご覧ください。
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contents.map((content, index) => (
          <EventMonthCard
            key={content.id}
            content={content}
            fallbackMonthNumber={index + 1}
            basePath="/events/archive/2025"
          />
        ))}
      </div>
    </main>
  );
}
