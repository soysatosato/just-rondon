import GuideLayout from "@/components/jobs/guides/GuideLayout";
import { buildMetadata } from "@/components/jobs/guides/guides";
import workplacePension from "@/components/jobs/guides/content/workplace-pension";

export const metadata = buildMetadata(workplacePension);

export default function Page() {
  return <GuideLayout article={workplacePension} />;
}
