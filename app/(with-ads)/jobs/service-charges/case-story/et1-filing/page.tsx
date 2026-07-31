import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { et1Filing } from "@/components/jobs/case-story/content/et1-filing";

export const metadata = buildMetadata(et1Filing);

export default function Page() {
  return <ArticleLayout article={et1Filing} />;
}
