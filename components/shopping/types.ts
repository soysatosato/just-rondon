/**
 * 買い物ガイド記事の型。
 *
 * 交通ガイド(components/sightseeing/transport/types.ts)と同じ骨格。
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通で、
 * ここで足しているのは `atAGlance` の1つだけ。
 *
 * 買い物の記事は「結局いつ行けばいいのか」で決まる。市場は曜日、
 * デパートは日曜の営業時間、セールは時期。冒頭に表で置く。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type ShoppingGuideCallout = GuideCalloutData;
export type ShoppingGuideSection = GuideSectionData;
export type ShoppingGuideFaq = GuideFaqItem;
export type ShoppingGuideSource = GuideSourceLink;
export type ShoppingGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type ShoppingGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type ShoppingGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: ShoppingGuideFact[];
  sections: ShoppingGuideSection[];
  /** 情報の基準時点。通常 SHOPPING_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 SHOPPING_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: ShoppingGuideFaq[];
  sources?: ShoppingGuideSource[];
  relatedLinks?: ShoppingGuideRelatedLink[];
};
