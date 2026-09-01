/**
 * 旅行者の予算(/sightseeing/budget)で積算に使う金額を一元管理する。
 *
 * なぜ定数にするか:
 * 予算記事は数字がすべてで、1つでも古いと合計が狂い、記事全体の信頼が
 * 落ちる。しかも積算表・内訳・FAQ で同じ金額が何度も出てくるため、
 * 本文にべた書きすると改定のたびに1本の記事の中で取りこぼす。
 *
 * 交通費は lib/transport/rates.ts、食費は lib/food/prices.ts から引く。
 * ここに重複して持たないこと。ここが持つのは、
 * 「他のどのファイルにも無い、予算積算のためだけの数字」だけ。
 *
 * 入場料を Attraction テーブルから引かない理由:
 * priceAdult が「大人£33、18〜24歳£21.50」のような日本語の散文で、
 * 数値として合算できない。ここでは代表的な施設だけを数値で持つ。
 *
 * 運用ルール:
 * 1. 記事から金額を書くときは必ずここを参照する(`gbp(ADMISSIONS.towerOfLondon)` の形)。
 * 2. 改定時はこのファイルと BUDGET_AS_OF / BUDGET_UPDATED_AT だけを更新する。
 * 3. 為替レートは絶対に書かない。書いた瞬間に古くなり、読者が誤った
 *    予算を立てる原因になる(travel-tips と同じ方針)。
 *
 * 金額はすべて GBP。2026年8月13日時点。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const BUDGET_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const BUDGET_UPDATED_AT = "2026-08-13";

/** 積算の前提となる日数。7日間=6泊8日ではなく「7泊」で数える。 */
export const TRIP_NIGHTS = 7;

/* -----------------------------------------------------
   宿泊
   1泊あたりの目安。ロンドンは季節変動が大きいため必ず幅で持つ。
----------------------------------------------------- */

export type LodgingRow = {
  label: string;
  /** 1泊あたりの下限。 */
  min: number;
  /** 1泊あたりの上限。 */
  max: number;
  note: string;
};

export const LODGING: Record<string, LodgingRow> = {
  hostelDorm: {
    label: "ホステルのドミトリー",
    min: 25,
    max: 45,
    note: "1ベッド。ロッカーとタオルは別料金のことがある",
  },
  budgetHotel: {
    label: "格安チェーン(Premier Inn、Travelodge、ibis)",
    min: 80,
    max: 150,
    note: "1室。早期予約と曜日で倍近く動く",
  },
  midRange: {
    label: "中級ホテル(3〜4つ星)",
    min: 150,
    max: 260,
    note: "1室。ゾーン1の立地でこの帯",
  },
  apartment: {
    label: "アパートメント/Airbnb",
    min: 120,
    max: 220,
    note: "1室。自炊できるぶん食費が下がる",
  },
} as const;

/* -----------------------------------------------------
   食費
   1日あたり。金額の実体(Meal Deal 価格など)は lib/food/prices.ts。
   ここが持つのは「1日3食を組んだときの合計の目安」。
----------------------------------------------------- */

export type FoodDayRow = {
  label: string;
  perDay: number;
  note: string;
};

export const FOOD_PER_DAY: Record<string, FoodDayRow> = {
  thrifty: {
    label: "徹底的に抑える",
    perDay: 15,
    note: "スーパーの Meal Deal 中心、夜は自炊かテイクアウェイ",
  },
  standard: {
    label: "標準",
    perDay: 35,
    note: "昼は Meal Deal かカフェ、夜はパブかカジュアルな店で1杯つき",
  },
  comfortable: {
    label: "ゆとり",
    perDay: 70,
    note: "1日1回はきちんとしたレストラン。アフタヌーンティーは別枠",
  },
} as const;

/* -----------------------------------------------------
   入場料
   代表的な有料施設のみ。大人1名・当日窓口の目安。
   オンライン事前購入で安くなる施設が多いため、記事では必ずその旨を書く。
----------------------------------------------------- */

/**
 * 入場料だけの基準時点。BUDGET_AS_OF とは別に持つ。
 *
 * 宿・食・交通と改定周期が違ううえ、/sightseeing/passes の損益計算が
 * この数値に全面的に乗っている。入場料だけを直したときに、検算していない
 * 宿代まで「最新」と名乗ってしまうのを避けるために分けてある。
 */
export const ADMISSIONS_AS_OF = "2026年9月";

