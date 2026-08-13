import type { TravelGuideArticle } from "../types";
import budget from "./budget";
import eta from "./eta";
import hotels from "./hotels";
import itinerary from "./itinerary";
import itineraryLayover from "./itinerary-layover";
import itineraryRainyDay from "./itinerary-rainy-day";
import itineraryWithKids from "./itinerary-with-kids";
import stepFree from "./step-free";
import tippingAndPayment from "./tipping-and-payment";
import travelTips from "./travel-tips";

/**
 * slug → 記事。
 *
 * guides.ts の travelGuides は8件だが、こちらは7件でよい。
 * transport は単一記事から /sightseeing/transport 配下のハブ＋9本に
 * 分割されたため、実体は components/sightseeing/transport/content/ にある。
 */
export const travelGuideArticles: Record<string, TravelGuideArticle> = {
  "eta-uk-visa-guide": eta,
  itinerary,
  hotels,
  budget,
  "tipping-and-payment": tippingAndPayment,
  "travel-tips": travelTips,
  "step-free": stepFree,
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
  budget,
  tippingAndPayment,
  travelTips,
  stepFree,
  itineraryRainyDay,
  itineraryWithKids,
  itineraryLayover,
};
