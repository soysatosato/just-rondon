/**
 * 交通ガイド記事の型。
 *
 * /housing の住まい探しガイド(components/housing/guides/types.ts)と同じ骨格。
 * 違いは1点だけ:
 *
 * - `atAGlance` の中身が「初期費用・契約形態」ではなく
 *   「料金・所要時間・使いどころ」になる。表の見出しラベルは
 *   TransportGuideLayout 側で固定しているので、記事側は行を並べるだけでよい。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額・上限・改定日は必ず lib/transport/rates.ts から書き出すこと。
 * 直接数値を書くと、毎年3月の運賃改定と11月のバス運賃改定で確実に取りこぼす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type TransportGuideCallout = GuideCalloutData;
export type TransportGuideSection = GuideSectionData;
export type TransportGuideFaq = GuideFaqItem;
export type TransportGuideSource = GuideSourceLink;
export type TransportGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type TransportGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type TransportGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: TransportGuideFact[];
  sections: TransportGuideSection[];
  /** 情報の基準時点。通常 TRANSPORT_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 TRANSPORT_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: TransportGuideFaq[];
  sources?: TransportGuideSource[];
  relatedLinks?: TransportGuideRelatedLink[];
};
