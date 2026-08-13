import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HealthGuideLayout from "@/components/health/guides/HealthGuideLayout";
import {
  buildHealthGuideMetadata,
  healthGuideSlugs,
} from "@/components/health/guides/guides";
import { healthGuideArticles } from "@/components/health/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return healthGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = healthGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/health/${params.slug}`,
      title: "ロンドンの医療・NHSガイド",
      description:
        "イギリスで病院にかかるための手順を、GP登録から救急・薬・費用まで解説します。",
      noindex: true,
    });
  }

  return buildHealthGuideMetadata(article);
}

export default function HealthGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = healthGuideArticles[params.slug];

  if (!article) return notFound();

  return <HealthGuideLayout article={article} />;
}
