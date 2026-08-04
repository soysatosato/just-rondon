import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { et1Filing } from "@/components/jobs/case-story/content/en/et1-filing";

export const metadata = buildMetadata(et1Filing, "en");

export default function Page() {
  return <ArticleLayout article={et1Filing} locale="en" />;
}
