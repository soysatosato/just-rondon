/**
 * レストラン／パブのガイド記事の型。
 *
 * 骨格(目次・注意枠・FAQ・出典・鮮度バッジ)は
 * components/guides/types.ts と共通。
 *
 * /food(食費を抑える)とは目的が違う点に注意。あちらは節約の技術で、
 * こちらは「店でどう振る舞うか」という文化の解説。金額の話が主役に
 * なってきたら、それは /food に書くべき記事というサイン。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type RestaurantGuideCallout = GuideCalloutData;
export type RestaurantGuideSection = GuideSectionData;
export type RestaurantGuideFaq = GuideFaqItem;
export type RestaurantGuideSource = GuideSourceLink;
export type RestaurantGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type RestaurantGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type RestaurantGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: RestaurantGuideFact[];
  sections: RestaurantGuideSection[];
  /** 情報の基準時点。通常 RESTAURANT_GUIDE_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 RESTAURANT_GUIDE_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: RestaurantGuideFaq[];
  sources?: RestaurantGuideSource[];
  relatedLinks?: RestaurantGuideRelatedLink[];
};
