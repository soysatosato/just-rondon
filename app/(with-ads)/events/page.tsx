import Link from "next/link";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import type { Metadata } from "next";

import {
  fetchLatestBrief,
  fetchBackIssues,
  fetchEventsForWeek,
} from "@/utils/actions/weekly";
import { fetchEvents2026 } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { formatWeekRange } from "@/lib/weekly";
import { buildBriefJsonLd } from "@/lib/weeklyJsonLd";
import WeeklyBriefView from "@/components/events/WeeklyBriefView";
import BackIssueList from "@/components/events/BackIssueList";
import EventMonthCard from "@/components/events/EventMonthCard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// 号は週に1本だが、ストライキ情報は数日で覆る。カレンダーより短く取る。
export const revalidate = 60 * 10;

const FALLBACK_METADATA = {
  path: "/events",
  title: "今週のロンドン | ストライキ・イベント・耳寄り情報の週間ダイジェスト",
  description:
    "ロンドンの今週の状況を毎週まとめています。地下鉄・鉄道のストライキや運休、美術館の臨時休館、その週だけの催しや無料開放など、旅行の直前に知っておきたい情報を出典つきで紹介します。",
  keywords: [
    "ロンドン 今週",
    "ロンドン ストライキ",
    "ロンドン 地下鉄 運休",
    "ロンドン イベント 今週",
    "ロンドン 旅行 最新情報",
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const brief = await fetchLatestBrief();
  if (!brief) return buildPageMetadata(FALLBACK_METADATA);

  const range = formatWeekRange(brief.weekStart, brief.weekEnd).replace(
    /\([日月火水木金土]\)/g,
    ""
  );

  return buildPageMetadata({
    ...FALLBACK_METADATA,
    title: `今週のロンドン(${range}) | ストライキ・イベント・耳寄り情報`,
    description: brief.headline.slice(0, 120),
    modifiedTime: brief.updatedAt.toISOString(),
  });
}

/** 号が1本も無い状態でも /events が壊れないよう、カレンダーを出しておく。 */
async function CalendarFallback() {
  const contents = await fetchEvents2026();

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-6 text-center text-3xl font-bold dark:text-white">
        ロンドンイベントカレンダー 2026
      </h1>
      <p className="mb-10 text-center text-muted-foreground dark:text-gray-400">
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
    </main>
  );
}

export default async function EventsPage() {
  const brief = await fetchLatestBrief();
  if (!brief) return <CalendarFallback />;

  const [staples, backIssues] = await Promise.all([
    fetchEventsForWeek(brief.weekStart, brief.weekEnd),
    fetchBackIssues(6, brief.slug),
  ]);

  // 号そのものは /events/week/<slug> にも同じ内容で出る。検索エンジンには
  // 毎週更新されるこの /events を正とみなしてほしいので、記事の JSON-LD も
  // ここを id にする。
  const jsonLd = buildBriefJsonLd(brief, {
    articleId: "https://www.just-rondon.com/events",
  });

  return (
    <main className="container mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <WeeklyBriefView brief={brief} staples={staples} />

      <Separator className="my-8 dark:bg-neutral-700" />

      <BackIssueList issues={backIssues} />

      <div className="rounded-2xl border border-border bg-muted/40 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarRange className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold dark:text-white">
          年間のイベントを探す
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground dark:text-gray-400">
          チェルシー・フラワーショーやクリスマスマーケットなど、1年前から日程が決まっている
          恒例行事は月別カレンダーにまとめています。旅行の時期を決めるときはこちらへ。
        </p>
        <Link href="/events/calendar" className="mt-4 inline-block">
          <Button>2026年のイベントカレンダーを見る</Button>
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground dark:text-gray-400">
        この号は{format(brief.researchedAt, "yyyy年M月d日")}時点の調査です。
        運行情報や開催情報は変わることがあるため、出発前に各公式サイトで最新の状況を確認してください。
      </p>
    </main>
  );
}
