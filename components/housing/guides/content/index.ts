import type { HousingGuideArticle } from "../types";
import depositsAndFees from "./deposits-and-fees";
import japaneseListings from "./japanese-listings";
import movingOut from "./moving-out";
import referencing from "./referencing";
import rightmoveZooplaOpenrent from "./rightmove-zoopla-openrent";
import spareroom from "./spareroom";
import tenancyTypes from "./tenancy-types";
import viewing from "./viewing";
import whereToLive from "./where-to-live";

/**
 * slug → 記事。
 *
 * guides.ts の housingGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const housingGuideArticles: Record<string, HousingGuideArticle> = {
  "rightmove-zoopla-openrent": rightmoveZooplaOpenrent,
  spareroom,
  "japanese-listings": japaneseListings,
  "tenancy-types": tenancyTypes,
  "deposits-and-fees": depositsAndFees,
  referencing,
  "where-to-live": whereToLive,
  viewing,
  "moving-out": movingOut,
};

export {
  rightmoveZooplaOpenrent,
  spareroom,
  japaneseListings,
  tenancyTypes,
  depositsAndFees,
  referencing,
  whereToLive,
  viewing,
  movingOut,
};
