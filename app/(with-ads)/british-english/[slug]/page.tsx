export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import { fetchBritishEnglishBySlug } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  britishEnglishArticleJsonLd,
  britishEnglishBreadcrumbJsonLd,
} from "@/components/british-english/jsonld";
import BritishEnglishDetail from "@/components/british-english/BritishEnglishDetail";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const content = await fetchBritishEnglishBySlug(params.slug);

  if (!content) {
    return {
      title: "イギリス英語 | ジャスト・ロンドン",
      description: "イギリス英語ならではの単語・言い回し・スラングを紹介します。",
      robots: { index: false, follow: false },
    };
  }

  const text = content.summary || content.mainText || "";
  const trimmed = text.replace(/[#>*_\-`]/g, "").slice(0, 110);

  return buildPageMetadata({
    path: `/british-english/${params.slug}`,
    title: content.engTitle
      ? `${content.engTitle}（${content.title}）`
      : content.title,
    description: trimmed || `${content.title}についてのイギリス英語解説です。`,
    type: "article",
    publishedTime: content.createdAt.toISOString(),
    modifiedTime: content.updatedAt.toISOString(),
    images: content.image ? [content.image] : undefined,
  });
}

export default async function BritishEnglishDetailPage({ params }: Props) {
  const content = await fetchBritishEnglishBySlug(params.slug);

  if (!content) return notFound();

  return (
    <>
      <JsonLd data={britishEnglishBreadcrumbJsonLd(content)} />
      <JsonLd data={britishEnglishArticleJsonLd(content)} />
      <BritishEnglishDetail content={content} />
    </>
  );
}
