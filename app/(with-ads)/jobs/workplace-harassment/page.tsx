import GuideLayout from "@/components/jobs/guides/GuideLayout";
import { buildMetadata } from "@/components/jobs/guides/guides";
import workplaceHarassment from "@/components/jobs/guides/content/workplace-harassment";

export const metadata = buildMetadata(workplaceHarassment);

export default function Page() {
  return <GuideLayout article={workplaceHarassment} />;
}
