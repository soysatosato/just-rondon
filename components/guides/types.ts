/**
 * ガイド記事の共通プリミティブ。
 *
 * /sightseeing の旅行ガイドと /visa のビザガイドは、記事の骨格
 * (目次・注意枠・FAQ・出典・鮮度バッジ)が同じなので、そこだけをここに置く。
 * 各セクション固有のフィールド(旅行ガイドの dataAsOf 運用ルール、
 * ビザガイドのルート分類など)は、それぞれの types.ts に残すこと。
 */

export type GuideCalloutData = {
  /** info=補足 / warn=事故が起きるもの / tip=知っていると得するもの */
  tone: "info" | "warn" | "tip";
  title: string;
  /** markdown */
  body: string;
};

export type GuideSectionData = {
  /** 目次アンカー用。ページ内で一意。kebab-case。 */
  id: string;
  title: string;
  subtitle?: string;
  /** markdown(GFMテーブル可) */
  body: string;
  /** 「実務メモ」。本文とは視覚的に分ける。 */
  tips?: string[];
  callout?: GuideCalloutData;
};

export type GuideFaqItem = {
  question: string;
  /** markdown可。JSON-LD に出す際は stripInlineMarkdown() を通すこと。 */
  answer: string;
};

export type GuideSourceLink = {
  label: string;
  url: string;
};

export type GuideRelatedLink = {
  href: string;
  label: string;
};
