import HotelsGuide from "@/components/sightseeing/guides/hotels/HotelsGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { hotelsMeta } from "@/components/sightseeing/guides/hotels/content";

export const metadata = buildTravelGuideMetadata(hotelsMeta);

export default function Page() {
  return <HotelsGuide />;
}
