/**
 * エリアガイド記事の型。
 *
 * /sightseeing/transport の交通ガイド(components/sightseeing/transport/types.ts)
 * と同じ骨格。違いは2点:
 *
 * - `atAGlance` の中身が「料金・所要時間」ではなく
 *   「最寄駅・歩く時間・向いている時間帯」になる。
 * - `walk` を持つ。エリアガイドの本体は回遊ルートなので、
 *   本文とは別に「どの順で歩くか」を構造化して持たせる。
 *
 * スポットは DB の Attraction.area から引く。記事側に名前を
 * 直書きしないこと——スポットが増減したときに記事が古くなる。
 * 例外は DB に未登録のもの(バラ・マーケット等)で、これは
 * `walk` のステップに手書きで入れてよい。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type AreaGuideCallout = GuideCalloutData;
export type AreaGuideSection = GuideSectionData;
export type AreaGuideFaq = GuideFaqItem;
export type AreaGuideSource = GuideSourceLink;
export type AreaGuideRelatedLink = GuideRelatedLink;

/** 記事冒頭の要約表の1行。 */
export type AreaGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

/**
 * 回遊ルートの1ステップ。
 *
 * `attractionSlug` を入れると、表示側が DB のスポットへリンクする。
 * DB に無い場所(マーケット、通り、店)は slug を省いて title だけ書く。
 */
export type AreaWalkStep = {
  /** 何番目に歩くか。表示順はこの配列の順。 */
  title: string;
  /** DB の Attraction.slug。あればスポット詳細へリンクする。 */
  attractionSlug?: string;
  /** ここで何をするか、何分くらいか。1〜3文。 */
  body: string;
  /** 次のステップまでの移動(例: "テムズ川沿いを東へ徒歩10分")。 */
  walkToNext?: string;
};

export type AreaGuideWalk = {
  /** ルート名(例: "半日で歩く定番ルート")。 */
  title: string;
  /** 所要時間の目安(例: "3〜4時間")。 */
  duration: string;
  /** どこから始めてどこで終わるか。1〜2文。 */
  intro: string;
  steps: AreaWalkStep[];
};

export type AreaGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: AreaGuideFact[];
  /** 回遊ルート。エリアガイドの中核なので、原則すべての記事が持つ。 */
  walk?: AreaGuideWalk;
  sections: AreaGuideSection[];
  /** 情報の基準時点。通常 AREA_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 AREA_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: AreaGuideFaq[];
  sources?: AreaGuideSource[];
  relatedLinks?: AreaGuideRelatedLink[];
};
