import type { IgCategory } from "./limits";

/**
 * Instagram の版面の寸法・配色・固定文言。カルーセルの静止画
 * (components/og/IgSlide.tsx、satori で描く)とリールの動画
 * (video/ の Remotion、Chrome で描く)の両方が読む。
 *
 * Remotion のバンドラは tsconfig の paths("@/...")を解決しないので、
 * このファイルは相対パスの import だけで書く。
 */

export type IgFrame = {
  width: number;
  height: number;
  /** 文字を置かない余白。リール用は Instagram の表示が重なる範囲を含む。 */
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/**
 * リール用の余白は、Instagram の表示(上のタブ、下のアカウント名と
 * キャプション、右のいいね等のボタン)が重なる範囲。プロフィール一覧の
 * 3:4 の切り抜き(上下240px)よりも内側に文字が収まる。
 */
export const IG_FRAMES = {
  feed: { width: 1080, height: 1350, top: 84, bottom: 76, left: 80, right: 80 },
  reel: { width: 1080, height: 1920, top: 250, bottom: 430, left: 80, right: 140 },
} satisfies Record<string, IgFrame>;

export type IgTheme = {
  badge: string;
  /** バッジの地と札の文字。白地の上で読める濃さ。 */
  strong: string;
  /** 罫線と差し色。 */
  accent: string;
  /** 要点の枚の地。 */
  page: string;
  /** 締めの枚の地。 */
  dark: string;
  /** 写真が無い表紙の地。 */
  panel: string;
};

/** 配色は共有カード(components/og/OgCard.tsx の OG_THEMES)とそろえる。 */
export const IG_THEMES: Record<IgCategory, IgTheme> = {
  column: {
    badge: "COLUMN",
    strong: "#b45309",
    accent: "#f59e0b",
    page: "linear-gradient(160deg, #fffbeb 0%, #ffffff 50%, #fff7ed 100%)",
    dark: "linear-gradient(160deg, #1c1917 0%, #431407 60%, #9a3412 100%)",
    panel: "linear-gradient(160deg, #f59e0b 0%, #ea580c 55%, #e11d48 100%)",
  },
  "british-english": {
    badge: "BRITISH ENGLISH",
    strong: "#dc2626",
    accent: "#f43f5e",
    page: "linear-gradient(160deg, #fff1f2 0%, #ffffff 50%, #fff7ed 100%)",
    dark: "linear-gradient(160deg, #1f0a0d 0%, #4c0519 60%, #9f1239 100%)",
    panel: "linear-gradient(160deg, #f43f5e 0%, #dc2626 55%, #ea580c 100%)",
  },
};

export const IG_SITE = "ジャスト・ロンドン";
export const IG_DOMAIN = "just-rondon.com";
export const IG_TAGLINE = "ロンドンとイギリスの、歩き方";
export const IG_CTA_LEAD = "記事の全文は";
export const IG_CTA_MAIN = "プロフィールのリンクから";
export const IG_CREDIT_PREFIX = "画像: ";

/** 全角を1、半角を0.6として数えた幅。札と見出しの文字寸法を決める。 */
export function textUnits(text: string): number {
  let units = 0;
  for (const ch of Array.from(text)) units += /[ -~]/.test(ch) ? 0.6 : 1;
  return units;
}

export function innerWidth(frame: IgFrame): number {
  return frame.width - frame.left - frame.right;
}

/** 表紙の見出し(日本語)。2〜3行に収まる刻み。 */
export function coverHeadSize(text: string): number {
  const u = textUnits(text);
  if (u <= 9) return 100;
  if (u <= 14) return 88;
  if (u <= 20) return 80;
  if (u <= 26) return 72;
  return 66;
}

/** イギリス英語の表紙の主役(英語)。 */
export function wordSize(text: string): number {
  const n = text.length;
  if (n <= 8) return 150;
  if (n <= 12) return 124;
  if (n <= 18) return 100;
  if (n <= 26) return 80;
  return 64;
}

/** 要点の札。1行に収まるいちばん大きな寸法(上限160px)。 */
export function labelSize(text: string, width: number): number {
  const fit = Math.floor((width / Math.max(textUnits(text), 1)) * 0.95);
  return Math.max(72, Math.min(160, fit));
}

/**
 * 写真に重ねる影。上はバッジの段の下まで、下は見出しの塊の上から暗くする。
 * 位置を割合で固定するとリール用(上下の余白が大きい)で段に届かないので、
 * 余白から計算する。
 */
export function photoShade(frame: IgFrame): string {
  const pct = (px: number) => `${((px / frame.height) * 100).toFixed(1)}%`;
  const topClear = pct(frame.top + 200);
  const fadeStart = pct(frame.height - frame.bottom - 760);
  const dark = pct(frame.height - frame.bottom - 400);
  return (
    `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) ${pct(frame.top + 60)}, ` +
    `rgba(0,0,0,0) ${topClear}, rgba(0,0,0,0) ${fadeStart}, rgba(0,0,0,0.72) ${dark}, rgba(0,0,0,0.9) 100%)`
  );
}
