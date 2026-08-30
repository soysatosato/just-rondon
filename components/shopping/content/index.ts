import type { ShoppingGuideArticle, ShoppingGuideFigure } from "../types";
import { marketsArticle } from "./markets";
import { departmentStoresArticle } from "./department-stores";
import { shoppingStreetsArticle } from "./shopping-streets";
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
  [shoppingStreetsArticle.slug]: shoppingStreetsArticle,
  [bicesterVillageArticle.slug]: bicesterVillageArticle,
  [vatRefundArticle.slug]: vatRefundArticle,
};

export {
  marketsArticle,
  departmentStoresArticle,
  shoppingStreetsArticle,
  bicesterVillageArticle,
  vatRefundArticle,
};

/**
 * カードのサムネイル用に記事の顔だけを引く。
 *
 * ハブと記事下部のカードは guides.ts の ShoppingGuideMeta から描いて
 * いるが、写真は本文側(記事の hero)に持たせている。カードのためだけに
 * meta へ画像URLを複製すると、写真を差し替えたときに2箇所直すことに
 * なるため、meta ではなくここから引く。
 */
export function shoppingGuideHero(slug: string): ShoppingGuideFigure | null {
  return shoppingGuideArticles[slug]?.hero ?? null;
}
