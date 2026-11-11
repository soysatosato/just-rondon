import type { IgCategory, IgPoint } from "../lib/instagram/limits";

/** 描画用の公開フォルダに置いた写真。staticFile で読む。 */
export type ReelPhoto = {
  file: string;
  /** 実寸。縦長の写真を上寄せで切り抜くのに使う。 */
  width: number;
  height: number;
};

/**
 * リール1本ぶんの入力。原稿は InstagramPost(カルーセルと同じ形)そのまま。
 * scripts/render-instagram-reel.ts が組み立てて渡す。JSON にできる値だけを置く
 * (Remotion は props を文字列にして描画用のブラウザへ送る)。
 */
export type ReelProps = {
  category: IgCategory;
  /** イギリス英語の表現(Content.engTitle)。コラムでは null。 */
  word: string | null;
  coverHead: string;
  coverTail: string | null;
  points: IgPoint[];
  closingTitle: string;
  closingBody: string;
  /** コラムの表紙に敷く写真。 */
  photo: ReelPhoto | null;
  /** 写真の作者とライセンス。表紙に小さく出す。 */
  credit: string | null;
  /**
   * 公開フォルダに置いた Noto Sans JP のファイル名。書き出しでは必ず渡す。
   * null は Studio で試しに開くときだけで、端末のフォントで描く。
   */
  fonts: { regular: string; bold: string } | null;
};
