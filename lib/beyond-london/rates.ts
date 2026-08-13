/**
 * ロンドン外への鉄道移動に関わる料金・制度を一元管理する。
 *
 * なぜ lib/transport/rates.ts と分けるか:
 * あちらは TfL(ロンドン市内)の運賃で、改定は毎年3月・バスのみ11月。
 * こちらは National Rail の全国運賃と BritRail Pass で、
 *
 *   - National Rail の運賃改定は例年3月上旬(TfL とは別枠・別告知)
 *   - BritRail Pass は非居住者向け商品で、販売元・購入通貨ごとに
 *     価格が違い、為替と代理店の都合で動く
 *
 * と、追随すべき対象がまったく違う。同居させると片方を更新したときに
 * もう片方の AS_OF が黙って嘘になる。
 *
 * 依存の向き:
 * このファイルは lib/transport/rates.ts を参照してよいが、逆は禁止。
 * ロンドン市内の記事が全国運賃に依存し始めると、TfL の改定作業のたびに
 * こちらまで確認が必要になる。
 *
 * 運用ルール(lib/transport/rates.ts と同じ):
 * 1. 記事から金額を書くときは必ずここを参照する。
 * 2. 改定時はこのファイルと RAIL_AS_OF / RAIL_UPDATED_AT だけを更新する。
 * 3. 出典は RAIL_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 *
 * 2026年8月13日に nationalrail.co.uk・britrail.com・railcard.co.uk で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const RAIL_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const RAIL_UPDATED_AT = "2026-08-13";

/* -----------------------------------------------------
   切符の種類
   出典: National Rail – Buying a ticket / Ticket types

   英国の運賃で日本人がいちばん誤解するのは「早く買うと安い」の
   程度で、Advance と Anytime は同じ区間で3〜4倍違う。
   ここを知らないまま当日券を買う人が、BritRail Pass の
   損得計算も間違える。
----------------------------------------------------- */

export type TicketTypeKey = "advance" | "offPeak" | "superOffPeak" | "anytime";

export const TICKET_TYPES = {
  /**
   * 列車指定の割引券。枚数限定・先着順。
   * 「乗り遅れたら無効」が最大の落とし穴。
   */
  advance: {
    label: "Advance",
    jpLabel: "アドバンス（列車指定）",
    flexibility: "指定した日付・列車のみ有効",
    refundable: false,
    /** 変更は可能だが手数料と差額がかかる。払い戻しは不可。 */
    changeable: true,
  },
  offPeak: {
    label: "Off-Peak",
    jpLabel: "オフピーク",
    flexibility: "オフピーク時間帯の任意の列車",
    refundable: true,
    changeable: true,
  },
  superOffPeak: {
    label: "Super Off-Peak",
    jpLabel: "スーパーオフピーク",
    flexibility: "さらに時間帯が絞られる。路線により設定がない",
    refundable: true,
    changeable: true,
  },
  anytime: {
    label: "Anytime",
    jpLabel: "エニータイム",
    flexibility: "時間帯の制限なし。最も高い",
    refundable: true,
    changeable: true,
  },
} as const satisfies Record<TicketTypeKey, unknown>;

/**
 * オフピークの開始時刻。
 *
 * TfL のピーク/オフピーク(lib/transport/rates.ts の PEAK_HOURS)とは
 * 別の制度なので、混同しないこと。全国運賃のオフピークは
 * 「都市部は9:30、それ以外は9:00」から。
 *
 * 夕方の帰宅ラッシュにも制限がかかる路線があるが、区間ごとに
 * 制限コードが違うので一律の時刻を書けない。記事では
 * 「夕方にも制限がある場合がある」と書き、Ticket Validity Finder に送る。
 */
export const OFF_PEAK_START = {
  /** 都市・大きな町を発着する場合。 */
  cities: "9:30",
  /** それ以外。 */
  elsewhere: "9:00",
  /** 土日・祝日は終日オフピーク。 */
  weekendsAllDay: true,
} as const;

/**
 * 予約可能になる時期。
 *
 * 「12週間前」が原則だが、事業者によって大きく違う。
 * ロンドンからの主要路線(LNER・GWR)は例外的に長いことがあるので、
 * 記事では「原則12週間前、ただし事業者による」と書く。
 */
export const BOOKING_HORIZON = {
  /** 原則。ダイヤが確定する時期。 */
  standardWeeks: 12,
  /** 12ヶ月前から買える例外(Caledonian Sleeper・Heathrow Express)。 */
  longHorizonOperators: ["Caledonian Sleeper", "Heathrow Express"],
} as const;

/* -----------------------------------------------------
   Railcard
   出典: railcard.co.uk

   価格は lib/transport/rates.ts の RAILCARD と同額(£35)だが、
   あちらは「Oyster に紐付けてロンドン市内の PAYG を1/3引きにする」
   文脈で持っている。こちらは全国の Advance / Off-Peak にかかる割引。
   同じカードの別の使い道なので、値は重複して持たず参照する。
----------------------------------------------------- */

