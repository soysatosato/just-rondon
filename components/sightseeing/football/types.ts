/**
 * プレミアリーグ観戦ガイド記事の型。
 *
 * components/sightseeing/transport/types.ts と同じ骨格。違いは1点:
 *
 * - `atAGlance` の中身が「料金・所要時間」ではなく
 *   「チケットの取りやすさ・価格帯・いつ動くか」になる。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の金額・日付・クラブ名は必ず lib/football/clubs.ts から書き出すこと。
 * 直接書くと、毎年の昇降格とメンバーシップ改定で確実に取りこぼす。
 * 特にクラブ名の直書きは、降格したクラブが記事に残り続ける事故になる。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type FootballGuideCallout = GuideCalloutData;
export type FootballGuideSection = GuideSectionData;
export type FootballGuideFaq = GuideFaqItem;
export type FootballGuideSource = GuideSourceLink;
export type FootballGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type FootballGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type FootballGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: FootballGuideFact[];
  sections: FootballGuideSection[];
  /** 情報の基準時点。通常 FOOTBALL_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 FOOTBALL_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: FootballGuideFaq[];
  sources?: FootballGuideSource[];
  relatedLinks?: FootballGuideRelatedLink[];
};
