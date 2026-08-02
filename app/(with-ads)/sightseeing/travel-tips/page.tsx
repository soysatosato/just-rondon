import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import travelTips from "@/components/sightseeing/guides/content/travel-tips";

export const metadata = buildTravelGuideMetadata(travelTips);

export default function Page() {
  return <TravelGuideLayout article={travelTips} />;
}
