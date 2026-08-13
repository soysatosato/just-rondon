/**
 * ロンドンの交通に関わる料金・上限・規制値を一元管理する。
 *
 * なぜ定数にするか:
 * TfL の運賃は毎年3月に改定され、バス運賃だけは市長の凍結措置で別スケジュール
 * (2026年は11月1日改定)で動く。加えて Congestion Charge は2026年1月2日に
 * £15→£18 かつ EV の全額免除が廃止された。これらを各記事に直接書くと、
 * 次の改定のたびに全記事を grep して回ることになり、必ず取りこぼす。
 *
 * 運用ルール:
 * 1. 記事から金額を書くときは必ずここを参照する(`gbp(CAPS.zone1to2.daily)` の形)。
 * 2. 改定時はこのファイルと TRANSPORT_AS_OF / TRANSPORT_UPDATED_AT だけを更新する。
 * 3. 出典は TRANSPORT_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 *
 * 金額はすべて GBP。2026年8月8日に tfl.gov.uk・gov.uk で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const TRANSPORT_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const TRANSPORT_UPDATED_AT = "2026-08-08";

/**
 * 制度・運賃改定の日付。
 *
 * 「いつ変わるか」を記事に書けないと、読者は古い金額のまま予算を組む。
 * 特にバス運賃の11月改定と Congestion Charge の1月改定は、
 * 日本語の情報がほぼ追随していない。
 */
export const TRANSPORT_KEY_DATES = {
  /** 地下鉄・鉄道の単発運賃が改定された日(毎年3月)。 */
  fareRevision: "2026-03-01",
  /** 1日・週の上限額と Travelcard 価格が据え置かれる期限。 */
  capsFrozenUntil: "2027年3月",
  /** バス・トラム運賃の凍結が解除され値上げされる日。 */
  busFareRise: "2026-11-01",
  /** Congestion Charge が £15→£18 になり、EV の全額免除が終わった日。 */
  congestionChargeRevision: "2026-01-02",
  /** EV 割引率が次に下がる予定日。 */
  congestionChargeEvStep2: "2030-03-04",
  /** レンタル電動キックボードの試験運行が認められている期限。 */
  eScooterTrialUntil: "2028年5月",
} as const;

/* -----------------------------------------------------
   支払い方法
----------------------------------------------------- */

export const PAYMENT = {
  /** Oyster カードの発行手数料。2022年9月以降は返金されない「購入代金」。 */
  oysterCardFee: 7,
  /** Oyster 購入代金のうち、初期チャージとして使える分。 */
  oysterInitialCredit: 2,
  /** 券売機でその場で返金を受けられる残高の上限。 */
  oysterInstantRefundLimit: 10,
} as const;

/** TfL のタッチ決済が受け付ける国際ブランド。JCB は含まれない。 */
export const CONTACTLESS_BRANDS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Maestro",
] as const;

/**
 * ピーク時間帯。
 * 平日のみで、土日祝は終日オフピーク。
 */
export const PEAK_HOURS = {
  morning: "06:30〜09:30",
  evening: "16:00〜19:00",
} as const;

/* -----------------------------------------------------
   タッチ決済・Oyster の上限額(大人)
   出典: TfL "Adult rate prices 2026"
----------------------------------------------------- */

export type CapRow = {
  /** 1日上限(ピーク)。 */
  daily: number;
  /** 1日上限(オフピーク)。Zone 1-6 までは daily と同額。 */
  dailyOffPeak: number;
  /** 月曜〜日曜の上限。タッチ決済のみ(Oyster の PAYG には適用されない)。 */
  weekly: number;
};

export const CAPS: Record<string, CapRow> = {
  zone1: { daily: 8.9, dailyOffPeak: 8.9, weekly: 44.7 },
  zone1to2: { daily: 8.9, dailyOffPeak: 8.9, weekly: 44.7 },
  zone1to3: { daily: 10.5, dailyOffPeak: 10.5, weekly: 52.5 },
  zone1to4: { daily: 12.8, dailyOffPeak: 12.8, weekly: 64.2 },
  zone1to5: { daily: 15.3, dailyOffPeak: 15.3, weekly: 76.4 },
  zone1to6: { daily: 16.3, dailyOffPeak: 16.3, weekly: 81.6 },
} as const;

