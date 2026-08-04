import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { tribunalCorrespondence } from "@/components/jobs/case-story/content/en/tribunal-correspondence";

export const metadata = buildMetadata(tribunalCorrespondence, "en");

export default function Page() {
  return <ArticleLayout article={tribunalCorrespondence} locale="en" />;
}
