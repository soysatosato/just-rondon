import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { defaultJudgment } from "@/components/jobs/case-story/content/default-judgment";

export const metadata = buildMetadata(defaultJudgment);

export default function Page() {
  return <ArticleLayout article={defaultJudgment} />;
}
