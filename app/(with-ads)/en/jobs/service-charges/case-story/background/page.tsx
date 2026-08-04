import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { background } from "@/components/jobs/case-story/content/en/background";

export const metadata = buildMetadata(background, "en");

export default function Page() {
  return <ArticleLayout article={background} locale="en" />;
}
