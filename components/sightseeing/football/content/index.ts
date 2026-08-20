import type { FootballGuideArticle } from "../types";
import etiquette from "./etiquette";
import gettingThere from "./getting-there";
import lowerLeagues from "./lower-leagues";
import matchday from "./matchday";
import northLondonDerby from "./north-london-derby";
import planning from "./planning";
import pubWatching from "./pub-watching";
import resaleWarning from "./resale-warning";
import stadiumTours from "./stadium-tours";
import stadiums from "./stadiums";
import tickets from "./tickets";
import whichClub from "./which-club";

/**
 * slug → 記事。
 *
 * guides.ts の footballGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const footballGuideArticles: Record<string, FootballGuideArticle> = {
  tickets,
  "resale-warning": resaleWarning,
  planning,
  matchday,
  "getting-there": gettingThere,
  etiquette,
  "which-club": whichClub,
  stadiums,
  "north-london-derby": northLondonDerby,
  "pub-watching": pubWatching,
  "lower-leagues": lowerLeagues,
  "stadium-tours": stadiumTours,
};

export {
  tickets,
  resaleWarning,
  planning,
  matchday,
  gettingThere,
  etiquette,
  whichClub,
  stadiums,
  northLondonDerby,
  pubWatching,
  lowerLeagues,
  stadiumTours,
};
