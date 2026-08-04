import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import eta from "@/components/sightseeing/guides/content/eta";

export const metadata = buildTravelGuideMetadata(eta);

export default function Page() {
  return <TravelGuideLayout article={eta} />;
}
