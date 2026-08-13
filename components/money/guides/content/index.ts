import type { MoneyGuideArticle } from "../types";
import choosingABank from "./choosing-a-bank";
import nationalInsuranceNumber from "./national-insurance-number";
import openingAnAccount from "./opening-an-account";
import passingTheChecks from "./passing-the-checks";
import sendingMoneyFromJapan from "./sending-money-from-japan";

/**
 * slug → 記事。
 *
 * guides.ts の moneyGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const moneyGuideArticles: Record<string, MoneyGuideArticle> = {
  "opening-an-account": openingAnAccount,
  "passing-the-checks": passingTheChecks,
  "choosing-a-bank": choosingABank,
  "sending-money-from-japan": sendingMoneyFromJapan,
  "national-insurance-number": nationalInsuranceNumber,
};

export {
  openingAnAccount,
  passingTheChecks,
  choosingABank,
  sendingMoneyFromJapan,
  nationalInsuranceNumber,
};
