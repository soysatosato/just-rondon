import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { acasEarlyConciliation } from "@/components/jobs/case-story/content/acas-early-conciliation";

export const metadata = buildMetadata(acasEarlyConciliation);

export default function Page() {
  return <ArticleLayout article={acasEarlyConciliation} />;
}
