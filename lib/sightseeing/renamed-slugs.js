// lib/sightseeing/renamed-slugs.js
//
// URL(slug)を付け替えた観光スポットの、旧 slug → 新 slug。
//
// 付け替えたら、旧URLを301で送るだけでは足りない。読者の旅行プランが
// slug でスポットを持っているからで(共有リンク・ブラウザの保存・
// アカウントの保存のどれも)、旧 slug のまま開くと /plan は「非公開に
// なったスポット」とみなし、保存済みのプランから黙って消してしまう。
// 転送(next.config.mjs)とプランの読み替え(lib/plan)の両方がこの表を読む。
//
// CommonJS の .js で書いてあるのは、next.config.mjs からも読むため。
// TS に置くと設定ファイルから読めず、表を2箇所に書くことになる。
//
// 行は消さない。共有リンクは LINE やメールに残り続け、何年後に開かれるか
// 分からない。同じスポットをもう一度付け替えるときは、古い行の行き先も
// 新しい slug に書き換える(転送が2段になり、プランの読み替えも1段しか
// しないため)。

/**
 * 季節の催しの年号を外した(2026-10)。
 *
 * slug に年を入れると、毎年 slug を作り直して評価を捨てるか、古い年の
 * まま放置するかの二択になる。実際どれもタイトルは翌年版に書き換えて
 * あるのに slug だけが前の年のまま残っていた。年はタイトルと本文にだけ
 * 書き、URL は毎年同じものを使い続ける。
 *
 * @type {Readonly<Record<string, string>>}
 */
const RENAMED_ATTRACTION_SLUGS = Object.freeze({
  "rhs-chelsea-flower-show-2026": "rhs-chelsea-flower-show",
  "hyde-park-winter-wonderland-2025": "hyde-park-winter-wonderland",
  "chelsea-winter-village-2025": "chelsea-winter-village",
  "christmas-lights-london-bus-tour-2025": "christmas-lights-london-bus-tour",
});

/**
 * いまの slug。付け替えていなければそのまま返す。
 *
 * @param {string} slug
 * @returns {string}
 */
function currentAttractionSlug(slug) {
  return Object.prototype.hasOwnProperty.call(RENAMED_ATTRACTION_SLUGS, slug)
    ? RENAMED_ATTRACTION_SLUGS[slug]
    : slug;
}

module.exports = {
  RENAMED_ATTRACTION_SLUGS,
  currentAttractionSlug,
};
