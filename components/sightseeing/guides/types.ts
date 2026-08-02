/**
 * 旅行ガイド記事(宿泊・移動・モデルコース・実用情報)の型。
 *
 * 本文は markdown で持つ。MarkdownBody が remark-gfm 込みで
 * テーブルまで描画できるので、料金比較表・エリア比較表・気温表は
 * すべて GFM テーブルで書ける。専用の型は作らない。
 *
 * ここに増やしてよいのは「markdown では表現できないもの」だけ。
 */

export type TravelGuideCallout = {
  /** info=補足 / warn=事故が起きるもの / tip=知っていると得するもの */
  tone: "info" | "warn" | "tip";
  title: string;
  /** markdown */
  body: string;
};

export type TravelGuideSection = {
  /** 目次アンカー用。ページ内で一意。kebab-case。 */
  id: string;
  title: string;
  subtitle?: string;
  /** markdown(GFMテーブル可) */
  body: string;
  /** 「実務メモ」。本文とは視覚的に分ける。 */
  tips?: string[];
  callout?: TravelGuideCallout;
};

export type TravelGuideFaq = {
  question: string;
  /** markdown可。JSON-LD に出す際は stripInlineMarkdown() を通すこと。 */
  answer: string;
};

export type TravelGuideSource = {
  label: string;
  url: string;
};

export type TravelGuideRelatedLink = {
  href: string;
  label: string;
};

export type TravelGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  sections: TravelGuideSection[];
  /**
   * 情報の基準時点。例 "2026年8月"。
   * 料金・制度が載る記事では必須運用。記事冒頭のバッジと
   * 末尾の但し書きの両方で使う。
   */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。Article.dateModified と og:modified_time に使う。 */
  updatedAt: string;
  faq?: TravelGuideFaq[];
  sources?: TravelGuideSource[];
  relatedLinks?: TravelGuideRelatedLink[];
};
