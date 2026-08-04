import ArticleLayout from "@/components/jobs/case-story/ArticleLayout";
import { buildMetadata } from "@/components/jobs/case-story/chapters";
import { checkYourServiceCharge } from "@/components/jobs/case-story/content/en/check-your-service-charge";

export const metadata = buildMetadata(checkYourServiceCharge, "en");

export default function Page() {
  return <ArticleLayout article={checkYourServiceCharge} locale="en" />;
}
