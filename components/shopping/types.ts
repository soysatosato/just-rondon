/**
 * 買い物ガイド記事の型。
 *
 * 交通ガイド(components/sightseeing/transport/types.ts)と同じ骨格。
 * 記事骨格(目次・注意枠・FAQ・出典)は components/guides/types.ts と共通で、
 * ここで足しているのは `atAGlance` の1つだけ。
 *
 * 買い物の記事は「結局いつ行けばいいのか」で決まる。市場は曜日、
 * デパートは日曜の営業時間、セールは時期。冒頭に表で置く。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type ShoppingGuideCallout = GuideCalloutData;
export type ShoppingGuideFaq = GuideFaqItem;
export type ShoppingGuideSource = GuideSourceLink;
export type ShoppingGuideRelatedLink = GuideRelatedLink;

/**
 * 記事に載せる写真。
 *
 * 出典は Wikimedia Commons に限る。CC の画像は作者名とライセンスの
 * 表示が条件なので、URL だけを持つ形にはしない(brands の BrandImage と
 * 同じ考え方)。URL と credit は scripts/lib/commons.ts で解決した値を
 * そのまま貼る——Commons は同じファイル名のまま中身が差し替わることが
 * あり、手で書き起こすと表記だけが古くなる。
 *
 * caption は「何が写っているか」ではなく「この写真が記事のどの主張を
 * 裏付けるか」を書く。曜日と法律がこの記事群の中身なので、写真も
 * そこに紐づける(例: コロンビア・ロードは日曜の午前という一点)。
 */
export type ShoppingGuideFigure = {
  /** Commons の解決済みURL(thumburl)。 */
  image: string;
  /** alt。読み上げ用に被写体を短く言い切る。 */
  alt: string;
  /** 写真の下に出る説明。markdown不可。 */
  caption: string;
  /** 現状 "commons" のみ。ImageCredit がこの値で表記を分岐する。 */
  imageSource: "commons";
  /** 「作者 / ライセンス, via Wikimedia Commons」。 */
  imageCredit: string;
  /** Commons のファイル説明ページ。 */
  imageLink: string;
};

/**
 * 記事本文の節。共通の節に写真を1枚足せるようにしただけ。
 *
 * 写真を節に持たせているのは、この記事群の写真が飾りではなく
 * 「その節が名指ししている場所」を見せるものだから。マーケットの記事で
 * カムデンの写真をコロンビア・ロードの節に置いたら意味が反転する。
 */
export type ShoppingGuideSection = GuideSectionData & {
  figure?: ShoppingGuideFigure;
};

/** 記事冒頭の要約表の1行。 */
export type ShoppingGuideFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

export type ShoppingGuideArticle = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 記事の顔。ハブのカードのサムネイルにも同じ1枚を使う。 */
  hero?: ShoppingGuideFigure;
  /** 冒頭の要約表。3〜6行。 */
  atAGlance?: ShoppingGuideFact[];
  sections: ShoppingGuideSection[];
  /** 情報の基準時点。通常 SHOPPING_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 SHOPPING_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: ShoppingGuideFaq[];
  sources?: ShoppingGuideSource[];
  relatedLinks?: ShoppingGuideRelatedLink[];
};
