/**
 * お金・銀行ガイド記事の型。
 *
 * 住まいガイド(components/housing/guides/types.ts)と同じ骨格を使う。
 * 違いは1点だけ:
 *
 * - `atAGlance` の中身が「初期費用・契約形態」ではなく
 *   「必要書類・所要時間・手数料」になる。表の見出しラベルは
 *   MoneyGuideLayout 側で固定しているので、記事側は行を並べるだけでよい。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の手数料率・必要書類・処理期間は必ず lib/money/rates.ts から書き出すこと。
 * 送金手数料は事業者が予告なく変えるため、直接数値を書くと追随できない。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type MoneyGuideCallout = GuideCalloutData;
export type MoneyGuideSection = GuideSectionData;
export type MoneyGuideFaq = GuideFaqItem;
export type MoneyGuideSource = GuideSourceLink;
export type MoneyGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type MoneyGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type MoneyGuideArticle = {
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
  atAGlance?: MoneyGuideFact[];
  sections: MoneyGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 MONEY_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 MONEY_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: MoneyGuideFaq[];
  sources?: MoneyGuideSource[];
  relatedLinks?: MoneyGuideRelatedLink[];
};
