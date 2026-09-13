/**
 * 光熱費・Council Tax・水道・TV Licence・通信契約に関わる数値を一元管理する。
 *
 * なぜ定数にするか:
 * このセクションの数字は改定の周期がばらばらで、しかも短い。
 *
 *   - ガス・電気の料金上限(price cap)  … Ofgem が3か月ごとに改定
 *   - Council Tax                        … 毎年4月1日。区ごとに違う
 *   - 水道                               … 毎年4月1日
 *   - TV Licence                         … 毎年4月1日(CPI連動)
 *   - 通信の自動補償額                   … 毎年4月1日(物価連動)
 *
 * 記事本文にべた書きすると、四半期ごとに7本を読み直すことになる。
 *
 * 運用ルール:
 * 1. 記事から数値を書くときは必ずここを参照する(`gbp(TV_LICENCE.annual)` の形)。
 * 2. 改定時はこのファイルと BILLS_AS_OF / BILLS_UPDATED_AT だけを更新する。
 *    price cap は ENERGY_CAP.period と nextChange も忘れずに書き換えること。
 * 3. 扱う制度はイングランドのもの。Council Tax の band の区切りと
 *    水道会社はスコットランド・ウェールズで違う。
 * 4. 事業者の料金プラン(月£◯◯のネット回線など)はここに持たない。
 *    公的機関か規制当局が公表する数字だけを持つ。
 *
 * 2026年9月13日に Ofgem・GOV.UK・MHCLG の統計・Thames Water・
 * Wandsworth 区の公表資料で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const BILLS_AS_OF = "2026年9月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const BILLS_UPDATED_AT = "2026-09-13";

/** 1か月の平均日数。日額の基本料金を月額に直すときに使う。 */
const DAYS_PER_MONTH = 365 / 12;

/**
 * ガス・電気の料金上限(Ofgem price cap)。
 *
 * 誤解の核心は「上限」という訳語にある。上限がかかっているのは
 * kWh あたりの単価と1日あたりの基本料金であって、請求額ではない。
 * 使えば使うだけ請求は増える。typicalAnnual は Ofgem が定める
 * 「典型的な使用量」の世帯で計算した参考値にすぎない。
 *
 * 単価はイングランド・スコットランド・ウェールズの平均、Direct Debit 払い。
 * 電気は2026年10月1日〜2027年3月31日の間 VAT 0%(政府の時限措置)、
 * ガスは VAT 5% 込み。
 */
export const ENERGY_CAP = {
  /** この単価が適用される期間。 */
  period: "2026年10月1日〜12月31日",
  /** 次の改定日。 */
  nextChange: "2027年1月1日",
  /** 典型的な使用量の世帯の年額(ガス＋電気、Direct Debit)。 */
  typicalAnnual: 1723,
  /** 直前の期間(2026年7〜9月)の同じ値。 */
  previousTypicalAnnual: 1663,
  changePercent: 4,
  electricity: {
    /** p/kWh */
    unitPence: 26.32,
    /** p/日 */
    standingPence: 54.83,
  },
  gas: {
    /** p/kWh(VAT 5% 込み) */
    unitPence: 7.97,
    /** p/日 */
    standingPence: 29.68,
  },
} as const;

/** 電気の VAT 撤廃(時限措置)。 */
export const ELECTRICITY_VAT_CUT = {
  from: "2026年10月1日",
  until: "2027年3月31日",
  /** 典型的な世帯の年間の節約額(政府発表)。 */
  typicalSaving: 45,
  /** 撤廃前の税率(%)。 */
  previousRatePercent: 5,
} as const;

/** 光熱費の支援制度。対象は資力調査のある給付の受給者に限られる。 */
export const WARM_HOME_DISCOUNT = {
  /** 電気代から差し引かれる額。 */
  amount: 150,
} as const;

/** ガス・電気の苦情を Energy Ombudsman に持ち込めるまでの期間(週)。 */
export const ENERGY_COMPLAINT_WEEKS = 8;

