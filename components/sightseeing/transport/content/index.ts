import type { TransportGuideArticle } from "../types";
import airports from "./airports";
import bus from "./bus";
import car from "./car";
import cycling from "./cycling";
import fares from "./fares";
import nationalRail from "./national-rail";
import ownBike from "./own-bike";
import taxi from "./taxi";
import travelcard from "./travelcard";
import tube from "./tube";

/**
 * slug → 記事。
 *
 * guides.ts の transportGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const transportGuideArticles: Record<string, TransportGuideArticle> = {
  fares,
  airports,
  "national-rail": nationalRail,
  tube,
  bus,
  cycling,
  taxi,
  travelcard,
  "own-bike": ownBike,
  car,
};

export {
  fares,
  airports,
  nationalRail,
  tube,
  bus,
  cycling,
  taxi,
  travelcard,
  ownBike,
  car,
};
