import type { TravelGuideArticle } from "../types";
import eta from "./eta";
import hotels from "./hotels";
import itinerary from "./itinerary";
import itineraryLayover from "./itinerary-layover";
import itineraryRainyDay from "./itinerary-rainy-day";
import itineraryWithKids from "./itinerary-with-kids";
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

/**
 * モデルコースの分岐版。親からの相対 slug をキーにする。
 * /sightseeing/itinerary/[slug] が引く。
 *
 * 親(itinerary)と違ってトップレベルのガイドではないので
 * travelGuideArticles には混ぜない。混ぜると
 * TravelGuideLayout の「ほかの旅行ガイド」に並んでしまう。
 */
export const itineraryVariantArticles: Record<string, TravelGuideArticle> = {
  "rainy-day": itineraryRainyDay,
  "with-kids": itineraryWithKids,
  layover: itineraryLayover,
};

export {
  eta,
  itinerary,
  hotels,
  travelTips,
  itineraryRainyDay,
  itineraryWithKids,
  itineraryLayover,
};
