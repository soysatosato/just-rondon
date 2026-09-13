import type { BillsGuideArticle } from "../types";
import billsIncluded from "./bills-included";
import broadband from "./broadband";
import councilTax from "./council-tax";
import energy from "./energy";
import mobile from "./mobile";
import tvLicence from "./tv-licence";
import water from "./water";

/**
 * slug → 記事。
 *
 * guides.ts の billsGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const billsGuideArticles: Record<string, BillsGuideArticle> = {
  "bills-included": billsIncluded,
  "council-tax": councilTax,
  energy,
  water,
  "tv-licence": tvLicence,
  broadband,
  mobile,
};

export {
  billsIncluded,
  councilTax,
  energy,
  water,
  tvLicence,
  broadband,
  mobile,
};
