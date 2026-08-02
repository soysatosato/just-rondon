import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import hotels from "@/components/sightseeing/guides/content/hotels";

export const metadata = buildTravelGuideMetadata(hotels);

export default function Page() {
  return <TravelGuideLayout article={hotels} />;
}
