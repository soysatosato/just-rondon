import type { VisaGuideArticle } from "../types";
import afterArrival from "./after-arrival";
import family from "./family";
import globalTalent from "./global-talent";
import skilledWorker from "./skilled-worker";
import student from "./student";
import ukVisaGuide from "./uk-visa-guide";
import youthMobilityScheme from "./youth-mobility-scheme";

/**
 * slug → 記事。
 *
 * guides.ts の visaGuides から externalPath を持つもの(ETA)を除いた集合と
 * 一致させること。ETA の本体は components/sightseeing/guides/content/eta.ts に
 * あり、/visa 側からは参照のみ。
 */
export const visaGuideArticles: Record<string, VisaGuideArticle> = {
  "uk-visa-guide": ukVisaGuide,
  "youth-mobility-scheme": youthMobilityScheme,
  "skilled-worker": skilledWorker,
  "global-talent": globalTalent,
  student,
  family,
  "after-arrival": afterArrival,
};

export {
  ukVisaGuide,
  youthMobilityScheme,
  skilledWorker,
  globalTalent,
  student,
  family,
  afterArrival,
};
