import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import westEndEtiquette from "@/components/musicals/guides/content/west-end-etiquette";

// 末尾の作品カード(GuideLayout の fetchTopMusicals)が DB を読む。
export const revalidate = 60 * 60 * 24;

export const metadata = buildMetadata(westEndEtiquette);

export default function Page() {
  return <GuideLayout article={westEndEtiquette} />;
}
