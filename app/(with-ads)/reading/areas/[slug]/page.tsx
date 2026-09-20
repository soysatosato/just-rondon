export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import {
  fetchAdjacentContents,
  fetchAreaBySlug,
  fetchContentAttractions,
} from "@/utils/actions/contents";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import { areaOgImage } from "@/lib/og";
import JsonLd from "@/components/seo/JsonLd";
import ViewTracker from "@/components/analytics/ViewTracker";
import { areaArticleJsonLd, areaPath } from "@/components/areas/jsonld";
import AreaDetail from "@/components/areas/AreaDetail";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const content = await fetchAreaBySlug(params.slug);

  if (!content) {
    return {
      title: "ロンドンの街 | ジャスト・ロンドン",
      description:
        "ロンドンのエリアを1つずつ、地名の由来から今日の治安と家賃まで読み解きます。",
      robots: { index: false, follow: false },
    };
  }

  /*
    title をそのまま出す。この連載のタイトルは「カタカナの街名で始める」
    約束(.claude/skills/add-area/SKILL.md)なので、検索窓に打たれる語が
    すでに先頭に入っている。イギリス英語のように後から「の意味」を
    足す必要がない。
  */
  const text = content.summary || content.mainText || "";
  const trimmed = truncateDescription(text.replace(/[#>*_\-`]/g, ""));

  return buildPageMetadata({
    path: `/reading/areas/${params.slug}`,
    title: content.title,
    description:
      trimmed ||
      `${content.engTitle ?? content.title}の治安・家賃・地名の由来と歩き方をまとめました。`,
    type: "article",
    publishedTime: content.createdAt.toISOString(),
    modifiedTime: content.updatedAt.toISOString(),
    // 挿絵を直接 og:image に書かない理由は app/og/column/[slug]/route.tsx。
    images: [areaOgImage(content)],
  });
}

export default async function AreaDetailPage({ params }: Props) {
  const content = await fetchAreaBySlug(params.slug);

  if (!content) return notFound();

  const [{ prev, next }, spots] = await Promise.all([
    fetchAdjacentContents("area", {
      id: content.id,
      createdAt: content.createdAt,
    }),
    fetchContentAttractions(content.id),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/reading/areas",
          current: content.title,
          currentHref: areaPath(content.slug),
        })}
      />
      <JsonLd data={areaArticleJsonLd(content)} />
      <AreaDetail content={content} prev={prev} next={next} spots={spots} />

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="area" slug={content.slug} />
    </>
  );
}
