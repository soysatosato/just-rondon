import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import firstTimeTheatre from "@/components/musicals/guides/content/first-time-theatre";

export const metadata = buildMetadata(firstTimeTheatre);

export default function Page() {
  return <GuideLayout article={firstTimeTheatre} />;
}
