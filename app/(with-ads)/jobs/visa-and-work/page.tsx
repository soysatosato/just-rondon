import GuideLayout from "@/components/jobs/guides/GuideLayout";
import { buildMetadata } from "@/components/jobs/guides/guides";
import visaAndWork from "@/components/jobs/guides/content/visa-and-work";

export const metadata = buildMetadata(visaAndWork);

export default function Page() {
  return <GuideLayout article={visaAndWork} />;
}