/**
 * Council Tax。
 *
 * band はイングランドでは1991年4月1日時点の評価額で決まっており、
 * いまの物件価格とは関係がない。各 band の税額は Band D に対する
 * 法定の比率で決まるので、区の Band D の額さえ分かれば全 band が出る。
 */
export const COUNCIL_TAX = {
  /** 年度。 */
  year: "2026/27",
  /** ロンドン全体の Band D 平均(年額、GLA 分を含む)。MHCLG 統計。 */
  londonBandD: 2068,
  /** 前年度からの上昇率(%)。 */
  londonChangePercent: 4.4,
  /** イングランド全体の Band D 平均(年額)。 */
  englandBandD: 2392,
  /** ロンドンで最も安い区の例。Wandsworth の Band D(年額)。 */
  cheapestBorough: { name: "Wandsworth", bandD: 1028.21 },
  /** 一人暮らし(または自分以外が全員 disregarded)の割引率(%)。 */
  singlePersonDiscountPercent: 25,
  /** 住人が全員 disregarded(学生以外の組み合わせ)のときの割引率(%)。 */
  allDisregardedDiscountPercent: 50,
  /** 標準の分割回数と、申し出れば選べる回数。 */
  defaultInstalments: 10,
  optionalInstalments: 12,
  /** 支払いが遅れたときの督促の猶予(日)。 */
  reminderDays: 7,
  /** フルタイム学生と認められる条件。 */
  student: { minCourseYears: 1, minHoursPerWeek: 21 },
} as const;

export type CouncilTaxBand = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

/**
 * Band ごとの Band D に対する比率と、1991年の評価額の区切り(イングランド)。
 * 比率は Local Government Finance Act 1992 で固定されている。
 */
export const COUNCIL_TAX_BANDS: {
  band: CouncilTaxBand;
  ratio: number;
  ratioLabel: string;
  valuation1991: string;
}[] = [
  { band: "A", ratio: 6 / 9, ratioLabel: "6/9", valuation1991: "£40,000以下" },
  { band: "B", ratio: 7 / 9, ratioLabel: "7/9", valuation1991: "£40,001〜£52,000" },
  { band: "C", ratio: 8 / 9, ratioLabel: "8/9", valuation1991: "£52,001〜£68,000" },
  { band: "D", ratio: 1, ratioLabel: "1", valuation1991: "£68,001〜£88,000" },
  { band: "E", ratio: 11 / 9, ratioLabel: "11/9", valuation1991: "£88,001〜£120,000" },
  { band: "F", ratio: 13 / 9, ratioLabel: "13/9", valuation1991: "£120,001〜£160,000" },
  { band: "G", ratio: 15 / 9, ratioLabel: "15/9", valuation1991: "£160,001〜£320,000" },
  { band: "H", ratio: 18 / 9, ratioLabel: "18/9", valuation1991: "£320,001以上" },
];

/**
 * 水道。
 *
 * ロンドンの大半は Thames Water。typicalAnnual は Thames Water 自身が
 * 「典型的な上下水道の利用者」として出す額で、Water UK の平均値(社会的
 * 料金の利用者を含むぶん低めに出る)とは定義が違う。記事では前者を使う。
 */
export const WATER = {
  year: "2026/27",
  company: "Thames Water",
  /** 典型的な上下水道の年額。 */
  typicalAnnual: 639,
  /** 前年度からの月あたりの増加。 */
  monthlyIncrease: 2,
  /** 入居の何日前から届け出られるか。 */
  notifyDaysBefore: 28,
} as const;

/** TV Licence。 */
export const TV_LICENCE = {
  /** カラーの年額。 */
  annual: 180,
  /** 白黒テレビだけの年額。 */
  blackAndWhite: 60.5,
  /** 現在の額が適用された日。 */
  since: "2026年4月1日",
  /** 月払い(Direct Debit)の2年目以降の月額。 */
  monthlyFromYearTwo: 15,
  /** 月払いの初年度は6か月で1年分を払うので、この月額になる。 */
  monthlyFirstYear: 30,
  /** 無許可で視聴したときの罰金の上限(イングランド・ウェールズ)。 */
  maxFine: 1000,
} as const;

