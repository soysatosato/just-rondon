import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { highCourtEnforcement } from "@/components/jobs/case-story/content/en/high-court-enforcement";

export const metadata = buildMetadata(highCourtEnforcement, "en");

export default function Page() {
  return <ArticleLayout article={highCourtEnforcement} locale="en" />;
}
