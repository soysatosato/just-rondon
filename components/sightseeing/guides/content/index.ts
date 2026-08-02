import type { TravelGuideArticle } from "../types";
import hotels from "./hotels";
import itinerary from "./itinerary";
import transport from "./transport";
import travelTips from "./travel-tips";

/** slug → 記事。guides.ts の travelGuides と同じ4件を保つこと。 */
export const travelGuideArticles: Record<string, TravelGuideArticle> = {
  itinerary,
  hotels,
  transport,
  "travel-tips": travelTips,
};

export { itinerary, hotels, transport, travelTips };
