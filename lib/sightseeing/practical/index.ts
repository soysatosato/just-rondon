import type { SpotPractical, TicketLevel } from "./types";
import { bigBen } from "./content/big-ben";
import { buckinghamPalace } from "./content/buckingham-palace";
import { churchillWarRooms } from "./content/churchill-war-rooms";
import { hamptonCourtPalace } from "./content/hampton-court-palace";
import { harryPotterShopPlatform934 } from "./content/harry-potter-shop-platform-934";
import { housesOfParliament } from "./content/houses-of-parliament";
import { hydePark } from "./content/hyde-park-london";
import { kensingtonPalace } from "./content/kensington-palace";
import { kewGardens } from "./content/kew-gardens-london";
import { leadenhallMarket } from "./content/leadenhall-market-london";
import { londonEye } from "./content/london-eye";
import { londonTowerBridge } from "./content/london-tower-bridge";
import { madameTussaudsLondon } from "./content/madame-tussauds-london";
import { skyGardenLondon } from "./content/sky-garden-london";
import { spencerHouse } from "./content/spencer-house-london";
import { stPaulsCathedral } from "./content/st-pauls-cathedral";
import { theViewFromTheShard } from "./content/the-view-from-the-shard";
import { towerOfLondon } from "./content/tower-of-london";
import { warnerBrosStudioTour } from "./content/warner-bros-studio-tour-harry-potter";
import { westminsterAbbey } from "./content/westminster-abbey";
import { windsorCastle } from "./content/windsor-castle";

export type {
  AccessRoute,
  PracticalSource,
  SpotPractical,
  SpotTickets,
  TicketLevel,
} from "./types";

/**
 * 「行く前に要ること」を確かめたスポット。
 *
 * 対象は 2026-11 の見直しで優先度の高かったもの(検索の表示回数が多い、
 * または定番で予約の要否が訪問を左右する)から順に足している。
 * 無いスポットでは、ページの該当欄が出ないだけで、ほかの表示は変わらない。
 */
export const SPOT_PRACTICALS: readonly SpotPractical[] = [
  // 定番(券の取り方が訪問を左右する)
  towerOfLondon,
  westminsterAbbey,
  stPaulsCathedral,
  londonTowerBridge,
  buckinghamPalace,
  bigBen,
  housesOfParliament,
  londonEye,
  theViewFromTheShard,
  madameTussaudsLondon,
  skyGardenLondon,
  churchillWarRooms,
  kensingtonPalace,
  windsorCastle,
  hamptonCourtPalace,
  kewGardens,
  warnerBrosStudioTour,
  // 検索の表示回数が多いもの(2026-08-05〜11-01 の Search Console)
  harryPotterShopPlatform934,
  leadenhallMarket,
  spencerHouse,
  hydePark,
];

const BY_SLUG = new Map(SPOT_PRACTICALS.map((p) => [p.slug, p]));
if (BY_SLUG.size !== SPOT_PRACTICALS.length) {
  // 同じ slug を2つ書くと、後のほうだけが黙って使われる。
  throw new Error("lib/sightseeing/practical: slug が重複しています");
}

export function practicalFor(slug: string): SpotPractical | null {
  return BY_SLUG.get(slug) ?? null;
}

/** チケットの型ごとの短い名前。早わかりの見出しに添える。 */
export const TICKET_LEVEL_LABEL: Record<TicketLevel, string> = {
  timed: "日時指定",
  advance: "前売りが確実",
  "walk-in": "予約不要",
  "free-booking": "無料・予約制",
  closed: "見学なし",
};
