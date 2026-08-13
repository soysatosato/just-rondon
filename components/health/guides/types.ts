/**
 * 医療ガイド記事の型。
 *
 * 住まいガイド(components/housing/guides/types.ts)と同じ骨格を使う。
 * 違いは1点だけ:
 *
 * - `atAGlance` の中身が「初期費用・契約形態」ではなく
 *   「費用・持ち物・所要時間」になる。表の見出しラベルは
 *   HealthGuideLayout 側で固定しているので、記事側は行を並べるだけでよい。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額・電話番号・期間は必ず lib/health/rates.ts から書き出すこと。
 * NHS の患者負担額は毎年4月1日に改定されるため、直接数値を書くと取りこぼす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type HealthGuideCallout = GuideCalloutData;
export type HealthGuideSection = GuideSectionData;
export type HealthGuideFaq = GuideFaqItem;
export type HealthGuideSource = GuideSourceLink;
export type HealthGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type HealthGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type HealthGuideArticle = {
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
  atAGlance?: HealthGuideFact[];
  sections: HealthGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 HEALTH_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 HEALTH_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: HealthGuideFaq[];
  sources?: HealthGuideSource[];
  relatedLinks?: HealthGuideRelatedLink[];
};
