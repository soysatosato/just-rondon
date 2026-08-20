export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import { fetchModernBritainBySlug } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  modernBritainArticleJsonLd,
  modernBritainBreadcrumbJsonLd,
} from "@/components/modern-britain/jsonld";
import ModernBritainDetail from "@/components/modern-britain/ModernBritainDetail";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const content = await fetchModernBritainBySlug(params.slug);

  if (!content) {
    return {
      title: "英国のいまを論じる | ジャスト・ロンドン",
      description: "最新の英国ニュースの背景と意味を掘り下げて論じます。",
      robots: { index: false, follow: false },
    };
  }

  const text = content.summary || content.mainText || "";
  const trimmed = text.replace(/[#>*_\-`]/g, "").slice(0, 110);

  return buildPageMetadata({
    path: `/modern-britain/${params.slug}`,
    title: content.title,
    description: trimmed || `${content.title}について掘り下げて論じます。`,
    type: "article",
    publishedTime: content.createdAt.toISOString(),
    modifiedTime: content.updatedAt.toISOString(),
    images: content.image ? [content.image] : undefined,
  });
}

export default async function ModernBritainDetailPage({ params }: Props) {
  const content = await fetchModernBritainBySlug(params.slug);

  if (!content) return notFound();

  return (
    <>
      <JsonLd data={modernBritainBreadcrumbJsonLd(content)} />
      <JsonLd data={modernBritainArticleJsonLd(content)} />
      <ModernBritainDetail content={content} />
    </>
  );
}
