import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import itinerary from "@/components/sightseeing/guides/content/itinerary";

export const metadata = buildTravelGuideMetadata(itinerary);

export default function Page() {
  return <TravelGuideLayout article={itinerary} />;
}