export { RAILCARD } from "@/lib/transport/rates";

/**
 * 2人で使う Railcard。ロンドン発の日帰りは2人以上が多いので、
 * 目的地記事の railcardNote から参照する。
 */
export const TWO_TOGETHER = {
  label: "Two Together Railcard",
  annual: 35,
  /** 2人が「一緒に移動するとき」だけ有効。単独では使えない。 */
  requiresBothTravelling: true,
  discountRate: "1/3",
} as const;

/* -----------------------------------------------------
   BritRail Pass
   出典: britrail.com

   重要な前提(日本語圏で最も誤解されている点):
   1. 英国に6ヶ月以上居住している人は購入不可(非居住者専用)
   2. 発券から11ヶ月以内に使い始める必要がある
   3. 座席指定は含まれない。指定が必須の列車では別途手数料
   4. ロンドン地下鉄では使えない

   価格について:
   BritRail は販売代理店ごとに価格と通貨が違う(円建て・ドル建て・
   ポンド建てが混在する)。したがって「正確な一覧」をこのファイルに
   持つことはできないし、持つべきでもない。持つと必ず古くなる。
   記事では「日数と券種の考え方」と「損益分岐の判断基準」を示し、
   実額は公式サイトで確認させる。
----------------------------------------------------- */

export const BRITRAIL = {
  /** 連続日数券。初日から数えて連続した日数ぶん乗り放題。 */
  consecutiveDayOptions: [3, 4, 8, 15, 22] as const,
  /** 1ヶ月以内の任意の日を選んで使う券。 */
  flexiDayOptions: [3, 4, 8, 15] as const,
  /** Flexi の「任意の日」を選べる期間。 */
  flexiWindowDays: 30,
  /** 英国居住者が購入資格を失う居住期間。 */
  ineligibleAfterMonthsResident: 6,
  /** 発券から使い始めるまでの猶予。 */
  validateWithinMonths: 11,
  /** 座席指定は別料金。パスは「乗車権」であって座席保証ではない。 */
  seatReservationIncluded: false,
  /** ロンドン地下鉄では使えない。 */
  validOnLondonUnderground: false,
  /**
   * ロンドンを横断するのに使える National Rail 系の路線。
   * 「ロンドンで一切使えない」は誤り。ここを間違えると
   * 読者が余計な切符を買う。
   */
  validLondonLines: ["エリザベス・ライン", "テムズリンク", "ロンドン・オーバーグラウンド"],
} as const;

/**
 * 割引区分。代理店により率が前後するので「目安」であることを
 * 記事側で明示すること。
 */
export const BRITRAIL_DISCOUNTS = {
  youth: { label: "Youth（16〜25歳）", approxOff: "最大20%" },
  senior: { label: "Senior（60歳以上）", approxOff: "最大15%" },
  /** 大人1名につき子ども1名(5〜15歳)が無料になる設定。 */
  childFreeWithAdult: true,
} as const;

/* -----------------------------------------------------
   損益分岐の基準線

   BritRail Pass の記事の核心。
   パスの価格は動くが、「何と比べるべきか」の構造は動かないので、
   比較の枠組みだけをここに持つ。
----------------------------------------------------- */

/**
 * ロンドン発の代表的な長距離ルート。
 *
 * Advance の実勢価格は日々変動するため、金額は持たない。
 * 「早期予約でどのくらいまで下がるか」の桁感だけを持ち、
 * 記事では必ず「実額は各社サイトで確認」と添える。
 */
export const LONG_DISTANCE_ROUTES = [
  {
    to: "エディンバラ",
    operator: "LNER",
    fromStation: "キングス・クロス",
    journeyTime: "約4時間20分",
    /** Advance の最安帯の桁感。断定を避けるため「〜台」で持つ。 */
    advanceFromBand: "£30台",
    anytimeBand: "£150以上",
  },
  {
    to: "ヨーク",
    operator: "LNER",
    fromStation: "キングス・クロス",
    journeyTime: "約2時間",
    advanceFromBand: "£20台",
    anytimeBand: "£100以上",
  },
  {
    to: "バース",
    operator: "GWR",
    fromStation: "パディントン",
    journeyTime: "約1時間30分",
    advanceFromBand: "£20台",
    anytimeBand: "£60以上",
  },
] as const;

