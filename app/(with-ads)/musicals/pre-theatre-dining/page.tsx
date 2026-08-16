import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import preTheatreDining from "@/components/musicals/guides/content/pre-theatre-dining";

export const metadata = buildMetadata(preTheatreDining);

export default function Page() {
  return <GuideLayout article={preTheatreDining} />;
}
