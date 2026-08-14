/**
 * トラブル対応ガイド記事の型。
 *
 * 医療ガイド(components/health/guides/types.ts)と同じ骨格を使う。
 * 違いは1点だけ:
 *
 * - `immediateSteps` を持つ。被害直後の読者は目次を読まない前提に立ち、
 *   「まず何をするか」を本文より前に、番号付きで固定表示する。
 *   医療の atAGlance が「いくらかかるか」を先に確定させるのに対し、
 *   こちらは「いま手を動かす順番」を先に確定させる。
 *
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通。
 *
 * 本文中の電話番号・期限・窓口は必ず lib/trouble/contacts.ts から書き出すこと。
 * 番号の書き間違いが読者の実害に直結するため、直接数値を書かない。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type TroubleGuideCallout = GuideCalloutData;
export type TroubleGuideSection = GuideSectionData;
export type TroubleGuideFaq = GuideFaqItem;
export type TroubleGuideSource = GuideSourceLink;
export type TroubleGuideRelatedLink = GuideRelatedLink;

/**
 * 被害直後にやることの1手順。
 *
 * `timing` は「いつまでに」を示す短いラベル(例「5分以内」)。
 * 混乱している読者にとっては、手順の中身より順番と締切のほうが効く。
 */
export type TroubleImmediateStep = {
  /** 例: "5分以内" "今日中" "数日以内" */
  timing: string;
  /** 何をするか。1行で言い切る。 */
  action: string;
  /** 補足。markdown不可。 */
  detail?: string;
};

/** 記事冒頭の要約表の1行。 */
export type TroubleGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type TroubleGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  /** 「〜な人向け」。ハブのカードが振り分け先の説明に使う。 */
  audience: string;
  mainText: string;
  /** 被害直後の手順。本文より前に固定表示する。3〜6件。 */
  immediateSteps?: TroubleImmediateStep[];
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: TroubleGuideFact[];
  sections: TroubleGuideSection[];
  /** 情報の基準時点。例 "2026年8月"。通常 TROUBLE_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 TROUBLE_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: TroubleGuideFaq[];
  sources?: TroubleGuideSource[];
  relatedLinks?: TroubleGuideRelatedLink[];
};
