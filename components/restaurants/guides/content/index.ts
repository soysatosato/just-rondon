import type { RestaurantGuideArticle } from "../types";
import mustVisit from "./must-visit";
import pubEtiquette from "./pub-etiquette";

/**
 * slug → 記事。
 *
 * guides.ts の restaurantGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages・
 * app/(with-ads)/restaurants/<slug>/page.tsx の4箇所を更新する。
 *
 * ルートを静的に置いているのは、/restaurants/[slug] が
 * DB の料理ページに使われているため。静的セグメントのほうが
 * 動的セグメントより優先されるので衝突はしないが、
 * 料理に同じ slug を作らないこと。
 */
export const restaurantGuideArticles: Record<string, RestaurantGuideArticle> = {
  "must-visit": mustVisit,
  "pub-etiquette": pubEtiquette,
};

export { mustVisit, pubEtiquette };
