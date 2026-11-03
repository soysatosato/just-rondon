/**
 * 読み物の記事ページの色。ハブの色(lib/reading-accent.ts)と同じ割り当てで、
 * 記事の中で使う部品(引用の縦線・箇条書きの点・要点欄・目次)の分だけを持つ。
 *
 * Tailwind はクラス名を文字列のままビルド時に拾うので、色名から組み立てない。
 */
export type ArticleAccentName = "column" | "british-english" | "modern-britain";

export type ArticleAccent = {
  /** 引用・要点欄の左の縦線。 */
  rule: string;
  /** 箇条書きの点。 */
  marker: string;
  /** 本文中の英語の語句(`code`)の地。 */
  phrase: string;
  /** 小見出しの上の英字・番号。 */
  label: string;
  /** 要点欄の地。 */
  panel: string;
  /** 目次・関連記事の hover。 */
  hover: string;
};

export const ARTICLE_ACCENT: Record<ArticleAccentName, ArticleAccent> = {
  column: {
    rule: "border-amber-400 dark:border-amber-600",
    marker: "marker:text-amber-500",
    phrase:
      "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
    label: "text-amber-700 dark:text-amber-400",
    panel:
      "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20",
    hover:
      "hover:border-amber-300 hover:bg-amber-50/60 dark:hover:border-amber-800 dark:hover:bg-amber-950/20",
  },
  "british-english": {
    rule: "border-rose-400 dark:border-rose-600",
    marker: "marker:text-rose-500",
    phrase: "bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100",
    label: "text-rose-700 dark:text-rose-400",
    panel:
      "border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/20",
    hover:
      "hover:border-rose-300 hover:bg-rose-50/60 dark:hover:border-rose-800 dark:hover:bg-rose-950/20",
  },
  "modern-britain": {
    rule: "border-indigo-400 dark:border-indigo-600",
    marker: "marker:text-indigo-500",
    phrase:
      "bg-indigo-50 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-100",
    label: "text-indigo-700 dark:text-indigo-400",
    panel:
      "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/20",
    hover:
      "hover:border-indigo-300 hover:bg-indigo-50/60 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20",
  },
};
