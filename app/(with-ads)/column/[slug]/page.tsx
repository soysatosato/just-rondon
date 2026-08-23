export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import { fetchColumnBySlug, fetchColumnSeries } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ViewTracker from "@/components/analytics/ViewTracker";
import { columnArticleJsonLd, columnBreadcrumbJsonLd } from "@/components/column/jsonld";
import ColumnDetail from "@/components/column/ColumnDetail";

interface Props {
  params: {
    slug: string;
  };
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
  const trimmed = text.replace(/[#>*_\-`]/g, "").slice(0, 110);

  return buildPageMetadata({
    path: `/column/${params.slug}`,
    title: content.title,
    description: trimmed || `${content.title}についてのコラムです。`,
    type: "article",
    publishedTime: content.createdAt.toISOString(),
    modifiedTime: content.updatedAt.toISOString(),
    images: content.image ? [content.image] : undefined,
  });
}

export default async function ColumnDetailPage({ params }: Props) {
  const content = await fetchColumnBySlug(params.slug);

  if (!content) return notFound();

  const series = await fetchColumnSeries(content.seriesName);

  return (
    <>
      <JsonLd data={columnBreadcrumbJsonLd(content)} />
      <JsonLd data={columnArticleJsonLd(content)} />
      <ColumnDetail content={content} series={series} />

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="column" slug={content.slug} />
    </>
  );
}
