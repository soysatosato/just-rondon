import ItineraryGuide from "@/components/sightseeing/guides/itinerary/ItineraryGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { itineraryMeta } from "@/components/sightseeing/guides/itinerary/content";

export const metadata = buildTravelGuideMetadata(itineraryMeta);

export default function Page() {
  return <ItineraryGuide />;
}
