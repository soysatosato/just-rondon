/**
 * 光熱費・生活の契約ガイド記事の型。
 *
 * 医療ガイド(components/health/guides/types.ts)と同じ骨格を使う。
 * 違いは1点だけ:
 *
 * - `atAGlance` の中身が「費用・持ち物・所要時間」ではなく
 *   「誰が払うか・いくらか・いつまでに何をするか」になる。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額・期間・規則の施行日は必ず lib/bills/rates.ts から書き出すこと。
 * ガス・電気の単価は3か月ごと、それ以外も毎年4月に改定されるため、
 * 直接数値を書くと取りこぼす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type BillsGuideCallout = GuideCalloutData;
export type BillsGuideSection = GuideSectionData;
export type BillsGuideFaq = GuideFaqItem;
export type BillsGuideSource = GuideSourceLink;
export type BillsGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type BillsGuideFact = {
  label: string;
  /** markdown可。1〜2文で言い切る。 */
  value: string;
};

export type BillsGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  /** 「〜な人」。ハブの状況カードがそのまま見出しに使う。 */
  audience: string;
  mainText: string;
  /** 冒頭の要約表。4〜6行。 */
  atAGlance?: BillsGuideFact[];
  sections: BillsGuideSection[];
  /** 情報の基準時点。通常 BILLS_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 BILLS_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: BillsGuideFaq[];
  sources?: BillsGuideSource[];
  relatedLinks?: BillsGuideRelatedLink[];
};
