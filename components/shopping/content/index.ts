import type { ShoppingGuideArticle } from "../types";
import { marketsArticle } from "./markets";
import { departmentStoresArticle } from "./department-stores";
import { bicesterVillageArticle } from "./bicester-village";
import { vatRefundArticle } from "./vat-refund";

/**
 * slug から記事を引く。
 *
 * 記事を1本足すときに触るのは4箇所:
 *   1. components/shopping/guides.ts の shoppingGuides
 *   2. このファイル
 *   3. next-sitemap.config.js の staticPages
 *   4. content/ に本文ファイル
 *
 * 並び順は shoppingGuides に合わせること。
 */
export const shoppingGuideArticles: Record<string, ShoppingGuideArticle> = {
  [marketsArticle.slug]: marketsArticle,
  [departmentStoresArticle.slug]: departmentStoresArticle,
  [bicesterVillageArticle.slug]: bicesterVillageArticle,
  [vatRefundArticle.slug]: vatRefundArticle,
};

export {
  marketsArticle,
  departmentStoresArticle,
  bicesterVillageArticle,
  vatRefundArticle,
};
