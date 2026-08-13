import type { HealthGuideArticle } from "../types";
import dentistAndOptician from "./dentist-and-optician";
import gpRegistration from "./gp-registration";
import ihsAndEntitlement from "./ihs-and-entitlement";
import pharmacyAndPrescriptions from "./pharmacy-and-prescriptions";
import prescriptionCosts from "./prescription-costs";
import whenYouAreIll from "./when-you-are-ill";

/**
 * slug → 記事。
 *
 * guides.ts の healthGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const healthGuideArticles: Record<string, HealthGuideArticle> = {
  "gp-registration": gpRegistration,
  "ihs-and-entitlement": ihsAndEntitlement,
  "when-you-are-ill": whenYouAreIll,
  "pharmacy-and-prescriptions": pharmacyAndPrescriptions,
  "dentist-and-optician": dentistAndOptician,
  "prescription-costs": prescriptionCosts,
};

export {
  gpRegistration,
  ihsAndEntitlement,
  whenYouAreIll,
  pharmacyAndPrescriptions,
  dentistAndOptician,
  prescriptionCosts,
};
