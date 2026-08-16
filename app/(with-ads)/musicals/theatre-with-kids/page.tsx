import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import theatreWithKids from "@/components/musicals/guides/content/theatre-with-kids";

export const metadata = buildMetadata(theatreWithKids);

export default function Page() {
  return <GuideLayout article={theatreWithKids} />;
}
