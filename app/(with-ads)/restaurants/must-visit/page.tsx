import RestaurantGuideLayout from "@/components/restaurants/guides/RestaurantGuideLayout";
import { buildRestaurantGuideMetadata } from "@/components/restaurants/guides/guides";
import mustVisit from "@/components/restaurants/guides/content/must-visit";

/*
  静的ルート。/restaurants/[slug] は DB の料理ページなので、
  そちらとは別に置いている。Next.js は静的セグメントを
  動的セグメントより優先するため、この slug が料理側に
  無い限り衝突しない(content/index.ts のコメント参照)。
*/
export const metadata = buildRestaurantGuideMetadata(mustVisit);

export default function MustVisitPage() {
  return <RestaurantGuideLayout article={mustVisit} />;
}
