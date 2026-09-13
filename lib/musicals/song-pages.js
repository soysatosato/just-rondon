// lib/musicals/song-pages.js
//
// 曲ページ(/musicals/<slug>/songs と /musicals/<slug>/songs/<id>)を
// 出すかどうかの判定。
//
// CommonJS の .js で書いてある。next-sitemap.config.js も同じ判定で
// URL を出し分ける必要があり、あちらは CJS なので TS を読めない。
// 判定を2箇所に書くと、片方だけ直したときに sitemap が 404 のURLを
// 申告することになるので、このファイルだけに置いて双方から読む。

/**
 * 曲ページ一式を公開するかのフラグ。
 *
 * 曲詳細ページの本文は歌詞の全文と和訳で、第三者の著作物にあたる。
 * noindex にしても公開している限り AdSense の著作権ポリシーには
 * 抵触するので、審査中は曲一覧ごと 404 にしている。曲一覧は
 * 歌詞ページへの入口で、それが無くなると曲名が並ぶだけになるため。
 *
 * 歌詞データは DB に残してある。この値を true に戻せば再公開できる。
 *
 * false の間は次がすべて止まる。
 * - /musicals/<slug>/songs と /musicals/<slug>/songs/<id> が 404 になる
 * - 作品ページの「曲一覧へ」ボタンが出ない
 * - sitemap に曲ページのURLが載らない
 */
const SONGS_PUBLISHED = false;

/**
 * 作品に曲一覧ページを生やすか。
 *
 * 曲が1件も無い作品に一覧を生やすと「まだ曲が登録されていません」と
 * 出るだけの空ページになる。31作品中26作品がそうだった。
 *
 * @param {number} songCount
 * @returns {boolean}
 */
function hasSongList(songCount) {
  return SONGS_PUBLISHED && songCount > 0;
}

module.exports = {
  SONGS_PUBLISHED,
  hasSongList,
};