export const ADMISSIONS = {
  towerOfLondon: 37,
  westminsterAbbey: 31,
  stPaulsCathedral: 27,
  londonEye: 29,
  churchillWarRooms: 33,
  kewGardens: 22,
  windsorCastle: 36,
  towerBridge: 18,
  shardView: 32,
  /** ワーナー・ブラザース スタジオツアー(ハリー・ポッター)。要事前予約。 */
  harryPotterStudio: 53.5,
} as const;

/**
 * 無料の主要施設。予算を組むうえでの「効く事実」なので数値と並べて出す。
 * 大英博物館などの寄付は任意(£5 が推奨額として掲示されることが多い)。
 */
export const FREE_HIGHLIGHTS = [
  "大英博物館",
  "ナショナル・ギャラリー",
  "テート・モダン",
  "自然史博物館",
  "科学博物館",
  "V&A(ヴィクトリア&アルバート博物館)",
  "国立肖像画美術館",
  "大英図書館",
] as const;

/** 任意寄付として掲示されることが多い額。義務ではない。 */
export const SUGGESTED_DONATION = 5;

/* -----------------------------------------------------
   そのほかの費用
----------------------------------------------------- */

export const EXTRAS = {
  /** ウェスト・エンドのミュージカル。席種で大きく動く。 */
  musicalCheap: 25,
  musicalMid: 75,
  musicalPremium: 150,
  /** アフタヌーンティー1名。ホテル系は上限がもっと上。 */
  afternoonTeaFrom: 45,
  /** パブのビール1パイント(ゾーン1)。 */
  pintZone1: 7,
  /** カフェのフラットホワイト1杯。 */
  coffee: 4,
  /** 土産の目安(1週間ぶんの総額)。 */
  souvenirsTypical: 100,
  /** 海外旅行保険(7日間・1名の目安)。円建ての商品なので幅で持つ。 */
  insuranceNote: "日本で加入。7日間で3,000〜8,000円程度が目安",
} as const;

/**
 * 予算帯ごとの合計。
 *
 * ここは「計算した答え」ではなく「積算の入力」にする。
 * models セクションの表は、この tripTotal から1日あたりを割り戻して出す。
 * 逆向き(1日あたりを決め打ちして×7)にすると、表の内訳の合計と
 * 総額がずれる。予算記事でこれをやると記事全体が信用を失う。
 *
 * tripTotal は下記の内訳の実際の和。内訳を変えたら必ずここも引き直すこと。
 * 自動計算にしないのは、宿が1室あたり・食費が1名あたりで割り勘の
 * 前提が違い、機械的に足すと嘘になるため。
 */
export const DAILY_TOTALS = {
  /** 宿175 + 食105 + 交通56.5 + 入場0 */
  thrifty: { label: "節約", tripTotal: 336.5 },
  /** 宿280 + 食245 + 交通56.5 + 入場90 + ミュージカル75 */
  standard: { label: "標準", tripTotal: 746.5 },
  /** 宿525 + 食490 + 交通75.7 + 入場200 + 観劇等195 */
  comfortable: { label: "ゆとり", tripTotal: 1485.7 },
} as const;

/** 総額から1日あたりを割り戻す。端数は£1単位に丸める。 */
export function perDay(tripTotal: number): number {
  return Math.round(tripTotal / TRIP_NIGHTS);
}

/** 金額を £ 表記にする。lib/food/prices.ts の gbp と同じ挙動。 */
export function gbp(amount: number): string {
  const hasFraction = !Number.isInteger(amount);
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** 1泊あたりの幅を「£80〜£150」の形にする。 */
export function gbpRange(row: { min: number; max: number }): string {
  return `${gbp(row.min)}〜${gbp(row.max)}`;
}

/** 7泊ぶんの宿泊費の幅。 */
export function lodgingTotal(row: { min: number; max: number }): string {
  return `${gbp(row.min * TRIP_NIGHTS)}〜${gbp(row.max * TRIP_NIGHTS)}`;
}

/** 出典。裏取りせずに数値を書き換えないこと。 */
export const BUDGET_SOURCES = [
  {
    label: "Historic Royal Palaces — Tower of London の料金",
    url: "https://www.hrp.org.uk/tower-of-london/prices-and-opening-times/",
  },
  {
    label: "Westminster Abbey — 拝観料",
    url: "https://www.westminster-abbey.org/visit-us/prices-and-entry-times",
  },
  {
    label: "TfL — Fares(運賃と上限額)",
    url: "https://tfl.gov.uk/fares/",
  },
  {
    label: "Warner Bros. Studio Tour London — チケット",
    url: "https://www.wbstudiotour.co.uk/tickets-and-prices/",
  },
] as const;
