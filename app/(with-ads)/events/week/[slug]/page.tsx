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
import WeeklyBriefView from "@/components/events/WeeklyBriefView";
import BackIssueList from "@/components/events/BackIssueList";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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

  const [staples, backIssues] = await Promise.all([
    fetchEventsForWeek(brief.weekStart, brief.weekEnd),
    fetchBackIssues(6, brief.slug),
  ]);

  const freshness = getIssueFreshness(brief.weekStart);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: brief.title,
    description: brief.headline,
    datePublished: brief.createdAt.toISOString(),
    dateModified: brief.updatedAt.toISOString(),
    inLanguage: "ja",
    about: { "@type": "City", name: "London" },
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link href="/events">
          <Button variant="outline" className="dark:border-neutral-600">
            ← 最新号へ
          </Button>
        </Link>
      </div>

      <WeeklyBriefView brief={brief} staples={staples} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-6" />

      <Separator className="my-8 dark:bg-neutral-700" />

      <BackIssueList issues={backIssues} />

      <p className="mt-8 text-center text-xs text-muted-foreground dark:text-gray-400">
        {freshness.isPast
          ? `この号は${format(brief.researchedAt, "yyyy年M月d日")}時点の調査です。現在の状況とは異なります。`
          : `この号は${format(brief.researchedAt, "yyyy年M月d日")}時点の調査です。出発前に各公式サイトで最新の状況を確認してください。`}
      </p>

      <div className="mt-8 text-center">
        <Link href="/events">
          <Button className="mx-auto">最新号へ戻る</Button>
        </Link>
      </div>
    </main>
  );
}
