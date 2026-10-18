import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  fetchChangeIssueBySlug,
  fetchChangeIssues,
  fetchChangeIssueSlugs,
} from "@/utils/actions/changes";
import { buildPageMetadata } from "@/lib/seo";
import { changesOgImage } from "@/lib/og";
import { SITE_PUBLISHER } from "@/lib/jsonld";
import { formatMonthJa, getChangeIssueFreshness } from "@/lib/changes";
import ChangeIssueView from "@/components/changes/ChangeIssueView";
import ChangeIssueList from "@/components/changes/ChangeIssueList";
import PreviewBanner from "@/components/admin/PreviewBanner";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { AD_SLOTS } from "@/lib/adsense";

export const revalidate = 60 * 60;

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
// 下書きの号は公開後に初めて開かれたときに描く。
export async function generateStaticParams() {
  return fetchChangeIssueSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const issue = await fetchChangeIssueBySlug(params.slug);

  if (!issue) {
    return buildPageMetadata({
      path: `/changes/${params.slug}`,
      title: "今月変わったロンドン",
      description: "ロンドンの料金・制度の改定を毎月まとめています。",
      noindex: true,
    });
  }

  const month = formatMonthJa(issue.monthStart);

  return buildPageMetadata({
    path: `/changes/${issue.slug}`,
    title: `${month}に変わったロンドン｜運賃・料金・制度の改定まとめ`,
    description: issue.headline.slice(0, 120),
    type: "article",
    // 下書きのプレビュー中は publishedAt が無い。書いた日時を仮に出す。
    publishedTime: (issue.publishedAt ?? issue.createdAt).toISOString(),
    modifiedTime: issue.updatedAt.toISOString(),
    images: [changesOgImage(issue)],
  });
}

export default async function ChangeIssuePage({
  params,
}: {
  params: { slug: string };
}) {
  const issue = await fetchChangeIssueBySlug(params.slug);
  if (!issue) return notFound();

  const freshness = getChangeIssueFreshness(issue.monthStart);
  const backIssues = await fetchChangeIssues(6, issue.slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: issue.title,
    description: issue.headline,
    datePublished: (issue.publishedAt ?? issue.createdAt).toISOString(),
    dateModified: issue.updatedAt.toISOString(),
    inLanguage: "ja",
    about: { "@type": "City", name: "London" },
    publisher: SITE_PUBLISHER,
  };

  return (
    <>
      <PreviewBanner publishedAt={issue.publishedAt} />
      <div data-page-main className="mx-auto max-w-3xl sm:px-4 pt-4 pb-8 sm:pb-10">
        <JsonLd data={articleJsonLd} />
        <JsonLd
          data={breadcrumbListJsonLd({
            path: "/changes",
            current: issue.title,
            currentHref: `/changes/${issue.slug}`,
          })}
        />

        <Breadcrumbs path="/changes" current={issue.title} className="mb-5" />

        <div className="mb-5">
          <Link
            href="/changes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            号の一覧とこれからの予定へ
          </Link>
        </div>

        <ChangeIssueView issue={issue} />

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        <ChangeIssueList issues={backIssues} />

        <footer className="mt-12 border-t-2 border-foreground pt-4">
          <p className="text-xs leading-relaxed text-muted-foreground dark:text-neutral-500">
            {freshness.isPast
              ? `この号は${format(issue.researchedAt, "yyyy年M月d日")}時点の調査です。現在の金額や制度とは異なる場合があります。`
              : `この号は${format(issue.researchedAt, "yyyy年M月d日")}時点の調査です。支払いや申請の前に、各項目の出典で最新の情報を確認してください。`}
          </p>
          <Link
            href="/changes"
            className="group mt-4 inline-flex items-center gap-2 text-sm font-bold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground dark:text-white"
          >
            これから変わることを見る
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </footer>
      </div>
    </>
  );
}
