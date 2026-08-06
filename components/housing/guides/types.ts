/**
 * 住まい探しガイド記事の型。
 *
 * ビザガイド(components/visa/guides/types.ts)とほぼ同じ骨格を使う。
 * 違いは1点だけ:
 *
 * - `atAGlance` の中身が「費用・期間・要件」ではなく
 *   「初期費用・契約形態・注意点」になる。表の見出しラベルは
 *   HousingGuideLayout 側で固定しているので、記事側は行を並べるだけでよい。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額・上限・施行日は必ず lib/housing/rates.ts から書き出すこと。
 * 直接数値を書くと、Renters' Rights Act の段階施行で確実に取りこぼす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type HousingGuideCallout = GuideCalloutData;
export type HousingGuideSection = GuideSectionData;
export type HousingGuideFaq = GuideFaqItem;
export type HousingGuideSource = GuideSourceLink;
export type HousingGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type HousingGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type HousingGuideArticle = {
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
  atAGlance?: HousingGuideFact[];
  sections: HousingGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 HOUSING_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 HOUSING_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: HousingGuideFaq[];
  sources?: HousingGuideSource[];
  relatedLinks?: HousingGuideRelatedLink[];
};
