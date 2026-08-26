/**
 * 食費節約ガイド記事の型。
 *
 * 住まい探しガイド(components/housing/guides/types.ts)とほぼ同じ骨格。
 * 違いは1点だけ:
 *
 * - `atAGlance` の中身が「初期費用・契約形態」ではなく
 *   「いくら浮くか・どこで・条件」になる。
 *
 * `commentPrompt` は両方が持つ。読者が自分で実践している工夫を投稿してもらう
 * セクションの誘導文で、記事ごとに聞きたいことが違うため記事側に持たせる。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額は必ず lib/food/prices.ts から書き出すこと。
 * Meal Deal の価格は年1〜2回上がるので、直接書くと確実に古くなる。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type FoodGuideCallout = GuideCalloutData;
export type FoodGuideSection = GuideSectionData;
export type FoodGuideFaq = GuideFaqItem;
export type FoodGuideSource = GuideSourceLink;
export type FoodGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type FoodGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type FoodGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  /** 「〜な人向け」。ハブのカードが振り分け先の説明に使う。 */
  audience: string;
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: FoodGuideFact[];
  sections: FoodGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 FOOD_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 FOOD_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: FoodGuideFaq[];
  sources?: FoodGuideSource[];
  relatedLinks?: FoodGuideRelatedLink[];
  /**
   * コメント欄の誘導文。記事の内容に合わせて具体的に聞く。
   * 「他にもあれば教えてください」だけだと投稿が集まらないため、
   * 記事ごとに聞きたいことを絞る。
   */
  commentPrompt: string;
};
