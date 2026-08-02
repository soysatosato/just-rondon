import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import transport from "@/components/sightseeing/guides/content/transport";

export const metadata = buildTravelGuideMetadata(transport);

export default function Page() {
  return <TravelGuideLayout article={transport} />;
}