/**
 * 通信(ネット回線・携帯)の規則。
 *
 * 数字ではなく「いつからの契約か」で権利が変わるのがこの分野の特徴。
 * 2025年1月17日より前に結んだ契約には、物価連動の値上げ条項が残っている。
 */
export const TELECOM = {
  /** 途中の値上げを「£いくら」で明記させる規則の施行日。 */
  poundsAndPenceRuleFrom: "2025年1月17日",
  /** 契約にない値上げを通知してから効力が出るまでの日数。この間は違約金なしで解約できる。 */
  priceRiseNoticeDays: 30,
  /** 苦情を ADR(第三者機関)に持ち込めるまでの期間(週)。 */
  complaintWeeks: 8,
  /** 乗り換え用コードを取るテキストの宛先。 */
  pacTextNumber: "65075",
  stacTextNumber: "75075",
} as const;

/**
 * ネット回線の自動補償(Ofcom の automatic compensation)。
 * 加盟している大手事業者なら、申し出なくても請求額から差し引かれる。
 */
export const BROADBAND_COMPENSATION = {
  since: "2026年4月1日",
  /** 故障の修理が遅れたとき(報告から2営業日を超えた日から、1日あたり)。 */
  delayedRepairPerDay: 10.34,
  /** 修理までの猶予(営業日)。 */
  repairGraceWorkingDays: 2,
  /** 技術者が約束の訪問に来なかったとき(1回あたり)。 */
  missedAppointment: 32.31,
  /** 約束の開通日に開通しなかったとき(1日あたり)。 */
  delayedStartPerDay: 6.46,
} as const;

/** ポンド表記。小数以下が .00 のときは省く。 */
export function gbp(value: number) {
  return `£${value.toFixed(2).replace(/\.00$/, "")}`;
}

/** ポンド表記(整数に丸める)。月割りの目安のように端数が意味を持たない額に使う。 */
export function gbpRound(value: number) {
  return `£${Math.round(value).toLocaleString("en-GB")}`;
}

/** 日額の基本料金(p/日)を月額(£)に直す。 */
export function standingChargePerMonth(pencePerDay: number) {
  return (pencePerDay * DAYS_PER_MONTH) / 100;
}

/** ガスと電気の基本料金だけで毎月いくらかかるか(£)。使用量ゼロでも発生する。 */
export const ENERGY_STANDING_PER_MONTH =
  standingChargePerMonth(ENERGY_CAP.electricity.standingPence) +
  standingChargePerMonth(ENERGY_CAP.gas.standingPence);

/**
 * 月の使用量(kWh)からガス・電気の月額(£)を出す。
 * 記事の計算例はすべてこれを通すこと。単価の改定に追随させるため。
 */
export function monthlyEnergyCost({
  electricityKwh,
  gasKwh,
}: {
  electricityKwh: number;
  gasKwh: number;
}) {
  const electricity =
    (electricityKwh * ENERGY_CAP.electricity.unitPence) / 100 +
    standingChargePerMonth(ENERGY_CAP.electricity.standingPence);
  const gas =
    gasKwh === 0
      ? 0
      : (gasKwh * ENERGY_CAP.gas.unitPence) / 100 +
        standingChargePerMonth(ENERGY_CAP.gas.standingPence);
  return { electricity, gas, total: electricity + gas };
}

/** ロンドン平均の Band D から、指定の band の年額の目安を出す。 */
export function londonCouncilTaxForBand(band: CouncilTaxBand) {
  const row = COUNCIL_TAX_BANDS.find((b) => b.band === band);
  return COUNCIL_TAX.londonBandD * (row?.ratio ?? 1);
}

/** 電気の単価がガスの何倍か。暖房方式の比較に使う。 */
export const ELECTRICITY_TO_GAS_UNIT_RATIO =
  ENERGY_CAP.electricity.unitPence / ENERGY_CAP.gas.unitPence;

/**
 * 出典。記事の GuideSources に渡す。
 * 数値を更新するときは、必ずこのリストを開いて裏を取ること。
 */
