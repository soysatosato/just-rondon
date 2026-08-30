/**
 * Beyond London(ロンドン外)の記事の型。
 *
 * 記事骨格(目次・注意枠・FAQ・出典・鮮度)は
 * components/guides/types.ts と共通。このファイルが持つのは、
 * 「ロンドン外である」ことから来る差分だけ。
 *
 * このセクションは2系統の記事を持つ:
 *
 *   DestinationArticle  … 行き先ごとの記事(ウィンザー、オックスフォード…)
 *   RailHowToArticle    … 目的地を跨ぐ移動の実務(BritRail Pass)
 *
 * 型を分けているのは、ハブのカードで混ざると読者が
 * 「BritRail Pass」を行き先だと誤読するため。
 * 表示側も別コンポーネントで描く。
 *
 * 本文中の金額・制度は必ず lib/beyond-london/rates.ts から書き出すこと。
 * 全国運賃は例年3月に改定され、BritRail の価格は代理店と為替で動く。
 * 直接数値を書くと確実に取りこぼす。
 */

import type {
  GuideCalloutData,
  GuideFaqItem,
  GuideRelatedLink,
  GuideSectionData,
  GuideSourceLink,
} from "@/components/guides/types";

export type BeyondCallout = GuideCalloutData;
export type BeyondSection = GuideSectionData;
export type BeyondFaq = GuideFaqItem;
export type BeyondSource = GuideSourceLink;
export type BeyondRelatedLink = GuideRelatedLink;

/**
 * 要約表の1行。RailHowToArticle だけが使う。
 *
 * 行き先記事は BeyondVerdict に移した。あちらは行き方・見どころと
 * 事実が重複するので型で締める必要があったが、BritRail Pass のような
 * 制度の記事には対応する表が他に無く、持つべき項目も記事ごとに違う。
 */
export type BeyondFact = {
  label: string;
  /** markdown不可。短く言い切る。 */
  value: string;
};

/**
 * 「行き方」。目的地記事の中核で、型で必須にしている。
 *
 * なぜ必須か:
 * 日本語の日帰り情報は「何があるか」は書くが、
 * 「どの駅から・何分で・往復いくらで・当日券で行けるか」を書かない。
 * ここが空白地帯で、このセクションの存在理由そのもの。
 * 任意フィールドにすると必ず書き忘れて、ただの紹介記事に退化する。
 * (/history の whereToStand、/sightseeing/areas の walk と同じ考え方)
 *
 * 金額を直書きしないこと。運賃の桁感は
 * lib/beyond-london/rates.ts の LONG_DISTANCE_ROUTES が持つか、
 * 「Advance で£20台」のような帯で書く。実額は日々変わる。
 */
export type GettingThere = {
  /** ロンドン側の始発駅。複数あるなら主要な1つ＋補足。 */
  fromStation: string;
  /** 運行会社。遅延・運休時の問い合わせ先になるので必ず書く。 */
  operator: string;
  /** 片道の実所要時間。乗り換えがあるなら含めた時間。 */
  journeyTime: string;
  /** 毎時何本か。これが無いと「乗り遅れたら終わり」かが判らない。 */
  frequency: string;
  /** 運賃の目安。Advance と当日券の差を示す。 */
  fareGuide: string;
  /**
   * Oyster・タッチ決済が使えるか。
   *
   * 独立フィールドにしているのは、ここが最も事故が起きる一点だから。
   * ウィンザーやブライトンは圏外で、知らずに改札を通ると
   * 罰金の対象になる。日本語情報でこれを明示しているものはほぼない。
   */
  oysterValid: boolean;
  /** oysterValid の補足(どこまでが圏内か、代わりに何を買うか)。 */
  oysterNote: string;
  /** 事前予約すべきか、当日でいいか。 */
  bookingAdvice: string;
  /** Railcard が効く場合の補足。2人以上なら Two Together など。 */
  railcardNote?: string;
};

