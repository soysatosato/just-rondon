import type { TravelGuideArticle } from "../types";
import eta from "./eta";
import hotels from "./hotels";
import itinerary from "./itinerary";
import travelTips from "./travel-tips";

/**
 * slug → 記事。
 *
 * guides.ts の travelGuides は5件だが、こちらは4件でよい。
 * transport は単一記事から /sightseeing/transport 配下のハブ＋9本に
 * 分割されたため、実体は components/sightseeing/transport/content/ にある。
 */
export const travelGuideArticles: Record<string, TravelGuideArticle> = {
  "eta-uk-visa-guide": eta,
  itinerary,
  hotels,
  "travel-tips": travelTips,
};

export { eta, itinerary, hotels, travelTips };
