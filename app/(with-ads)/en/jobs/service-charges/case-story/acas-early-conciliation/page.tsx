import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { acasEarlyConciliation } from "@/components/jobs/case-story/content/en/acas-early-conciliation";

export const metadata = buildMetadata(acasEarlyConciliation, "en");

export default function Page() {
  return <ArticleLayout article={acasEarlyConciliation} locale="en" />;
}
