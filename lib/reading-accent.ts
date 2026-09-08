/**
 * 読み物ハブ(英国を読む・コラム・イギリス英語・英国のいま・イギリスの歴史)の色。
 *
 * ハブごとの色は詳細ページ・ナビ・OGカードと揃っていて、読者は色で
 * 「どのセクションにいるか」を判断している。題字・絞り込みチップ・
 * ページ送りが別々に色を持つと、その手掛かりが崩れるのでここに集める。
 *
 * Tailwind はクラス名を文字列としてビルド時に拾うので、色名から組み立てず
 * 完成したクラス名を置く(`bg-${color}-500` は消える)。
 *
 * 「英国を読む」は4面の親なので固有色を持たない。紫は他の3色と並べたときに
 * いちばん引かない色として、ハブ自身の見出しにだけ使う。
 */

export type ReadingAccentName =
  | "reading"
  | "column"
  | "british-english"
  | "modern-britain"
  | "history";

export type ReadingAccent = {
  /** 見出しの左に立てる縦棒。 */
  bar: string;
  /** 濃い面(題字)の上のラベル。 */
  eyebrowOnDark: string;
  /** 濃い面の上の、見出しの強調部分。 */
  titleOnDark: string;
  /** 題字の隅に置く光。 */
  glow: string;
  /** 明るい面の文字色。 */
  text: string;
  /** 押されているチップ・ページ番号。 */
  on: string;
  /** 押されていないチップの hover。 */
  idle: string;
  /** 淡い hover 面(ページ番号・レールの矢印)。 */
  soft: string;
  /** 入力欄の focus。 */
  focus: string;
};

export const READING_ACCENT: Record<ReadingAccentName, ReadingAccent> = {
  reading: {
    bar: "bg-violet-500",
    eyebrowOnDark: "text-violet-300",
    titleOnDark: "text-violet-400",
    glow: "bg-violet-500/25",
    text: "text-violet-700 dark:text-violet-400",
    on: "bg-violet-500 text-white",
    idle:
      "hover:border-violet-300 hover:text-violet-700 dark:hover:border-violet-700 dark:hover:text-violet-400",
    soft: "hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-400",
    focus:
      "focus:border-violet-400 focus:ring-violet-200 dark:focus:border-violet-500 dark:focus:ring-violet-900/60",
  },
  column: {
    bar: "bg-amber-500",
    eyebrowOnDark: "text-amber-300",
    titleOnDark: "text-amber-400",
    glow: "bg-amber-500/25",
    text: "text-amber-700 dark:text-amber-400",
    on: "bg-amber-500 text-white",
    idle:
      "hover:border-amber-300 hover:text-amber-700 dark:hover:border-amber-700 dark:hover:text-amber-400",
    soft: "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400",
    focus:
      "focus:border-amber-400 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/60",
  },
  "british-english": {
    bar: "bg-rose-500",
    eyebrowOnDark: "text-rose-300",
    titleOnDark: "text-rose-400",
    glow: "bg-rose-500/25",
    text: "text-rose-700 dark:text-rose-400",
    on: "bg-rose-500 text-white",
    idle:
      "hover:border-rose-300 hover:text-rose-700 dark:hover:border-rose-700 dark:hover:text-rose-400",
    soft: "hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-400",
    focus:
      "focus:border-rose-400 focus:ring-rose-200 dark:focus:border-rose-500 dark:focus:ring-rose-900/60",
  },
  /*
    歴史はコラムと同じ琥珀。色を分けるより、/history 自身が前から使っている
    色をそのまま持ってくるほうが読者は迷わない(reading ハブでも同じ判断を
    している)。キーだけ分けてあるのは、あとで片方だけ動かせるようにするため。
  */
  history: {
    bar: "bg-amber-500",
    eyebrowOnDark: "text-amber-300",
    titleOnDark: "text-amber-400",
    glow: "bg-amber-500/25",
    text: "text-amber-700 dark:text-amber-400",
    on: "bg-amber-500 text-white",
    idle:
      "hover:border-amber-300 hover:text-amber-700 dark:hover:border-amber-700 dark:hover:text-amber-400",
    soft: "hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400",
    focus:
      "focus:border-amber-400 focus:ring-amber-200 dark:focus:border-amber-500 dark:focus:ring-amber-900/60",
  },
  "modern-britain": {
    bar: "bg-indigo-500",
    eyebrowOnDark: "text-indigo-300",
    titleOnDark: "text-indigo-400",
    glow: "bg-indigo-500/25",
    text: "text-indigo-700 dark:text-indigo-400",
    on: "bg-indigo-500 text-white",
    idle:
      "hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-700 dark:hover:text-indigo-400",
    soft: "hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400",
    focus:
      "focus:border-indigo-400 focus:ring-indigo-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/60",
  },
};
