import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";

import {
  fetchBriefBySlug,
  fetchLatestBrief,
  fetchBackIssues,
  fetchEventsForWeek,
} from "@/utils/actions/weekly";
import { buildPageMetadata } from "@/lib/seo";
import { formatWeekRange, getIssueFreshness } from "@/lib/weekly";
import { buildBriefJsonLd } from "@/lib/weeklyJsonLd";
import { fetchForecastForWeek } from "@/lib/weather/forecast";
import WeeklyBriefView from "@/components/events/WeeklyBriefView";
import BackIssueList from "@/components/events/BackIssueList";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 60 * 60;

/** 最新号は /events と同じ内容になるので、canonical をそちらに寄せて重複を避ける。 */
async function isLatest(slug: string): Promise<boolean> {
  const latest = await fetchLatestBrief();
  return latest?.slug === slug;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const brief = await fetchBriefBySlug(params.slug);

  if (!brief) {
    return buildPageMetadata({
      path: `/events/week/${params.slug}`,
      title: "今週のロンドン | ジャスト・ロンドン",
      description: "ロンドンの週ごとの最新情報をまとめています。",
      noindex: true,
    });
  }

  const range = formatWeekRange(brief.weekStart, brief.weekEnd).replace(
    /\([日月火水木金土]\)/g,
    ""
  );

  return buildPageMetadata({
    // 最新号のあいだは /events を正とする。翌週になれば自分のURLが正になる。
    path: (await isLatest(params.slug)) ? "/events" : `/events/week/${params.slug}`,
    title: `${brief.title.replace(/^今週のロンドン/, "ロンドン")} | ストライキ・イベント・耳寄り情報`,
    description: brief.headline.slice(0, 120),
    type: "article",
    publishedTime: brief.createdAt.toISOString(),
    modifiedTime: brief.updatedAt.toISOString(),
  });
}

export default async function WeeklyBriefPage({
  params,
}: {
  params: { slug: string };
}) {
  const brief = await fetchBriefBySlug(params.slug);
  if (!brief) return notFound();

  const freshness = getIssueFreshness(brief.weekStart);

  const [staples, backIssues, forecast] = await Promise.all([
    fetchEventsForWeek(brief.weekStart, brief.weekEnd),
    fetchBackIssues(6, brief.slug),
    // 過去号では取りに行かない。終わった週の予報は出しても意味がない。
    fetchForecastForWeek(brief.weekStart, brief.weekEnd, freshness.isPast),
  ]);

  // 過去号の催し物を Event として出すと、終わったものを案内することになる。
  // 記事の構造化データだけに絞る。
  const jsonLd = freshness.isPast
    ? buildBriefJsonLd({ ...brief, items: [] })
    : buildBriefJsonLd(brief);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-5">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          最新号へ
        </Link>
      </div>

      <WeeklyBriefView brief={brief} staples={staples} forecast={forecast} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <BackIssueList issues={backIssues} />

      {/*
       * 奥付。号の終わりを示す太罫の下に、調査時点と次の導線を置く。
       * 中央揃えのボタンをやめたのは、本文が左揃えで通っているため。
       */}
      <footer className="mt-12 border-t-2 border-foreground pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground dark:text-gray-500">
          {freshness.isPast
            ? `この号は${format(brief.researchedAt, "yyyy年M月d日")}時点の調査です。現在の状況とは異なります。`
            : `この号は${format(brief.researchedAt, "yyyy年M月d日")}時点の調査です。出発前に各公式サイトで最新の状況を確認してください。`}
        </p>
        <Link
          href="/events"
          className="group mt-4 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground dark:text-white"
        >
          最新号を読む
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </footer>
    </main>
  );
}
