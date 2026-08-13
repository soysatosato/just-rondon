import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import {
  itineraryVariantPath,
  itineraryVariantSlugs,
  itineraryVariants,
} from "@/components/sightseeing/guides/itinerary-variants";
import { itineraryVariantArticles } from "@/components/sightseeing/guides/content";
import { buildPageMetadata } from "@/lib/seo";

const PARENT = { name: "ロンドン モデルコース（1〜5日）", slug: "itinerary" };

export function generateStaticParams() {
  return itineraryVariantSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = itineraryVariantArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: itineraryVariantPath(params.slug),
      title: "ロンドンのモデルコース",
      description:
        "ロンドンのモデルコースを、雨の日・子連れ・乗り継ぎ半日の場合に組み替えたプランです。",
      noindex: true,
    });
  }

  return buildTravelGuideMetadata(article);
}

export default function ItineraryVariantPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = itineraryVariantArticles[params.slug];

  if (!article) return notFound();

  return (
    <TravelGuideLayout
      article={article}
      parent={PARENT}
      childGuides={itineraryVariants.map((v) => ({
        href: itineraryVariantPath(v.slug),
        eyebrow: v.eyebrow,
        label: v.label,
        blurb: v.blurb,
      }))}
    />
  );
}
