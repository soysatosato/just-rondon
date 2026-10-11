export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import { CommentTargetType } from "@prisma/client";
import {
  fetchAdjacentContents,
  fetchContentAttractions,
  fetchColumnBySlug,
  fetchColumnSeries,
  fetchPublishedReadingSlugs,
} from "@/utils/actions/contents";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import { columnOgImage } from "@/lib/og";
import JsonLd from "@/components/seo/JsonLd";
import ViewTracker from "@/components/analytics/ViewTracker";
import { columnArticleJsonLd, columnPath } from "@/components/column/jsonld";
import ColumnDetail from "@/components/column/ColumnDetail";
import { loadPageComments } from "@/lib/comments";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { publishedDateOf } from "@/lib/publish-schedule";
import PreviewBanner from "@/components/admin/PreviewBanner";

interface Props {
  params: {
    slug: string;
  };
}

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
// 下書き・予約中の記事は公開後に初めて開かれたときに描く。
export async function generateStaticParams() {
  return fetchPublishedReadingSlugs("column");
}

export async function generateMetadata({ params }: Props) {
  const content = await fetchColumnBySlug(params.slug);

  if (!content) {
    return {
      title: "コラム | ジャスト・ロンドン",
      description: "イギリスの歴史・文化・伝統にまつわるコラムをお届けします。",
      robots: { index: false, follow: false },
    };
  }

  const text = content.summary || content.mainText || "";
  const trimmed = truncateDescription(text.replace(/[#>*_\-`]/g, ""));

  return buildPageMetadata({
    path: `/column/${params.slug}`,
    title: content.title,
    description: trimmed || `${content.title}についてのコラムです。`,
    type: "article",
    publishedTime: publishedDateOf(content).toISOString(),
    modifiedTime: content.updatedAt.toISOString(),
    // 挿絵(content.image)を直接 og:image に書かない。Wikimedia は
    // facebookexternalhit を 403 で拒否し、縦長・5MB超の写真は X と LINE に
    // 捨てられる。自分のドメインから 1200x630 のカードを配る。
    images: [columnOgImage(content)],
  });
}

export default async function ColumnDetailPage({ params }: Props) {
  const content = await fetchColumnBySlug(params.slug);

  if (!content) return notFound();

  const [series, { prev, next }, spots] = await Promise.all([
    fetchColumnSeries(content.seriesName),
    fetchAdjacentContents("column", {
      id: content.id,
      publishedAt: content.publishedAt,
    }),
    fetchContentAttractions(content.id),
  ]);

  // コメントは投稿された時点で表示したいので、ここだけはリクエスト時に読む。
  // 投稿APIと管理ページの返信から revalidatePath で更新される。
  const comments = await loadPageComments(
    CommentTargetType.COLUMN,
    content.slug,
  );

  return (
    <>
      <PreviewBanner publishedAt={content.publishedAt} />
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/column",
          current: content.title,
          currentHref: columnPath(content.slug),
        })}
      />
      <JsonLd data={columnArticleJsonLd(content)} />
      <ColumnDetail
        content={content}
        series={series}
        prev={prev}
        next={next}
        spots={spots}
        comments={comments}
      />

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="column" slug={content.slug} />
    </>
  );
}