/* -----------------------------------------------------
   Travelcard(定期券)
   出典: TfL "Adult rate prices 2026"

   7 Day の価格は週の上限額と完全に一致する。
   つまり通勤者にとっての分岐点は「7 Day を買うか」ではなく
   「Monthly / Annual に上げるか」になる。
----------------------------------------------------- */

export type TravelcardRow = {
  weekly: number;
  monthly: number;
  annual: number;
};

export const TRAVELCARD: Record<string, TravelcardRow> = {
  zone1to2: { weekly: 44.7, monthly: 171.7, annual: 1788 },
  zone1to3: { weekly: 52.5, monthly: 201.6, annual: 2100 },
  zone1to4: { weekly: 64.2, monthly: 246.6, annual: 2568 },
  zone1to5: { weekly: 76.4, monthly: 293.4, annual: 3056 },
  zone1to6: { weekly: 81.6, monthly: 313.4, annual: 3264 },
} as const;

/** Zone 1 を通らない区間の Travelcard。郊外どうしの通勤で効く。 */
export const TRAVELCARD_OUTER: Record<string, TravelcardRow> = {
  zone2to3: { weekly: 33.5, monthly: 128.7, annual: 1340 },
  zone2to4: { weekly: 37.1, monthly: 142.5, annual: 1484 },
  zone2to6: { weekly: 55.9, monthly: 214.7, annual: 2236 },
  zone3to6: { weekly: 44.5, monthly: 170.9, annual: 1780 },
} as const;

/** 1日券。上限額があるので旅行者が買う理由はほぼない。 */
export const DAY_TRAVELCARD = {
  zone1to4Anytime: 16.6,
  zone1to6Anytime: 23.6,
  offPeakAll: 16.6,
} as const;

/* -----------------------------------------------------
   バス・トラム
----------------------------------------------------- */

export const BUS = {
  single: 1.75,
  dailyCap: 5.25,
  /** 月曜〜日曜の上限。7 Day Bus & Tram Pass と同額。 */
  weeklyCap: 24.7,
  pass7Day: 24.7,
  passMonthly: 94.9,
  /** ホッパー運賃。最初のタッチからこの分数以内は追加のバス・トラムが無料。 */
  hopperMinutes: 60,
  /** 2026年11月1日からの改定後の価格。 */
  from2026Nov: {
    single: 1.85,
    dailyCap: 5.55,
    pass7Day: 26.1,
    childSingle: 0.9,
  },
} as const;

/* -----------------------------------------------------
   空港アクセス
----------------------------------------------------- */

export const AIRPORTS = {
  heathrow: {
    /** ピカデリー線。Zone 1 から。 */
    piccadillyFromZone1: 5.9,
    /** エリザベス・ライン。Zone 1 から。2026年3月に12%上がった。 */
    elizabethFromZone1: 15.5,
    /** ヒースロー・エクスプレスの当日券。上限額の対象外。 */
    expressOnDay: 26,
    /** 同、30日以上前の予約の最安値。 */
    expressAdvanceFrom: 10,
    zone: 6,
  },
} as const;

/* -----------------------------------------------------
   Railcard
   出典: railcard.co.uk

   ロンドン在住者にとっての本命は「Oyster に紐付けてオフピークの
   PAYG 運賃と1日上限を1/3引きにする」使い方。
   タッチ決済には紐付けられない(2026年8月時点)。
----------------------------------------------------- */

export const RAILCARD = {
  annual: 35,
  threeYear: 80,
  disabledAnnual: 20,
  disabledThreeYear: 54,
  /** オフピークの PAYG 運賃・1日上限にかかる割引率。 */
  discountRate: "1/3",
  /** 3年券が選べる種類。26-30 / Two Together / Network は1年のみ。 */
  threeYearEligible: ["16-25", "Senior", "Family & Friends"],
} as const;

/* -----------------------------------------------------
   シェアサイクル(ドック式)
   出典: TfL Santander Cycles
----------------------------------------------------- */

