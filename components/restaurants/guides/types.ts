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

/**
 * 店を紹介するセクション。
 *
 * 共通の GuideSectionData に instagramUrl を足している。共通側に
 * 入れないのは、/sightseeing と /visa には店の写真という概念がなく、
 * あちらの型を広げる理由がないため。
 *
 * 埋め込めるのは個別投稿(/p/)と Reels(/reel/)だけで、プロフィールURLは
 * 埋め込めない。また必ず「その店の公式アカウントの投稿」を貼ること。
 * 検索で出てくる投稿はレビュアーやファンのアカウントであることが多く、
 * それを店の写真として出すと誤認させる。貼る前に
 * scripts/inspect-instagram.ts でアカウント名を確認する。
 */
export type RestaurantGuideSection = GuideSectionData & {
  instagramUrl?: string;
};
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
