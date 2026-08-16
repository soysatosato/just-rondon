/**
 * ミュージカルガイド記事の型。
 *
 * /sightseeing/transport の交通ガイド(components/sightseeing/transport/types.ts)
 * と同じ骨格。違いは1点:
 *
 * - `atAGlance` の中身が「料金・所要時間」ではなく
 *   「誰向けか・いつ読むか・何が決まるか」になる。観劇の記事は
 *   数字より「自分に当てはまるか」を先に知りたい読者が多い。
 *
 * 記事骨格(目次・注意枠・FAQ・出典・鮮度バッジ)は
 * components/guides/types.ts と共通。
 *
 * 作品名・上演時間・年齢の目安を本文に直接書かないこと。DB の Musical から
 * 引くこと。作品は入れ替わり、上演時間は演出の改訂で変わる。
 * 記事に書き込むと、そのたびに全記事を grep することになる。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type MusicalGuideCallout = GuideCalloutData;
export type MusicalGuideSection = GuideSectionData;
export type MusicalGuideFaq = GuideFaqItem;
export type MusicalGuideSource = GuideSourceLink;
export type MusicalGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type MusicalGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type MusicalGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: MusicalGuideFact[];
  sections: MusicalGuideSection[];
  /** 情報の基準時点。通常 MUSICAL_GUIDE_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 MUSICAL_GUIDE_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: MusicalGuideFaq[];
  sources?: MusicalGuideSource[];
  relatedLinks?: MusicalGuideRelatedLink[];
};
