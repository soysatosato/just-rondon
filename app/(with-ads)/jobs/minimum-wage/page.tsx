import GuideLayout from "@/components/jobs/guides/GuideLayout";
import { buildMetadata } from "@/components/jobs/guides/guides";
import minimumWage from "@/components/jobs/guides/content/minimum-wage";

export const metadata = buildMetadata(minimumWage);

export default function Page() {
  return <GuideLayout article={minimumWage} />;
}
