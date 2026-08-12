import type { FoodGuideArticle } from "../types";
import appsAndCoupons from "./apps-and-coupons";
import discountTiming from "./discount-timing";
import longStay from "./long-stay";
import loyaltyCards from "./loyalty-cards";
import mealDeal from "./meal-deal";
import whereToBuy from "./where-to-buy";

/**
 * slug → 記事。
 *
 * guides.ts の foodGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const foodGuideArticles: Record<string, FoodGuideArticle> = {
  "meal-deal": mealDeal,
  "loyalty-cards": loyaltyCards,
  "discount-timing": discountTiming,
  "apps-and-coupons": appsAndCoupons,
  "where-to-buy": whereToBuy,
  "long-stay": longStay,
};

export {
  mealDeal,
  loyaltyCards,
  discountTiming,
  appsAndCoupons,
  whereToBuy,
  longStay,
};
