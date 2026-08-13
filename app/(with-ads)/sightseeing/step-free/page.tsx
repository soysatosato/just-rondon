import TravelGuideLayout from "@/components/sightseeing/guides/TravelGuideLayout";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import stepFree from "@/components/sightseeing/guides/content/step-free";

export const metadata = buildTravelGuideMetadata(stepFree);

export default function Page() {
  return <TravelGuideLayout article={stepFree} />;
}
