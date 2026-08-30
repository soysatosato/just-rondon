import TravelTipsGuide from "@/components/sightseeing/guides/travel-tips/TravelTipsGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { travelTipsMeta } from "@/components/sightseeing/guides/travel-tips/content";

export const metadata = buildTravelGuideMetadata(travelTipsMeta);

export default function Page() {
  return <TravelTipsGuide />;
}
