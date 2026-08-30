import TippingGuide from "@/components/sightseeing/guides/tipping/TippingGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { tippingMeta } from "@/components/sightseeing/guides/tipping/content";

export const metadata = buildTravelGuideMetadata(tippingMeta);

export default function Page() {
  return <TippingGuide />;
}
