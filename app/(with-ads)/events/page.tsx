import Link from "next/link";
import { format } from "date-fns";
import { CalendarRange, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import {
  fetchBriefsForEventsPage,
  fetchBackIssues,
  fetchEventsForWeek,
} from "@/utils/actions/weekly";
import { fetchEvents2026 } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { formatWeekRange } from "@/lib/weekly";
import { buildBriefJsonLd } from "@/lib/weeklyJsonLd";
import { fetchForecastForWeek } from "@/lib/weather/forecast";
import WeeklyBriefView from "@/components/events/WeeklyBriefView";
import BackIssueList from "@/components/events/BackIssueList";
import EventMonthCard from "@/components/events/EventMonthCard";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
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
  // 本文と同じ号を指すようにする(来週号が出ていても本体は今週号)。
  const { brief } = await fetchBriefsForEventsPage();
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
  const { brief, upcoming } = await fetchBriefsForEventsPage();
  if (!brief) return <CalendarFallback />;

  const [staples, backIssues, forecast] = await Promise.all([
    fetchEventsForWeek(brief.weekStart, brief.weekEnd),
    // 来週号は先頭で案内するので、過去号一覧からは外す。
    fetchBackIssues(6, brief.slug).then((issues) =>
      upcoming ? issues.filter((i) => i.slug !== upcoming.slug) : issues
    ),
    // ここに出るのは常に最新号なので、過去号扱いにはならない。
    fetchForecastForWeek(brief.weekStart, brief.weekEnd, false),
  ]);

  // 号そのものは /events/week/<slug> にも同じ内容で出る。検索エンジンには
  // 毎週更新されるこの /events を正とみなしてほしいので、記事の JSON-LD も
  // ここを id にする。
  const jsonLd = buildBriefJsonLd(brief, {
    articleId: "https://www.just-rondon.com/events",
  });

  return (
    // 本文が主役のページなので、コンテナ幅いっぱいに広げず読める行長に収める。
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <JsonLd data={breadcrumbListJsonLd({ path: "/events" })} />

      <Breadcrumbs path="/events" className="mb-5" />

      {/* 次号の予告。題字の上に細く1行だけ置き、本体の号より前に出さない。 */}
      {upcoming && (
        <Link
          href={`/events/week/${upcoming.slug}`}
          className="group mb-5 flex items-center gap-3 border-b border-border pb-3 transition-colors hover:border-foreground/40"
        >
          <span className="shrink-0 font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Next Issue
          </span>
          <span className="min-w-0 flex-1 text-xs font-bold leading-snug tabular-nums dark:text-gray-200">
            {formatWeekRange(upcoming.weekStart, upcoming.weekEnd).replace(
              /\([日月火水木金土]\)/g,
              ""
            )}
            の号を先に読む
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      <WeeklyBriefView brief={brief} staples={staples} forecast={forecast} />

      <BackIssueList issues={backIssues} />

      {/*
       * 年間カレンダーへの導線。号の本体と同じ罫の組みに揃え、
       * 塗った箱にしない。囲うと、号より後に置いた補足のほうが強く見える。
       */}
      <section className="border-t-2 border-foreground pt-4">
        <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          The Year Ahead
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl dark:text-white">
              <CalendarRange className="h-4 w-4 shrink-0 opacity-60" />
              年間のイベントを探す
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground dark:text-gray-400">
              チェルシー・フラワーショーやクリスマスマーケットなど、1年前から日程が決まっている
              恒例行事は月別カレンダーにまとめています。旅行の時期を決めるときはこちらへ。
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 sm:mt-1">
            <Link href="/events/calendar">2026年のカレンダーへ →</Link>
          </Button>
        </div>
      </section>

      {/* 奥付。 */}
      <p className="mt-10 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground dark:border-neutral-800 dark:text-gray-500">
        この号は{format(brief.researchedAt, "yyyy年M月d日")}時点の調査です。
        運行情報や開催情報は変わることがあるため、出発前に各公式サイトで最新の状況を確認してください。
      </p>
    </main>
  );
}
