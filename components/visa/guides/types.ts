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

/**
 * 記事冒頭の要約表の1行。ルート固有の項目だけを持つ。
 *
 * 比較に使う7項目は VisaRouteFacts へ移した。ここに残るのは
 * そのルートにしか無い話(YMS の日本枠、Student の週20時間など)。
 *
 * value は markdown 可。以前このコメントは「markdown不可」と
 * 書いていたが、実際には6本の記事が ** を使っており、レイアウトが
 * 素の文字列として描いていたので生の ** が読者に出ていた。
 * 表示側を MarkdownBody に通す形で揃えてある。
 */
export type VisaGuideFact = {
  label: string;
  /** markdown可。短く言い切る。 */
  value: string;
};

/**
 * ルート同士を並べて比べるための事実。
 *
 * atAGlance(自由な label/value)と分けているのは、比較に使う項目と
 * ルート固有の項目が混ざっていたから。5つのビザルートは実質同じ
 * 7項目を持っていた——スポンサー・年齢・収入要件・初期費用・滞在期間・
 * 永住カウント・審査期間——のに、7つの記事がそれぞれ違うラベルで
 * 書いていたので(「永住まで」と「永住へのカウント」、「費用」と
 * 「費用の総額」と「申請料」)、ハブは横に並べられず、GFM の表を
 * 手書きするしかなかった。
 *
 * 型で固定すると、ハブの比較は生成物になり、記事とずれなくなる。
 * ルート固有の話(YMS の日本枠、Student の週20時間、SW の英語力)は
 * atAGlance に残す。あちらを消すと記事の情報が落ちる。
 *
 * 金額は必ず lib/visa/rates.ts から書き出すこと。毎年4月に改定される。
 */
export type VisaRouteFacts = {
  /**
   * スポンサーの要否。ルート選択で最初に効く分岐。
   * 「雇用主が要るか」で候補が割れるので、真偽ではなく誰かを持つ。
   */
  sponsor: "none" | "employer" | "school" | "partner";
  sponsorNote: string;
  /** 年齢制限。無いルートは null。 */
  ageLimit: string | null;
  /** 収入・資金の要件。無いルートは null(Global Talent だけ)。 */
  incomeRequirement: string | null;
  /** 申請時に払う総額の目安。申請料と IHS を分けずに、実際の請求額で。 */
  upfrontCost: string;
  /** upfrontCost の内訳。何が積み上がっているのか。 */
  upfrontNote: string;
  /** 滞在できる期間。 */
  maxStay: string;
  /**
   * 永住(ILR)にカウントされるか。
   *
   * 真偽で持つのは、ここが長期滞在の設計を左右する一点だから。
   * YMS・Student・Graduate は1日も算入されず、それを知らずに
   * 数年過ごしてから気づく人がいる。文章に埋めると読み飛ばされる。
   */
  countsTowardsIlr: boolean;
  ilrNote: string;
  /** 標準の審査期間。家族ビザだけ他の4倍かかる。 */
  processing: string;
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
