import HotelsGuide from "@/components/sightseeing/guides/hotels/HotelsGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { hotelsMeta } from "@/components/sightseeing/guides/hotels/content";

export const metadata = buildTravelGuideMetadata(hotelsMeta);

// エリアのカードに「近くで食べる」(DB の店のページ)を出すので、1日ごとに作り直す。
export const revalidate = 86400;

export default function Page() {
  return <HotelsGuide />;
}
