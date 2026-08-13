import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import budget from "@/components/sightseeing/guides/content/budget";

export const metadata = buildTravelGuideMetadata(budget);

export default function Page() {
  return <TravelGuideLayout article={budget} />;
}
