import type { AreaGuideArticle } from "../types";
import city from "./city";
import greenwich from "./greenwich";
import shoreditch from "./shoreditch";
import soho from "./soho";
import southbank from "./southbank";
import westminster from "./westminster";

/**
 * slug → 記事。
 *
 * areas.ts の areaGuides と過不足なく一致させること。
 * エリアを足したら、areas.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages に加えて、
 * scripts/assign-attraction-areas.ts での付与も必要になる。
 * 記事だけ作ってもスポットが0件だと空のページになる。
 */
export const areaGuideArticles: Record<string, AreaGuideArticle> = {
  westminster,
  soho,
  southbank,
  city,
  shoreditch,
  greenwich,
};

export { westminster, soho, southbank, city, shoreditch, greenwich };
