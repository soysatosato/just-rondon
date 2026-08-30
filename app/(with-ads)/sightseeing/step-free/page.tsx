import StepFreeGuide from "@/components/sightseeing/guides/step-free/StepFreeGuide";
import { buildTravelGuideMetadata } from "@/components/sightseeing/guides/guides";
import { stepFreeMeta } from "@/components/sightseeing/guides/step-free/content";

export const metadata = buildTravelGuideMetadata(stepFreeMeta);

export default function Page() {
  return <StepFreeGuide />;
}
