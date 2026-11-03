// lib/masterpieces/indexable.js
//
// 名作ページ(lib/masterpieces)を書き終えた作品ページの URL。
//
// 作品ページ(/museums/<館>/artworks/<id>)は DB から館ごとに数百件ずつ生え、
// 1件あたりの本文が数百字しかないので全件 noindex にしてある。名作ページの
// 本文(展示状況・行き方・見るところ・出典)を書いた作品だけを
//
//   ページ   検索に載せる   app/museums/[slug]/artworks/[id]/page.tsx
//   sitemap  載せる         next-sitemap.config.js
//   広告     出す           lib/ad-placement.ts
//
// にする。3か所ともこの配列を読むので、書き終えたら
// lib/masterpieces/content/ の GUIDES とここに1つずつ足す
// (両者が食い違うと lib/masterpieces/index.ts が読み込みの時点で止まる)。
//
// CommonJS の .js なのは、next-sitemap.config.js が TS を読めないため。

/** 名作ページを書き終えた作品ページのパス。 */
const MASTERPIECE_PATHS = Object.freeze([
  "/museums/national-gallery/artworks/1e7aa46e-8b4d-4947-beee-2e7c96bafe5d",
]);

/**
 * @param {string} pathname
 * @returns {boolean}
 */
function isMasterpiecePath(pathname) {
  return MASTERPIECE_PATHS.includes(pathname);
}

module.exports = {
  MASTERPIECE_PATHS,
  isMasterpiecePath,
};