/**
 * 現地での回り方。
 *
 * 駅に着いてからどうするか。エリアガイド(/sightseeing/areas)の
 * walk ほど詳細な順路は持たせない——ロンドン外は滞在時間が
 * 人によって大きく違うので、順路を固定すると使えなくなる。
 * 「駅から何分」「半日ならどこまで」の粒度で持つ。
 */
export type OnArrival = {
  /** 駅から中心部までの移動手段と時間。 */
  fromStationToCentre: string;
  /** 半日で回れる範囲。 */
  halfDay: string;
  /** 終日使えるならどこまで伸ばせるか。 */
  fullDay?: string;
};

/**
 * 現地の見どころ。DB を持たないので記事側に置く。
 *
 * 画像は blue-plaques / film-locations と同じ方針で、
 * Wikimedia Commons の CC/PD 画像を直リンクし、imageCredit を必ず表示する。
 * ロンドン外は読者が現地を全く知らないため、
 * 「何が見えるのか」を文章だけで伝えるより写真1枚のほうが速い。
 * ただし画像は任意——適切な自由ライセンス画像が無い見どころ
 * (私有地・屋内展示など)を、無理に埋めて質を落とさないため。
 */
export type BeyondHighlight = {
  name: string;
  engName: string;
  /** 何が見えるのか。1〜2文。 */
  body: string;
  /** 入場料・予約の要否。無料なら「無料」と書き切る。 */
  admission: string;
  /** Google マップの検索語。 */
  mapQuery: string;
  /** サイト内の関連ページ(/history の章など)。 */
  internalLink?: { href: string; label: string };
  /**
   * 見どころの写真。Commons の thumb URL を使う(原寸は数MBある)。
   * next.config.mjs で画像最適化を止めているので、
   * ここで縮めておかないとそのまま読者に届く。
   */
  image?: string;
  /** ImageCredit の分岐キー。Commons 由来なら "commons"。 */
  imageSource?: string;
  /** 撮影者とライセンス。commons のときは表示が条件なので必須。 */
  imageCredit?: string;
  /** Commons のファイルページ。 */
  imageLink?: string;
};

/** 二層構成。ハブでの束ね方。 */
export type BeyondTier = "dayTrip" | "weekender";

/**
 * 「宿と夜」。週末1泊圏(tier: "weekender")の記事だけが持つ。
 *
 * なぜ1泊圏にだけ必要か:
 * 日帰りは「行って帰る」だけなので gettingThere で足りる。
 * 1泊すると判断が3つ増える——どこに泊まるか、夜に何をするか、
 * 何時の列車で帰るか。この3つは日本語の情報がとりわけ薄く、
 * 「宿は現地で探せばいい」と書いてあることすらある。
 *
 * 型で必須にしていない(? 付き)のは、DestinationArticle が
 * 日帰り圏と共用の型だから。tier: "weekender" の記事では
 * 必ず埋めること——ハブの週末セクションに並ぶ記事がこれを
 * 欠いていると、1泊圏として成立しない。
 *
 * 宿の固有名詞は書かない。開業・閉業・改装で古くなるうえ、
 * 価格帯も季節で動く。「どのエリアに取るか」と「何を基準に選ぶか」
 * までに留める(/sightseeing/hotels が市内で取っているのと同じ方針)。
 */
export type StayAndNight = {
  /** どのエリアに宿を取るか。地区名と、その理由。 */
  whereToStay: string;
  /** 宿の相場観。幅で書く。固有名詞は出さない。 */
  priceBand: string;
  /** 夜に何ができるか。1泊する価値がここに出る。 */
  atNight: string;
  /** 翌日の帰り方。何時台に出れば何時にロンドンに着くか。 */
  gettingBack: string;
  /**
   * 宿泊税など、その土地だけの上乗せ。
   * エディンバラのように制度が始まったばかりの土地では必須。
   */
  levyNote?: string;
};

