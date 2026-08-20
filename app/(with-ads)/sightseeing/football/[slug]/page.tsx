import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FootballGuideLayout from "@/components/sightseeing/football/FootballGuideLayout";
import {
  buildFootballGuideMetadata,
  footballGuidePath,
  footballGuideSlugs,
} from "@/components/sightseeing/football/guides";
import { footballGuideArticles } from "@/components/sightseeing/football/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return footballGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = footballGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: footballGuidePath(params.slug),
      title: "プレミアリーグ観戦ガイド",
      description:
        "ロンドンでプレミアリーグを観戦するためのチケットの取り方、スタジアムへの行き方、観戦の作法をまとめています。",
      noindex: true,
    });
  }

  return buildFootballGuideMetadata(article);
}

export default function FootballGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = footballGuideArticles[params.slug];

  if (!article) return notFound();

  return <FootballGuideLayout article={article} />;
}
