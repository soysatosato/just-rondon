/**
 * 出会い・人間関係ガイド記事の型。
 *
 * トラブル対応ガイド(components/trouble/guides/types.ts)と骨格は同じだが、
 * 読者の状態が違うので冒頭のブロックが違う。
 *
 * - trouble の `immediateSteps` は「いま手を動かす順番」。読者は緊急事態にいる。
 * - social の `takeaways` は「先に結論」。読者は緊急ではないが、
 *   長く停滞していて、記事を読み切る気力が落ちている。
 *   だから手順ではなく、読まなくても持ち帰れる結論を先に置く。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中のアプリ料金・イベント時期・相談窓口は lib/social/facts.ts から
 * 書き出すこと。とくに SAFETY_CONTACTS の番号は直接書かない。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type SocialGuideCallout = GuideCalloutData;
export type SocialGuideSection = GuideSectionData;
export type SocialGuideFaq = GuideFaqItem;
export type SocialGuideSource = GuideSourceLink;
export type SocialGuideRelatedLink = GuideRelatedLink;

/**
 * 記事の結論を先に出す1項目。
 *
 * このセクションの読者は「答えが出ないまま何ヶ月も過ごしている」状態にある。
 * 目次を見て該当箇所を探す元気がある読者ばかりではないので、
 * 記事を読まずに離脱しても最低限の結論が残るようにする。
 */
export type SocialTakeaway = {
  /** 結論。1行で言い切る。 */
  point: string;
  /** なぜそうなるか。markdown不可。 */
  detail?: string;
};

/** 記事冒頭の要約表の1行。 */
export type SocialGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type SocialGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  /** 「〜な人向け」。ハブのカードが振り分け先の説明に使う。 */
  audience: string;
  mainText: string;
  /** 記事の結論。本文より前に固定表示する。3〜5件。 */
  takeaways?: SocialTakeaway[];
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: SocialGuideFact[];
  sections: SocialGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 SOCIAL_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 SOCIAL_UPDATED_AT を渡す。 */
  updatedAt: string;
  /**
   * 安全に関わる注意を記事上部に固定表示するか。
   * dating カテゴリの記事だけ true にする。
   * 全記事に出すと警告の価値が下がるので、恋愛の記事に限定する。
   */
  showSafetyNotice?: boolean;
  faq?: SocialGuideFaq[];
  sources?: SocialGuideSource[];
  relatedLinks?: SocialGuideRelatedLink[];
};
