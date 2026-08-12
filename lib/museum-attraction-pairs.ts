/**
 * Museum テーブルと Attraction テーブルの両方に載っている館の対応表。
 *
 * 同じ館が2つのテーブルに別レコードとして存在するため、URL も2本ある
 * （例: 大英博物館は /museums/british-museum と
 * /sightseeing/british-museum-london）。放置すると読者は片方に着いたまま
 * もう片方の情報に辿り着けず、検索でも2ページが同じ語で競合する。
 *
 * 対応付けを DB のリレーションではなくここに置いているのは、両テーブルとも
 * slug が編集の都合で決まっており機械的な導出ができないため。17件は
 * 増減の少ない固定の事実なので、静的表にしてクエリを増やさない。
 *
 * 追加するときは両方の slug が実在することを確認すること。存在しない slug を
 * 書くとリンク先が 404 になる。
 */
export type MuseumAttractionPair = {
  /** /museums/[slug] 側 */
  museumSlug: string;
  /** /sightseeing/[slug] 側 */
  attractionSlug: string;
};

export const MUSEUM_ATTRACTION_PAIRS: readonly MuseumAttractionPair[] = [
  { museumSlug: "british-museum", attractionSlug: "british-museum-london" },
  { museumSlug: "national-gallery", attractionSlug: "national-gallery-london" },
  { museumSlug: "natural-history-museum", attractionSlug: "natural-history-museum" },
  { museumSlug: "science-museum", attractionSlug: "science-museum" },
  { museumSlug: "tate-modern", attractionSlug: "tate-modern" },
  { museumSlug: "tate-britain", attractionSlug: "tate-britain" },
  { museumSlug: "london-transport-museum", attractionSlug: "london-transport-museum" },
  { museumSlug: "imperial-war-museum", attractionSlug: "imperial-war-museum" },
  { museumSlug: "museum-of-brands", attractionSlug: "museum-of-brands-london" },
  { museumSlug: "young-va", attractionSlug: "young-va-bethnal-green" },
  { museumSlug: "kings-gallery", attractionSlug: "kings-gallery-buckingham-palace" },
  { museumSlug: "royal-observatory-greenwich", attractionSlug: "royal-observatory-greenwich" },
  { museumSlug: "clink-prison-museum", attractionSlug: "the-clink-prison-museum" },
  { museumSlug: "sir-john-soanes-museum", attractionSlug: "sir-john-soanes-museum" },
  { museumSlug: "household-cavalry-museum", attractionSlug: "household-cavalry-museum" },
] as const;

const BY_MUSEUM = new Map(
  MUSEUM_ATTRACTION_PAIRS.map((p) => [p.museumSlug, p.attractionSlug]),
);
const BY_ATTRACTION = new Map(
  MUSEUM_ATTRACTION_PAIRS.map((p) => [p.attractionSlug, p.museumSlug]),
);

/** /museums/[slug] から見た、対応する観光スポットページの slug */
export function attractionSlugForMuseum(museumSlug: string): string | null {
  return BY_MUSEUM.get(museumSlug) ?? null;
}

/** /sightseeing/[slug] から見た、対応する美術館ページの slug */
export function museumSlugForAttraction(attractionSlug: string): string | null {
  return BY_ATTRACTION.get(attractionSlug) ?? null;
}
