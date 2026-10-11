import GuideLayout from "@/components/musicals/guides/GuideLayout";
import { buildMetadata } from "@/components/musicals/guides/guides";
import westEndTickets from "@/components/musicals/guides/content/west-end-tickets";

// 末尾の作品カード(GuideLayout の fetchTopMusicals)が DB を読む。
export const revalidate = 60 * 60 * 24;

export const metadata = buildMetadata(westEndTickets);

export default function Page() {
  return <GuideLayout article={westEndTickets} />;
}