export const SANTANDER = {
  singleClassic: 1.65,
  singleClassicMinutes: 30,
  singleEbike: 3,
  singleEbikeMinutes: 30,
  dayPass: 3.5,
  /** Day Pass / 年間会員で1回あたり無料になる時間。2025年4月に30分から倍増した。 */
  passRideMinutes: 60,
  /** Day Pass / 年間会員で e-bike に乗るときの1回あたりの追加料金。 */
  ebikeSurcharge: 1,
  monthly: 20,
  annual: 120,
  /** 超過1時間ごと(クラシック)。 */
  overtimeClassicPerHour: 1.65,
  /** 超過1時間ごと(e-bike)。 */
  overtimeEbikePerHour: 3,
  /** 24時間以内に返却しなかった場合などの上限請求額。 */
  nonReturnCharge: 300,
} as const;

/* -----------------------------------------------------
   シェアサイクル(ドックレス)
   Lime / Forest。料金はキャンペーンと自治体ごとの上限で動くので
   「おおよそ」であることを記事側で明示すること。
----------------------------------------------------- */

export const DOCKLESS = {
  lime: {
    unlock: 1,
    perMinuteApprox: 0.3,
    /** LimePrime。定額でアンロック無料＋割安な分単価になる。 */
    primeMonthly: 6.99,
    primeFlatFare: 1.7,
    primeFlatMinutes: 20,
  },
  forest: {
    unlock: 1,
    perMinute: 0.29,
    /** 毎日リセットされる無料時間。 */
    freeMinutesDaily: 10,
  },
} as const;

/* -----------------------------------------------------
   自転車を買う
----------------------------------------------------- */

export const OWN_BIKE = {
  /** Cycle to Work(給与天引き)の実質割引率。 */
  cycleToWorkBasicRateSaving: "28%",
  cycleToWorkHigherRateSaving: "42%",
  cycleToWorkAdditionalRateSaving: "47%",
  /** ロンドンで年間に盗まれる自転車の推計台数。 */
  annualTheftsEstimate: 40000,
  /** 盗難のうち路上で起きる割合。 */
  streetTheftShare: "51%",
  /** 自治体の bike hangar(路上の施錠式駐輪庫)の年会費の目安。 */
  hangarAnnualFrom: 40,
  /** bike hangar の待機者数(ロンドン全体)。 */
  hangarWaitingList: 68000,
} as const;

/* -----------------------------------------------------
   車・バイクを持つ
   出典: TfL(Congestion Charge / ULEZ)、GOV.UK(MOT / VED / 免許)
----------------------------------------------------- */

export const DRIVING = {
  /** Congestion Charge。2026年1月2日に £15 から上がった。 */
  congestionCharge: 18,
  /** 走行日から3日目の深夜までに払う場合の割増額。 */
  congestionChargeLate: 21,
  congestionChargeHours: "平日07:00〜18:00／土日祝12:00〜18:00",
  /** クリスマスから元日の祝日までは課金されない。 */
  congestionChargeFreePeriod: "12月25日〜元日の銀行休業日",
  /** EV の割引率(Auto Pay 登録が条件)。乗用車。 */
  evCarDiscountPercent: 25,
  /** 同、バン・HGV・四輪駆動小型車。 */
  evVanDiscountPercent: 50,
  /** 割引後の EV 乗用車の1日あたりの負担。 */
  evCarDaily: 13.5,
  /** 居住者割引の割引率。ゾーン内に住んでいる場合のみ。 */
  residentDiscountPercent: 90,

  /** ULEZ。基準を満たさない車・バイクのみ課金される。 */
  ulezDaily: 12.5,
  ulezHours: "24時間365日(12月25日を除く)",
  /** ULEZ の基準。これを満たしていれば課金されない。 */
  ulezPetrolStandard: "Euro 4(おおむね2006年以降のガソリン車)",
  ulezDieselStandard: "Euro 6(おおむね2015年以降のディーゼル車)",
  ulezMotorcycleStandard: "Euro 3(おおむね2007年7月以降のバイク)",

  /** Congestion Charge / ULEZ の違反金。14日以内なら半額。 */
  penalty: 180,
  penaltyEarly: 90,
  /** 28日を過ぎると50%増しになる。 */
  penaltyCertificate: 270,

  /** MOT(車検)の法定上限額。乗用車。初回登録から3年後以降、毎年。 */
  motMaxFee: 54.85,
  motFirstAfterYears: 3,
  /** VED(自動車税)の標準税率。2017年4月以降登録の車。 */
  vedStandard: 200,
  /** 新車価格が £40,000 を超える車にかかる追加税率の上限。 */
  vedExpensiveMax: 640,

  /** 任意保険の年額の目安(経験のあるドライバー)。 */
  insuranceTypicalLow: 600,
  insuranceTypicalHigh: 1200,
  /** 維持費の年間合計の目安(購入費を除く)。 */
  runningCostLow: 3400,
  runningCostHigh: 5000,

  /** 日本の免許で運転できる期間(英国居住者になってから)。 */
  foreignLicenceMonths: 12,
  /** 英国免許への切り替え申請ができる期限(居住者になってから)。 */
  exchangeWithinYears: 5,
  /** D1 での切り替え手数料。 */
  licenceExchangeFee: 43,
} as const;

