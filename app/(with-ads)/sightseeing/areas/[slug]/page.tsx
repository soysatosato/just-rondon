import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AreaGuideLayout from "@/components/sightseeing/areas/AreaGuideLayout";
import {
  buildAreaGuideMetadata,
  areaGuidePath,
  areaGuideSlugs,
  type AreaSlug,
} from "@/components/sightseeing/areas/areas";
import { areaGuideArticles } from "@/components/sightseeing/areas/content";
import { getAreaSpots, getSpotsBySlugs } from "@/utils/areas";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return areaGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = areaGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: areaGuidePath(params.slug),
      title: "ロンドンのエリアガイド",
      description:
        "ロンドンを街区の単位で歩くためのガイド。半日の回遊ルートと、エリア内のスポットをまとめています。",
      noindex: true,
    });
  }

  return buildAreaGuideMetadata(article);
}

export default async function AreaGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = areaGuideArticles[params.slug];

  if (!article) return notFound();

  /*
    スポットは記事側に持たせず、ここで DB から引く。
    回遊ルートが参照する slug だけは別途まとめて引いて Map で渡す
    ——ステップごとに引くと N+1 になるため。
  */
  const walkSlugs =
    article.walk?.steps
      .map((s) => s.attractionSlug)
      .filter((s): s is string => Boolean(s)) ?? [];

  const [spots, walkSpots] = await Promise.all([
    getAreaSpots(article.slug as AreaSlug),
    getSpotsBySlugs(walkSlugs),
  ]);

  return (
    <AreaGuideLayout article={article} spots={spots} walkSpots={walkSpots} />
  );
}
