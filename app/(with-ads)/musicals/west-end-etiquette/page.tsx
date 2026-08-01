import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import westEndEtiquette from "@/components/musicals/guides/content/west-end-etiquette";

export const metadata = buildMetadata(westEndEtiquette);

export default function Page() {
  return <GuideLayout article={westEndEtiquette} />;
}
