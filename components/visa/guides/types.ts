/**
 * ビザガイド記事の型。
 *
 * 旅行ガイド(/sightseeing)との違いは2点だけ:
 *
 * 1. `audience` — 「誰向けの記事か」を1行で持つ。/visa ハブの診断フローが
 *    読者を各記事へ振り分けるとき、この文言をそのまま出す。
 *    ハブと記事で表現がずれると読者が「自分の話ではない」と離脱するため、
 *    記事側を正とし、ハブはここを参照する。
 *
 * 2. `atAGlance` — 費用・期間・要件の要約表。ビザ記事は本文が長くなるので、
 *    読者が最初に知りたい「いくら・どれくらい・何が要る」を冒頭で確定させる。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額・閾値は必ず lib/visa/rates.ts から書き出すこと。
 * 直接数値を書くと、毎年4月の料金改定で確実に取りこぼす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type VisaGuideCallout = GuideCalloutData;
export type VisaGuideSection = GuideSectionData;
export type VisaGuideFaq = GuideFaqItem;
export type VisaGuideSource = GuideSourceLink;
export type VisaGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type VisaGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type VisaGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  /** 「〜な人向け」。ハブの診断フローが振り分け先の説明に使う。 */
  audience: string;
  mainText: string;
  /** 冒頭の要約表。費用・滞在期間・主要要件など4〜6行。 */
  atAGlance?: VisaGuideFact[];
  sections: VisaGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 RATES_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 RATES_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: VisaGuideFaq[];
  sources?: VisaGuideSource[];
  relatedLinks?: VisaGuideRelatedLink[];
};
