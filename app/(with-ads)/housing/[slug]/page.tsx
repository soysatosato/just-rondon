import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HousingGuideLayout from "@/components/housing/guides/HousingGuideLayout";
import {
  buildHousingGuideMetadata,
  housingGuideSlugs,
} from "@/components/housing/guides/guides";
import { housingGuideArticles } from "@/components/housing/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return housingGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = housingGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/housing/${params.slug}`,
      title: "ロンドンの住まい探しガイド",
      description:
        "ロンドンで部屋を借りるための手順を、物件の探し方から契約・退去まで解説します。",
      noindex: true,
    });
  }

  return buildHousingGuideMetadata(article);
}

export default function HousingGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = housingGuideArticles[params.slug];

  if (!article) return notFound();

  return <HousingGuideLayout article={article} />;
}