/* -----------------------------------------------------
   ヘルパー
----------------------------------------------------- */

/**
 * 金額の表示。
 * 端数のない金額に .00 を付けない(£18.00 ではなく £18)。
 * TfL の表記に合わせる。
 */
export function gbp(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const body = Number.isInteger(rounded)
    ? rounded.toLocaleString("en-GB")
    : rounded.toFixed(2);
  return `£${body}`;
}

/**
 * 週上限で1年間払い続けた場合の総額。
 * Annual Travelcard の損得を判断する基準線になる。
 */
export function annualAtWeeklyCap(weeklyCap: number): number {
  return Math.round(weeklyCap * 52);
}

/** Annual Travelcard が週上限に対して何%安いか。 */
export function annualSavingPercent(zone: keyof typeof TRAVELCARD): number {
  const card = TRAVELCARD[zone];
  const atCap = annualAtWeeklyCap(card.weekly);
  return Math.round(((atCap - card.annual) / atCap) * 100);
}

/** Annual Travelcard を買った場合の年間節約額。 */
export function annualSavingAmount(zone: keyof typeof TRAVELCARD): number {
  const card = TRAVELCARD[zone];
  return annualAtWeeklyCap(card.weekly) - card.annual;
}

/** ISO日付を日本語表記にする。 */
export function jpDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d ? `${Number(y)}年${Number(m)}月${Number(d)}日` : `${Number(y)}年${Number(m)}月`;
}

/* -----------------------------------------------------
   出典
----------------------------------------------------- */

export const TFL_FARES_SOURCE = {
  label: "TfL – Adult caps and Travelcard prices（上限額・定期券価格の公式PDF）",
  url: "https://content.tfl.gov.uk/adult-fares.pdf",
};

export const TRANSPORT_SOURCES = [
  { label: "TfL – Fares（運賃トップ / 公式）", url: "https://tfl.gov.uk/fares" },
  TFL_FARES_SOURCE,
  {
    label: "TfL – Status updates（運行状況・計画運休）",
    url: "https://tfl.gov.uk/tube-dlr-overground/status/",
  },
  {
    label: "TfL – Bus and tram fares",
    url: "https://tfl.gov.uk/fares/find-fares/bus-and-tram-fares",
  },
  {
    label: "TfL – Santander Cycles: what you pay",
    url: "https://tfl.gov.uk/modes/cycling/santander-cycles/what-you-pay",
  },
  {
    label: "TfL – Congestion Charge",
    url: "https://tfl.gov.uk/modes/driving/congestion-charge",
  },
  {
    label: "TfL – Ultra Low Emission Zone",
    url: "https://tfl.gov.uk/modes/driving/ultra-low-emission-zone",
  },
  {
    label: "GOV.UK – Exchange a foreign driving licence",
    url: "https://www.gov.uk/exchange-foreign-driving-licence",
  },
  { label: "Railcards – 公式", url: "https://www.railcard.co.uk/" },
] as const;
