import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import theatreWithKids from "@/components/musicals/guides/content/theatre-with-kids";

// 末尾の作品カード(GuideLayout の fetchTopMusicals)が DB を読む。
export const revalidate = 60 * 60 * 24;

export const metadata = buildMetadata(theatreWithKids);

export default function Page() {
  return <GuideLayout article={theatreWithKids} />;
}
