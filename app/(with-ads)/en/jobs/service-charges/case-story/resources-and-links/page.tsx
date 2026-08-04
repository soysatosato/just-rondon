import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { resourcesAndLinks } from "@/components/jobs/case-story/content/en/resources-and-links";

export const metadata = buildMetadata(resourcesAndLinks, "en");

export default function Page() {
  return <ArticleLayout article={resourcesAndLinks} locale="en" />;
}
