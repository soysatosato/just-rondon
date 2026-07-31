import GuideLayout from "@/components/jobs/guides/GuideLayout";
import { buildMetadata } from "@/components/jobs/guides/guides";
import employmentContract from "@/components/jobs/guides/content/employment-contract";

export const metadata = buildMetadata(employmentContract);

export default function Page() {
  return <GuideLayout article={employmentContract} />;
}
