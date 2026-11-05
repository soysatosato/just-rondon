/**
 * 審判所の記録の「ここから先は会員」の線引き。
 *
 * 2026-11-05 に運営者が決めた形:
 * - 第1章「何が問題だったのか」は全文を出す。解雇を示唆され、契約書に
 *   署名しなかったところで終わる章で、続きをいちばん読みたくなる位置。
 * - 参考リンク集は公的機関へのリンクを並べただけなので、閉じても意味がない。
 * - それ以外の章は、導入(mainText)と最初の1節を出し、残りの節は見出しだけ見せる。
 *   何が読めるのかが分かる方が登録に進みやすい。
 * - 英語版も同じ位置で閉じる(言語を切り替えれば読める、という抜け道を作らない)。
 *
 * 閉じた節の本文はページの HTML にも RSC の payload にも入れない。
 * ログインしている読者のブラウザが /api/case-story から取りに来る。
 * ページは全員に同じ HTML を返すまま(middleware.ts の説明を参照)。
 *
 * -------------------------------------------------------------------
 * まだ閉じていない理由
 *
 * AdSense の審査に通るまでは閉じない(運営者の判断)。この記録は /about が
 * サイトでいちばんの一次情報として案内しているページで、審査の担当者から
 * 本文が見えないと、中身の薄いページと受け取られるおそれがある。
 * 合格したら下の値を true にするだけで、章ページ・目次・API がそろって切り替わる。
 * -------------------------------------------------------------------
 */
export const CASE_STORY_GATE_ENABLED = false;

/** 全文を出す章。 */
const OPEN_CHAPTERS = new Set(["background", "resources-and-links"]);

/** 閉じる章で、見出しも本文も出す節の数。 */
const FREE_SECTIONS = 1;

/**
 * 既定と違う数だけ出す章。
 * 計算の章は1節目が「考え方」だけで、手を動かす前に切れてしまう。
 * 「ステップ1」まで出して、自分の数字で試せるところまで読ませる。
 */
const FREE_SECTIONS_BY_CHAPTER: Record<string, number> = {
  "check-your-service-charge": 2,
};

/**
 * その章で誰にでも出す節の数。閉じていなければ全部。
 * ページと API の両方がこれを使うので、線の位置は必ずここで決める。
 */
export function freeSectionCount(slug: string, total: number): number {
  if (!CASE_STORY_GATE_ENABLED || OPEN_CHAPTERS.has(slug)) return total;
  return Math.min(FREE_SECTIONS_BY_CHAPTER[slug] ?? FREE_SECTIONS, total);
}
