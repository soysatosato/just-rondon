/**
 * イギリス史の章の型。
 *
 * /housing・/sightseeing/transport のガイド記事と同じ骨格
 * (目次・注意枠・FAQ・出典)を components/guides/types.ts から借りるが、
 * 通史であることから来る違いが3つある。
 *
 * 1. `whereToStand` が必須。各章は必ずロンドンの実在地点に接地させる。
 *    日本語の英国通史はWeb上に大量にあり、そのすべてが地図を持たない。
 *    「読者が実際に立てる場所がある」ことがこのセクションの存在理由なので、
 *    任意フィールドにすると必ず書き忘れて、ただの通史に退化する。
 *    型で強制する。
 *
 * 2. `legacyToday` が必須。「今のイギリスに残っている痕跡」から入る。
 *    パブの閉店時間、日曜の営業規制、NHSが無料であること——読者が既に
 *    不便として体感していることの理由が歴史だった、という順序で書く。
 *    /british-english が「知っている単語なのに意味が違う」で驚きを
 *    作っているのと同じ構造を、制度・習慣でやる。
 *
 * 3. `japanLink` は任意。年表の縦軸に日本を置くと読者の既存知識に
 *    接続できるが、無理に対応させると牽強付会になる章がある
 *    (ローマ期など)。書ける章にだけ書く。
 *
 * 事実の正確さについて:
 * 年号・人名・数字は一次資料または English Heritage / British Museum /
 * UK Parliament / National Archives の記述に合わせること。
 * 通史は「なんとなく知っている」で書くと必ず誤る。
 * 出典を出せない逸話は、面白くても落とす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type HistoryCallout = GuideCalloutData;
export type HistorySection = GuideSectionData;
export type HistoryFaq = GuideFaqItem;
export type HistorySource = GuideSourceLink;
export type HistoryRelatedLink = GuideRelatedLink;

/**
 * 「今も残っている痕跡」。章の冒頭に置く。
 *
 * 歴史の説明から入らず、読者が今日ロンドンで出会うものから入るための枠。
 */
export type HistoryLegacy = {
  /** 読者が体感していること。疑問形で書く。例:「なぜパブは11時に閉まるのか」 */
  question: string;
  /** 答えを一文で。歴史的経緯の要約ではなく、言い切る。 */
  answer: string;
};

/**
 * 「この章に立てる場所」。
 *
 * 観光案内ではなく、その時代の物証が今も見られる地点に限る。
 * 復元やレプリカ、後世の記念碑しかない場所は載せない
 * (blue-plaques が English Heritage 公式のプレートに限るのと同じ理由)。
 */
export type HistoryPlace = {
  name: string;
  engName: string;
  /** その場所で「何が見えるのか」。時代との接点を具体的に。 */
  whatYouSee: string;
  nearestStation: string;
  /** 無料か有料か、予約が要るか。訪問可否を最初に伝える。 */
  access: string;
  /** Google マップの検索語。 */
  mapQuery: string;
  /** サイト内の関連ページ。/museums や /sightseeing/blue-plaques へ送る。 */
  internalLink?: { href: string; label: string };
};

/** 年表の1行。章の範囲内の出来事だけを持たせる。 */
export type HistoryTimelineEntry = {
  /** 表示用の年。「1066」「1642–1651」「紀元43年」など自由表記。 */
  year: string;
  event: string;
  /** 同時代の日本。書ける行にだけ。 */
  japan?: string;
};

export type HistoryChapter = {
  slug: string;
  /** 章番号。chapters.ts の並びから導出せず明示する(本文から参照するため)。 */
  number: number;
  title: string;
  engTitle: string;
  /** 章が扱う期間。カードと記事冒頭に出す。例:「紀元43年〜410年」 */
  period: string;
  summary: string;
  description: string;
  keywords: string[];
  /** 冒頭に置く「今も残る痕跡」。1〜3件。 */
  legacyToday: HistoryLegacy[];
  mainText: string;
  /** 年表。章の範囲だけ。5〜10行。 */
  timeline: HistoryTimelineEntry[];
  sections: HistorySection[];
  /** この章に立てる場所。2〜5件。必須。 */
  whereToStand: HistoryPlace[];
  /** 同時代の日本との接点。書ける章にだけ。 */
  japanLink?: string;
  updatedAt: string;
  faq?: HistoryFaq[];
  sources?: HistorySource[];
  relatedLinks?: HistoryRelatedLink[];
};
