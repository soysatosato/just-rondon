import type { TravelGuideArticle } from "../types";
import itineraryLayover from "./itinerary-layover";
import itineraryRainyDay from "./itinerary-rainy-day";
import itineraryWithKids from "./itinerary-with-kids";

/**
 * モデルコースの分岐版。親からの相対 slug をキーにする。
 * /sightseeing/itinerary/[slug] が引く。
 *
 * トップレベルの旅行ガイド8本は、markdown の TravelGuideArticle から
 * それぞれ専用の構造化データ(components/sightseeing/guides/<slug>/)へ
 * 移したので、ここには残っていない。
 */
export const itineraryVariantArticles: Record<string, TravelGuideArticle> = {
  "rainy-day": itineraryRainyDay,
  "with-kids": itineraryWithKids,
  layover: itineraryLayover,
};

export { itineraryRainyDay, itineraryWithKids, itineraryLayover };