export const BILLS_SOURCES = {
  councilTax: [
    { label: "GOV.UK - Council Tax: who has to pay", url: "https://www.gov.uk/council-tax/who-has-to-pay" },
    { label: "GOV.UK - Council Tax: discounts for full-time students", url: "https://www.gov.uk/council-tax/discounts-for-full-time-students" },
    { label: "GOV.UK - Council Tax arrears", url: "https://www.gov.uk/council-tax-arrears" },
    { label: "GOV.UK - Check your Council Tax band", url: "https://www.gov.uk/council-tax-bands" },
    { label: "MHCLG - Council Tax levels set by local authorities in England 2026 to 2027", url: "https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027" },
    { label: "Wandsworth Borough Council - Council Tax bands and charges", url: "https://www.wandsworth.gov.uk/council-tax/council-tax-bands-and-charges/" },
    { label: "GOV.UK - Public funds (Council Tax Reduction)", url: "https://www.gov.uk/government/publications/public-funds--2/public-funds" },
  ],
  energy: [
    { label: "Ofgem - Energy price cap unit rates and standing charges", url: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap-unit-rates-and-standing-charges" },
    { label: "Ofgem - Energy price cap will rise by 4% from October 2026", url: "https://www.ofgem.gov.uk/press-release/energy-price-cap-will-rise-4-october-2026" },
    { label: "GOV.UK - Breathing space on your energy bill (VAT on electricity)", url: "https://www.gov.uk/government/news/breathing-space-on-your-energy-bill" },
    { label: "Citizens Advice - Find out who your gas or electricity supplier is", url: "https://www.citizensadvice.org.uk/consumer/energy/energy-supply/moving-home-your-energy-supply/find-out-who-your-gas-or-electricity-supplier-is/" },
    { label: "Citizens Advice - Moving home: dealing with your energy supply", url: "https://www.citizensadvice.org.uk/consumer/energy/energy-supply/moving-home-your-energy-supply/moving-home-dealing-with-your-energy-supply/" },
    { label: "GOV.UK - Find an energy certificate (EPC)", url: "https://www.gov.uk/find-energy-certificate" },
  ],
  billsIncluded: [
    { label: "Ofgem - The resale of gas and electricity: guidance on maximum resale price", url: "https://www.ofgem.gov.uk/guidance/resale-gas-and-electricity-guidance-maximum-resale-price-updated-october-2005" },
    { label: "GOV.UK - Council Tax: who has to pay", url: "https://www.gov.uk/council-tax/who-has-to-pay" },
    { label: "Ofgem - Energy price cap unit rates and standing charges", url: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap-unit-rates-and-standing-charges" },
    { label: "GOV.UK - TV Licence", url: "https://www.gov.uk/tv-licence" },
  ],
  water: [
    { label: "Thames Water - Our charges", url: "https://www.thameswater.co.uk/help/account-and-billing/understand-your-bill/value" },
    { label: "Thames Water - Moving home", url: "https://www.thameswater.co.uk/help/account-and-billing/moving-home" },
    { label: "Thames Water - Unmetered customers", url: "https://www.thameswater.co.uk/help/account-and-billing/understand-your-bill/unmetered-customers" },
  ],
  tvLicence: [
    { label: "GOV.UK - TV Licence", url: "https://www.gov.uk/tv-licence" },
    { label: "GOV.UK - Cost of TV licence fee set for 2026/27", url: "https://www.gov.uk/government/news/cost-of-tv-licence-fee-set-for-202627" },
    { label: "TV Licensing - Check if you need a TV Licence", url: "https://www.tvlicensing.co.uk/check-if-you-need-one" },
  ],
  telecom: [
    { label: "Ofcom - Ofcom bans mid-contract price rises linked to inflation", url: "https://www.ofcom.org.uk/phones-and-broadband/bills-and-charges/ofcom-bans-mid-contract-price-rises-linked-to-inflation" },
    { label: "Ofcom - Automatic compensation: what you need to know", url: "https://www.ofcom.org.uk/phones-and-broadband/service-quality/automatic-compensation-need-know" },
    { label: "Ofcom - Broadband and mobile coverage checker", url: "https://checker.ofcom.org.uk/" },
  ],
} as const;
