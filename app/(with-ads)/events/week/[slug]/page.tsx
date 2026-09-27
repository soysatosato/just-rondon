import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";

import {
  fetchBriefBySlug,
  fetchBriefsForEventsPage,
  fetchBackIssues,
  fetchEventsForWeek,
} from "@/utils/actions/weekly";
import { buildPageMetadata } from "@/lib/seo";
import { weeklyOgImage } from "@/lib/og";
import { formatWeekRange, getIssueFreshness } from "@/lib/weekly";
import { buildBriefJsonLd } from "@/lib/weeklyJsonLd";
import { fetchForecastForWeek } from "@/lib/weather/forecast";
import WeeklyBriefView from "@/components/events/WeeklyBriefView";
import BackIssueList from "@/components/events/BackIssueList";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { AD_SLOTS } from "@/lib/adsense";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 60 * 60;

/**
 * /events に本体として出ている号は同じ内容になるので、canonical をそちらに寄せて
 * 重複を避ける。
 *
 * 比べる相手は「公開済みで最も先の週の号」ではなく、/events が実際に出している号。
 * 号は2週ほど先まで作って公開するので、以前のように最新号と比べると、まだ先の
 * 週の号が /events(中身は今週号)を canonical・og:url に指してしまい、その号の
 * リンクを Facebook や LINE で共有すると別の週のカードが出ていた。
 */
async function isShownOnEventsPage(slug: string): Promise<boolean> {
  const { brief } = await fetchBriefsForEventsPage();
  return brief?.slug === slug;
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
    path: (await isShownOnEventsPage(params.slug)) ? "/events" : `/events/week/${params.slug}`,
    title: `${brief.title.replace(/^今週のロンドン/, "ロンドン")} | ストライキ・イベント・耳寄り情報`,
    description: brief.headline.slice(0, 120),
    type: "article",
    publishedTime: brief.createdAt.toISOString(),
    modifiedTime: brief.updatedAt.toISOString(),
    images: [weeklyOgImage(brief)],
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

      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/events",
          current: brief.title,
          currentHref: `/events/week/${brief.slug}`,
        })}
      />

      <Breadcrumbs path="/events" current={brief.title} className="mb-5" />

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