/**
 * 「自分に向いているか」の判断材料。行き先記事が必ず持つ。
 *
 * これは atAGlance(自由な label/value の表)を置き換えたもの。
 * 自由形式だったころ、11記事すべてが所要時間と Oyster の行を持ち、
 * その2つは gettingThere が同じことを書いていた。入場料の行も
 * highlights[].admission と同じ ADMISSIONS を参照していた。
 * つまり冒頭の「要点」表は、半分が下の表の先出しだった。
 * 同じ見た目の灰色の表が2つ続き、片方を読んでももう片方を
 * 読まされる形になっていた。
 *
 * そこで、行き方でも見どころでもないもの——読者が
 * 「そもそも自分はここに行くべきか」を決めるのに要る3点だけを
 * 型で持つ。事実は gettingThere と highlights が一箇所で持ち、
 * ここは判断だけを持つ。フィールドを固定しているのは、自由形式に
 * 戻すと必ずまた事実が写し取られてくるから。
 */
export type BeyondVerdict = {
  /** どれだけ時間を見ておくか。1文。 */
  stayLength: string;
  /**
   * この行き先で最も外しやすい一点。
   *
   * 記事ごとに違う(ウィンザーは開館曜日、ペンザンスは潮、
   * オックスフォードは学期)。ここが空欄になる行き先は無い——
   * 無いなら、その行き先はまだ調べ足りていない。
   */
  watchOut: string;
  /** 誰に向くか。裏返せば、誰には向かないか。 */
  suitedTo: string;
};

export type DestinationArticle = {
  kind: "destination";
  slug: string;
  tier: BeyondTier;
  title: string;
  engTitle: string;
  /** 州・地方名。カードに出す(例: 「バークシャー州」)。 */
  county: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  /** 判断材料。必須。冒頭に出す。 */
  verdict: BeyondVerdict;
  /** 行き方。必須。 */
  gettingThere: GettingThere;
  /** 現地での回り方。必須。 */
  onArrival: OnArrival;
  /** 宿と夜。tier: "weekender" の記事は必ず埋めること。 */
  stayAndNight?: StayAndNight;
  /** 見どころ。2〜5件。 */
  highlights: BeyondHighlight[];
  sections: BeyondSection[];
  /** 情報の基準時点。通常 RAIL_AS_OF を渡す。 */
  dataAsOf: string;
  /** ISO日付(YYYY-MM-DD)。通常 RAIL_UPDATED_AT を渡す。 */
  updatedAt: string;
  faq?: BeyondFaq[];
  sources?: BeyondSource[];
  relatedLinks?: BeyondRelatedLink[];
};

/**
 * 損益分岐。BritRail Pass 記事の中核。
 *
 * この記事の価値は紹介ではなく判定にある。
 * BritRail Pass は日本の代理店が熱心に売っているが、
 * 実際には多くの旅程で元が取れない。英国の Advance 切符が
 * 非常に安いためで、そこを書かずにパスを勧める記事が多い。
 *
 * verdict は必ず言い切ること。「人によります」で終わらせるなら
 * この記事を書く意味がない。
 */
export type BreakEven = {
  /** 何と比べるのか。比較の前提を1〜2文で。 */
  premise: string;
  /** 元が取れる条件。言い切る。 */
  verdict: string;
  /** 元が取れないケース。具体的に。 */
  whenNotWorth: string[];
};

export type RailHowToArticle = {
  kind: "railHowTo";
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  description: string;
  keywords: string[];
  mainText: string;
  atAGlance?: BeyondFact[];
  /** 損益分岐。BritRail のような「買うべきか」記事は必ず持つ。 */
  breakEven?: BreakEven;
  sections: BeyondSection[];
  dataAsOf: string;
  updatedAt: string;
  faq?: BeyondFaq[];
  sources?: BeyondSource[];
  relatedLinks?: BeyondRelatedLink[];
};

export type BeyondArticle = DestinationArticle | RailHowToArticle;

/** 表示側の分岐用。 */
export function isDestination(a: BeyondArticle): a is DestinationArticle {
  return a.kind === "destination";
}
