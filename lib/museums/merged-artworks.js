// lib/museums/merged-artworks.js
//
// 同じ資料が作品の表に2行あったのを1行にまとめたときの、消した側の行。
// 消した行の URL(/museums/<館>/artworks/<id>)は、残した行へ恒久転送する。
//
// CommonJS の .js なのは、next.config.mjs の redirects から読むため
// (lib/museum-attraction-pairs.js と同じ理由)。

/**
 * @typedef {{ museumSlug: string, from: string, to: string }} MergedArtwork
 */

/** @type {readonly MergedArtwork[]} */
const MERGED_ARTWORKS = Object.freeze([
  // クレオパトラのミイラ(2026-10-30)。検索で見られている 6690fd10 を残した。
  // scripts/merge-cleopatra-artwork-2026-10.ts
  {
    museumSlug: "british-museum",
    from: "ed145783-27ea-4f69-8df7-75ceadb7965b",
    to: "6690fd10-3de2-453c-90b9-684ce80e89ea",
  },
]);

/**
 * next.config.mjs の redirects() に渡す形。
 *
 * @returns {{ source: string, destination: string, permanent: boolean }[]}
 */
function mergedArtworkRedirects() {
  return MERGED_ARTWORKS.map(({ museumSlug, from, to }) => ({
    source: `/museums/${museumSlug}/artworks/${from}`,
    destination: `/museums/${museumSlug}/artworks/${to}`,
    permanent: true,
  }));
}

module.exports = {
  MERGED_ARTWORKS,
  mergedArtworkRedirects,
};
