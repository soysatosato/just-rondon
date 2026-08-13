import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import itinerary from "@/components/sightseeing/guides/content/itinerary";
import {
  itineraryVariantPath,
  itineraryVariants,
  itineraryVariantsItemListJsonLd,
} from "@/components/sightseeing/guides/itinerary-variants";

export const metadata = buildTravelGuideMetadata(itinerary);

export default function Page() {
  return (
    <TravelGuideLayout
      article={itinerary}
      childGuides={itineraryVariants.map((v) => ({
        href: itineraryVariantPath(v.slug),
        eyebrow: v.eyebrow,
        label: v.label,
        blurb: v.blurb,
      }))}
      childGuidesHeading="そのまま回れないときの分岐版"
      extraJsonLd={[itineraryVariantsItemListJsonLd()]}
    />
  );
}
