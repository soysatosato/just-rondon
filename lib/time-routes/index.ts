import type { TimeRouteGuide } from "./types";
import { britishMuseum } from "./content/british-museum";
import { imperialWarMuseum } from "./content/imperial-war-museum";
import { kensingtonPalace } from "./content/kensington-palace";
import { nationalGallery } from "./content/national-gallery";
import { naturalHistoryMuseum } from "./content/natural-history-museum";
import { scienceMuseum } from "./content/science-museum";
import { stPaulsCathedral } from "./content/st-pauls-cathedral";
import { tateModern } from "./content/tate-modern";
import { towerOfLondon } from "./content/tower-of-london";
import { westminsterAbbey } from "./content/westminster-abbey";

export type { RouteSource, RouteStop, TimeRoute, TimeRouteGuide } from "./types";

/**
 * 時間別の回り方を持つスポット。
 *
 * 対象は「◯◯ 所要時間」で検索結果の5〜10位に出ていたページと、
 * 敷地が広く時間配分で見るものが変わる館(2026-10 時点の Search Console)。
 * 順路が一本道で配分の余地がないスポット(タワーブリッジ、
 * チャーチル戦争指令室など)は入れていない。
 */
export const TIME_ROUTE_GUIDES: readonly TimeRouteGuide[] = [
  nationalGallery,
  britishMuseum,
  naturalHistoryMuseum,
  tateModern,
  scienceMuseum,
  imperialWarMuseum,
  stPaulsCathedral,
  westminsterAbbey,
  towerOfLondon,
  kensingtonPalace,
];

const BY_ATTRACTION = new Map(
  TIME_ROUTE_GUIDES.map((g) => [g.attractionSlug, g]),
);
const BY_MUSEUM = new Map(
  TIME_ROUTE_GUIDES.flatMap((g) =>
    g.museumSlug ? [[g.museumSlug, g] as const] : [],
  ),
);

/** /sightseeing/[slug] から引く。 */
export function timeRouteForAttraction(slug: string): TimeRouteGuide | null {
  return BY_ATTRACTION.get(slug) ?? null;
}

/** /museums/[slug] から引く。 */
export function timeRouteForMuseum(slug: string): TimeRouteGuide | null {
  return BY_MUSEUM.get(slug) ?? null;
}

/** ページ内リンクの行き先。 */
export const TIME_ROUTE_ANCHOR = "time-routes";

/** 本体を出すページ。美術館側があればそちら。 */
export function timeRoutePath(guide: TimeRouteGuide): string {
  return guide.museumSlug
    ? `/museums/${guide.museumSlug}#${TIME_ROUTE_ANCHOR}`
    : `/sightseeing/${guide.attractionSlug}#${TIME_ROUTE_ANCHOR}`;
}

/** 「1時間・2〜3時間・半日」。description と短い答えの見出しに使う。 */
export function timeRouteLabels(guide: TimeRouteGuide): string {
  return guide.routes.map((r) => r.label).join("・");
}

/** "2026-10-05" → "2026年10月5日" */
export function formatCheckedAt(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
