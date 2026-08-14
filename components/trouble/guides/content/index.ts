import type { TroubleGuideArticle } from "../types";
import embassy from "./embassy";
import insuranceClaim from "./insurance-claim";
import lostPassport from "./lost-passport";
import lostProperty from "./lost-property";
import pickpocket from "./pickpocket";
import policeReport from "./police-report";
import scams from "./scams";
import stalkingHarassment from "./stalking-harassment";

/**
 * slug → 記事。
 *
 * guides.ts の troubleGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const troubleGuideArticles: Record<string, TroubleGuideArticle> = {
  pickpocket,
  "lost-passport": lostPassport,
  "lost-property": lostProperty,
  "stalking-harassment": stalkingHarassment,
  scams,
  "police-report": policeReport,
  "insurance-claim": insuranceClaim,
  embassy,
};

export {
  pickpocket,
  lostPassport,
  lostProperty,
  stalkingHarassment,
  scams,
  policeReport,
  insuranceClaim,
  embassy,
};
