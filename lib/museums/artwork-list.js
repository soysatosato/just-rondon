// lib/museums/artwork-list.js
//
// 館の作品一覧(/museums/<slug>/artworks)を、検索に出す独立したページとして
// 扱うかどうかの判定。
//
// CommonJS の .js で書いてある。next-sitemap.config.js も同じ判定で URL を
// 出し分ける必要があり、あちらは CJS なので TS を読めない
// (lib/musicals/song-pages.js と同じ理由)。

/**
 * 一覧を独立したページとして載せる最小の作品数。
 *
 * 作品が数点しかない館では、一覧が館のページの「見どころ作品」と同じものを
 * 並べ直すだけになる。2026-10 にはクイーンズ・ハウス(1点)、ケンウッド・
 * ハウス(2点)、ダリッジ・ピクチャー・ギャラリー(3点)の一覧が、
 * 「主要作品のガイド・徹底解説」という見出しで sitemap に載っていた。
 *
 * これより少ない館では、一覧のページ自体は残し(作品ページのパンくずが指す)、
 * noindex にして、sitemap と館のページの「一覧を見る」からは外す。
 * 3館とも作品はすべて必見で、館のページに全部出ているので取りこぼしは無い。
 */
const MIN_ARTWORKS_FOR_LIST = 5;

/**
 * @param {number} artworkCount
 * @returns {boolean}
 */
function hasArtworkList(artworkCount) {
  return artworkCount >= MIN_ARTWORKS_FOR_LIST;
}

module.exports = {
  MIN_ARTWORKS_FOR_LIST,
  hasArtworkList,
};
