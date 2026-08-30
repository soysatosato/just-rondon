import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VariantLayout from "@/components/sightseeing/guides/itinerary/VariantLayout";
import { variants } from "@/components/sightseeing/guides/itinerary/variants";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import {
  itineraryVariantPath,
  itineraryVariantSlugs,
} from "@/components/sightseeing/guides/itinerary-variants";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return itineraryVariantSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const variant = variants[params.slug];

  if (!variant) {
    return buildPageMetadata({
      path: itineraryVariantPath(params.slug),
      title: "ロンドンのモデルコース",
      description:
        "ロンドンのモデルコースを、雨の日・子連れ・乗り継ぎ半日の場合に組み替えたプランです。",
      noindex: true,
    });
  }

  return buildTravelGuideMetadata(variant.meta);
}

export default function ItineraryVariantPage({
  params,
}: {
  params: { slug: string };
}) {
  const variant = variants[params.slug];

  if (!variant) return notFound();

  return <VariantLayout {...variant} />;
}
