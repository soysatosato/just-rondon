import type { TravelGuideArticle } from "../types";
import eta from "./eta";
import hotels from "./hotels";
import itinerary from "./itinerary";
import transport from "./transport";
import travelTips from "./travel-tips";

/** slug → 記事。guides.ts の travelGuides と同じ5件を保つこと。 */
export const travelGuideArticles: Record<string, TravelGuideArticle> = {
  "eta-uk-visa-guide": eta,
  itinerary,
  hotels,
  transport,
  "travel-tips": travelTips,
};

export { eta, itinerary, hotels, transport, travelTips };
