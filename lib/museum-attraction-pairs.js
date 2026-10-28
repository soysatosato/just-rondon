// lib/museum-attraction-pairs.js
//
// Museum テーブルと Attraction テーブルの両方に載っている館の対応表。
//
// 同じ館が2つのテーブルに別レコードとして存在する(例: 大英博物館は
// Museum の british-museum と Attraction の british-museum-london)。
// 以前は URL も2本あり、/museums と /sightseeing にそれぞれ別に書いた
// ページがあった。検索に出るのは観光側だけ、所要時間の本体は美術館側、
// 開館時間や料金は21組中12組で2ページが食い違う、という状態だったので、
// 2026-10 に美術館側(/museums/<slug>)の1本にまとめた。
//
// ページは1本になったが、行は両方とも残す。役割が違うため。
// - Attraction: 旅行プラン・周辺スポット・エリアガイド・観光の一覧と特集・
//   スタンプの「定番」やエリアの台紙。料金・所要時間・開館時間の正もこちら
//   (プランの計算がこの列を読む)。
// - Museum: 作品・見どころ・館内の回り方・企画展・美術館の一覧。
//   一覧が並べ替えに使う料金と所要時間は Attraction と同じ値に揃え、
//   ずれは scripts/check-museum-pairs.ts で見つける。
//
// 観光側の URL は next.config.mjs で美術館側へ301で送る。サイト内のリンクは
// 転送を経由させず、attractionPagePath() で最初から美術館側を指す。
//
// CommonJS の .js で書いてあるのは、next.config.mjs からも読むため
// (lib/sightseeing/renamed-slugs.js と同じ理由)。
//
// 対応付けを DB のリレーションではなくここに置いているのは、両テーブルとも
// slug が編集の都合で決まっており機械的な導出ができないため。20件ほどの
// 増減の少ない固定の事実なので、静的表にしてクエリを増やさない。
//
// 追加するときは両方の slug が実在することを確認すること。存在しない slug を
// 書くと転送先とリンク先が 404 になる。

/**
 * @typedef {object} MuseumAttractionPair
 * @property {string} museumSlug /museums/[slug] 側(残すページ)
 * @property {string} attractionSlug Attraction 側(ページは美術館側へ転送)
 */

/** @type {readonly MuseumAttractionPair[]} */
const MUSEUM_ATTRACTION_PAIRS = Object.freeze([
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
  // 2026-09 に Museum 側へ足した4館。作品(フェルメール、アルマダ・ポートレート)
  // を Museum 側の作品ページで見せるために両方に置いている。
  { museumSlug: "london-museum-smithfield", attractionSlug: "london-museum-smithfield" },
  { museumSlug: "royal-academy-of-arts", attractionSlug: "royal-academy-of-arts" },
  { museumSlug: "kenwood-house", attractionSlug: "kenwood-house-hampstead" },
  { museumSlug: "queens-house", attractionSlug: "queens-house-greenwich" },
  // 2026-10-27 の監査で、両方にページがあるのに対応表から漏れていた2館。
  { museumSlug: "courtauld-gallery", attractionSlug: "courtauld-gallery" },
  { museumSlug: "cutty-sark", attractionSlug: "cutty-sark" },
]);

const BY_MUSEUM = new Map(
  MUSEUM_ATTRACTION_PAIRS.map((p) => [p.museumSlug, p.attractionSlug]),
);
const BY_ATTRACTION = new Map(
  MUSEUM_ATTRACTION_PAIRS.map((p) => [p.attractionSlug, p.museumSlug]),
);

/**
 * 美術館の slug から、対になる Attraction の slug。
 *
 * @param {string} museumSlug
 * @returns {string | null}
 */
function attractionSlugForMuseum(museumSlug) {
  return BY_MUSEUM.get(museumSlug) ?? null;
}

/**
 * Attraction の slug から、対になる美術館の slug。
 *
 * @param {string} attractionSlug
 * @returns {string | null}
 */
function museumSlugForAttraction(attractionSlug) {
  return BY_ATTRACTION.get(attractionSlug) ?? null;
}

/**
 * 観光スポットの詳細ページの URL。
 *
 * 対になる美術館がある館は、そちらがページの本体なので /museums を返す。
 * 観光の一覧・特集・旅行プラン・スタンプ帳など、Attraction の行から
 * リンクを張る箇所はすべてここを通すこと。`/sightseeing/${slug}` を
 * 直接書くと、転送を1回挟むリンクになる。
 *
 * @param {string} slug Attraction.slug
 * @returns {string}
 */
function attractionPagePath(slug) {
  const museumSlug = BY_ATTRACTION.get(slug);
  return museumSlug ? `/museums/${museumSlug}` : `/sightseeing/${slug}`;
}

module.exports = {
  MUSEUM_ATTRACTION_PAIRS,
  attractionSlugForMuseum,
  museumSlugForAttraction,
  attractionPagePath,
};
