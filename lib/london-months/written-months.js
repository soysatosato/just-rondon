// lib/london-months/written-months.js
//
// 「◯月のロンドン」(/events/<月>)のうち、本文を書き終えた月。
//
// ここに無い月のページは、平年値・日の出入り・祝日・イベント表だけで
// 組んであり、その月のための文章が無い。しかも「2027年1月の日付で表示」と
// 出しながら、催しは去年の日程しか載っていない。書き終えるまでは
//
//   ページ   noindex        app/(with-ads)/events/[slug]/page.tsx
//   sitemap  載せない       next-sitemap.config.js
//   広告     出さない       lib/ad-placement.ts
//
// にする。3か所ともこの配列を読むので、月を書き終えたら
// lib/london-months/content/index.ts の GUIDES とここに1つずつ足す
// (両者が食い違うと content/index.ts が読み込みの時点で止まる)。
//
// CommonJS の .js なのは、next-sitemap.config.js が TS を読めないため。

/** 本文を書き終えた月(1〜12)。 */
const WRITTEN_MONTHS = Object.freeze([10, 11, 12]);

// lib/events.ts の MONTH_NAME_TO_NUMBER と同じ並び。あちらは TS なので
// sitemap から読めず、ここに同じ12語を持つ。
const MONTH_SLUGS = Object.freeze([
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
]);

/**
 * @param {number} month 1〜12
 * @returns {boolean}
 */
function isWrittenMonth(month) {
  return WRITTEN_MONTHS.includes(month);
}

/**
 * 本文を書き終えた月のパス(/events/october など)。
 *
 * @returns {string[]}
 */
function writtenMonthPaths() {
  return MONTH_SLUGS.filter((_, i) => isWrittenMonth(i + 1)).map(
    (slug) => `/events/${slug}`,
  );
}

/**
 * まだ本文の無い月のパス(/events/january など)。
 *
 * @returns {string[]}
 */
function unwrittenMonthPaths() {
  return MONTH_SLUGS.filter((_, i) => !isWrittenMonth(i + 1)).map(
    (slug) => `/events/${slug}`,
  );
}

module.exports = {
  WRITTEN_MONTHS,
  isWrittenMonth,
  writtenMonthPaths,
  unwrittenMonthPaths,
};
