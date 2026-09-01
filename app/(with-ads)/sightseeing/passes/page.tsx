import PassesGuide from "@/components/sightseeing/guides/passes/PassesGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { passesMeta } from "@/components/sightseeing/guides/passes/content";

export const metadata = buildTravelGuideMetadata(passesMeta);

export default function Page() {
  return <PassesGuide />;
}
