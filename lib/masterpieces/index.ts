import { MASTERPIECE_PATHS } from "./indexable";
import {
  NATIONAL_GALLERY_GUIDES,
  NATIONAL_GALLERY_NOTE,
} from "./content/national-gallery";
import type { MasterpieceGuide } from "./types";

export type {
  LookFor,
  MasterpieceGuide,
  MasterpieceSource,
  Placement,
} from "./types";

/**
 * 名作ページの登録簿。
 *
 * 作品ページのうちここにある作品だけが、名作ページの本文で描かれ、
 * 検索に載る。足すときは lib/masterpieces/indexable.js にも同じパスを足す。
 */
export const MASTERPIECE_GUIDES: readonly MasterpieceGuide[] = [
  ...NATIONAL_GALLERY_GUIDES,
];

export function masterpiecePath(guide: MasterpieceGuide): string {
  return `/museums/${guide.museumSlug}/artworks/${guide.artworkId}`;
}

// 登録簿と indexable.js が食い違うと、検索に載せたのに本文が無いページか、
// 本文があるのに sitemap に無いページができる。読み込みの時点で止める。
{
  const fromGuides = MASTERPIECE_GUIDES.map(masterpiecePath).sort();
  const listed = [...MASTERPIECE_PATHS].sort();
  if (fromGuides.join("\n") !== listed.join("\n")) {
    throw new Error(
      "lib/masterpieces/indexable.js の MASTERPIECE_PATHS と、content/ の名作ページが一致しない",
    );
  }
}

const BY_ARTWORK_ID = new Map(
  MASTERPIECE_GUIDES.map((guide) => [guide.artworkId, guide]),
);

export function getMasterpieceGuide(
  artworkId: string,
): MasterpieceGuide | null {
  return BY_ARTWORK_ID.get(artworkId) ?? null;
}

/** 館ごとに、展示状況の下に添える注意。 */
const MUSEUM_NOTES: Record<string, string> = {
  "national-gallery": NATIONAL_GALLERY_NOTE,
};

export function masterpieceMuseumNote(museumSlug: string): string | null {
  return MUSEUM_NOTES[museumSlug] ?? null;
}

/** 公式の作品ページを毎日読んで展示状況を出す館。 */
export function readsPlacementDaily(museumSlug: string): boolean {
  return museumSlug === "national-gallery";
}

/** "2026-10-30" → "2026年10月30日" */
export function formatCheckedOn(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
