export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import {
  fetchAdjacentContents,
  fetchBritishEnglishBySlug,
} from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import ViewTracker from "@/components/analytics/ViewTracker";
import {
  britishEnglishArticleJsonLd,
  britishEnglishPath,
} from "@/components/british-english/jsonld";
import BritishEnglishDetail from "@/components/british-english/BritishEnglishDetail";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

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

  const { prev, next } = await fetchAdjacentContents("british-english", {
    id: content.id,
    createdAt: content.createdAt,
  });

  return (
    <>
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/british-english",
          current: content.title,
          currentHref: britishEnglishPath(content.slug),
        })}
      />
      <JsonLd data={britishEnglishArticleJsonLd(content)} />
      <BritishEnglishDetail content={content} prev={prev} next={next} />

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="britishEnglish" slug={content.slug} />
    </>
  );
}
