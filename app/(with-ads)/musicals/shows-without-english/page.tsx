import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import showsWithoutEnglish from "@/components/musicals/guides/content/shows-without-english";

export const metadata = buildMetadata(showsWithoutEnglish);

export default function Page() {
  return <GuideLayout article={showsWithoutEnglish} />;
}
