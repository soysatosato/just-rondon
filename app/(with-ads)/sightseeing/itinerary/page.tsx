import ItineraryGuide from "@/components/sightseeing/guides/itinerary/ItineraryGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { itineraryMeta } from "@/components/sightseeing/guides/itinerary/content";

// スポットのカード(GuideAttractionCards)が料金・営業時間を DB から読む。
export const revalidate = 60 * 60 * 24;

export const metadata = buildTravelGuideMetadata(itineraryMeta);

export default function Page() {
  return <ItineraryGuide />;
}
