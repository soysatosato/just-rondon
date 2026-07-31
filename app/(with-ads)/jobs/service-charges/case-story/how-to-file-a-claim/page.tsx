import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { howToFileAClaim } from "@/components/jobs/case-story/content/how-to-file-a-claim";

export const metadata = buildMetadata(howToFileAClaim);

export default function Page() {
  return <ArticleLayout article={howToFileAClaim} />;
}