/* -----------------------------------------------------
   行き先の入場料

   ロンドン市内のスポットは DB の Attraction が料金を持つが、
   ロンドン外は DB に載せていない(観光スポット一覧・地図・
   エリア付与のすべてがロンドン前提で組まれているため)。
   そこで、記事から参照する最小限の金額だけをここに持つ。

   方針:
   1. 「事前購入と当日購入で差がある」施設は、その差を持つ。
      日帰りで最も効く節約がここだから。
   2. 開館曜日は持たない。季節・王室行事・大学の学期で動き、
      このファイルの更新頻度では追随できない。記事では
      「行く前に公式で確認」と書き、曜日を断定しないこと。
      特にウィンザー城は休館曜日が資料によって食い違うので、
      断定して書かない。
   3. 金額は目安。改定されるので、記事側は RAIL_AS_OF を
      dataAsOf に渡して鮮度バッジを必ず出すこと。
----------------------------------------------------- */

export const ADMISSIONS = {
  windsorCastle: {
    label: "ウィンザー城",
    /** 事前購入。 */
    advance: 32,
    /** 当日窓口。事前購入との差が大きいので両方持つ。 */
    onTheDay: 36,
    /** 公式。料金と開館日はここで確認させる。 */
    official: "https://www.rct.uk/visit/windsor-castle",
  },
  christChurch: {
    label: "クライスト・チャーチ（オックスフォード）",
    /** 季節と曜日で動くため幅で持つ。 */
    fromApprox: 22.5,
    toApprox: 24.5,
    official: "https://www.chch.ox.ac.uk/visit-us",
  },
  romanBaths: {
    label: "ローマ浴場（バース）",
    /** 曜日・季節で変動が大きい施設。幅で持つ。 */
    fromApprox: 22,
    toApprox: 28,
    official: "https://www.romanbaths.co.uk/",
  },
  stonehenge: {
    label: "ストーンヘンジ",
    fromApprox: 25,
    toApprox: 30,
    official: "https://www.english-heritage.org.uk/visit/places/stonehenge/",
  },
  canterburyCathedral: {
    label: "カンタベリー大聖堂",
    fromApprox: 17,
    toApprox: 19,
    official: "https://www.canterbury-cathedral.org/visit/",
  },
  royalPavilion: {
    label: "ロイヤル・パビリオン（ブライトン）",
    fromApprox: 17,
    toApprox: 19,
    official: "https://brightonmuseums.org.uk/visit/royal-pavilion-garden/",
  },
} as const;

/* -----------------------------------------------------
   表示ヘルパー
----------------------------------------------------- */

/**
 * 金額と日付の表示。
 *
 * 表示規則(端数のない金額に .00 を付けない)はサイト全体で同じなので、
 * lib/transport/rates.ts の実装をそのまま再輸出する。
 * ここで独自実装を持つと、£表記の揺れが記事間で出る。
 *
 * 記事側は `@/lib/beyond-london/rates` から import すること。
 * 目的地記事が transport のモジュールを直接触ると、依存の向きが
 * 曖昧になる(このファイル冒頭の「逆は禁止」が守れなくなる)。
 */
import { gbp } from "@/lib/transport/rates";

export { gbp, jpDate } from "@/lib/transport/rates";

/**
 * 幅のある入場料の表示(例: 「£22〜£28」)。
 *
 * ロンドン外の施設は曜日・季節で料金が動くものが多く、
 * 単一の金額を書くと必ずどこかで嘘になる。幅で示して
 * 「行く前に公式で確認」と添えるのが、このセクションの原則。
 */
export function gbpRange(row: {
  fromApprox: number;
  toApprox: number;
}): string {
  return `${gbp(row.fromApprox)}〜${gbp(row.toApprox)}`;
}

/* -----------------------------------------------------
   出典
----------------------------------------------------- */

export const NATIONAL_RAIL_TICKETS_SOURCE = {
  label: "National Rail – Buying a ticket（券種の公式説明）",
  url: "https://www.nationalrail.co.uk/tickets-railcards-and-offers/buying-a-ticket/",
};

export const BRITRAIL_ELIGIBILITY_SOURCE = {
  label: "BritRail – Eligibility & Conditions of Use（購入資格・座席指定の公式規定）",
  url: "https://www.britrail.com/britrail-passes/eligibility-conditions-of-use/",
};

export const RAIL_SOURCES = [
  NATIONAL_RAIL_TICKETS_SOURCE,
  {
    label: "National Rail – Off-Peak and Super Off-Peak tickets",
    url: "https://www.nationalrail.co.uk/tickets-railcards-and-offers/ticket-types/off-peak-and-super-off-peak-tickets/",
  },
  {
    label: "National Rail – Advance booking dates（予約開始時期）",
    url: "https://www.nationalrail.co.uk/travel-information/advance-booking-dates/",
  },
  BRITRAIL_ELIGIBILITY_SOURCE,
  {
    label: "BritRail – 公式トップ（券種と価格）",
    url: "https://www.britrail.com/",
  },
  {
    label: "Railcard – 公式（1/3割引の対象と価格）",
    url: "https://www.railcard.co.uk/",
  },
];
