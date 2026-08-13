import type { BeyondArticle } from "../types";
import bathStonehenge from "./bath-stonehenge";
import brighton from "./brighton";
import britrailPass from "./britrail-pass";
import cambridge from "./cambridge";
import canterbury from "./canterbury";
import cotswolds from "./cotswolds";
import oxford from "./oxford";
import windsor from "./windsor";

/**
 * slug → 記事。
 *
 * destinations.ts の beyondDestinations と過不足なく一致させること。
 * 記事を足したら、destinations.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 */
export const beyondArticles: Record<string, BeyondArticle> = {
  "britrail-pass": britrailPass,
  windsor,
  oxford,
  cambridge,
  "bath-stonehenge": bathStonehenge,
  cotswolds,
  brighton,
  canterbury,
};

export {
  britrailPass,
  windsor,
  oxford,
  cambridge,
  bathStonehenge,
  cotswolds,
  brighton,
  canterbury,
};
