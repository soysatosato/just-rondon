/**
 * 旅行ガイド記事(宿泊・移動・モデルコース・実用情報)の型。
 *
 * 本文は markdown で持つ。MarkdownBody が remark-gfm 込みで
 * テーブルまで描画できるので、料金比較表・エリア比較表・気温表は
 * すべて GFM テーブルで書ける。専用の型は作らない。
 *
 * ここに増やしてよいのは「markdown では表現できないもの」だけ。
 *
 * 記事の骨格(目次・注意枠・FAQ・出典)は /visa のビザガイドと共通なので
 * components/guides/types.ts に置いてある。ここでは旅行ガイド向けの
 * 名前を付け直して再輸出する。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type TravelGuideCallout = GuideCalloutData;
export type TravelGuideSection = GuideSectionData;
export type TravelGuideFaq = GuideFaqItem;
export type TravelGuideSource = GuideSourceLink;
export type TravelGuideRelatedLink = GuideRelatedLink;

export type TravelGuideArticle = {
  /**
   * URL の末尾。子ページは `itinerary/rainy-day` のように
   * 親 slug からの相対パスをスラッシュ区切りで持つ。
   * travelGuidePath() がそのまま /sightseeing に連結する。
   */
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
  /**
   * 本文で触れた観光スポットの slug。記事末に写真付きのカードで出す。
   *
   * モデルコースは大英博物館やロンドン塔を本文で名前を出しておきながら、
   * 各スポットの詳細ページへ渡す導線がどこにもなかった。読者は施設名を
   * 改めて検索し直すことになる。
   *
   * 本文の markdown を機械的にリンクへ置換する手もあるが、既存のリンク内の
   * 文字列まで壊すおそれがあるため、記事ごとに手で並べる。順番は本文で
   * 登場する順。存在しない slug は表示時に黙って捨てる。
   */
  attractionSlugs?: string[];
};
