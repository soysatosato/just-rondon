/**
 * 英国の賃金・雇用制度に関わる数値を一元管理する。
 *
 * なぜ定数にするか:
 * 法定最低賃金は毎年4月1日に改定される。記事本文にべた書きすると改定期に
 * 追随できず、しかも「自分の時給が違法かどうか」を判断するための数字なので、
 * 古い値を残すことが読者の不利益に直結する。
 *
 * 運用ルール:
 * 1. 記事から数値を書くときは必ずここを参照する。
 * 2. 改定時はこのファイルと JOBS_AS_OF / JOBS_UPDATED_AT だけを更新する。
 * 3. レートは Low Pay Commission の勧告にもとづく政府決定値。発表は前年秋、
 *    適用は4月1日。発表時点で翌年度の値が確定するので、4月を待たずに
 *    「2026年4月1日から」と明記して差し替えてよい。
 * 4. 年齢区分は制度側の区分をそのまま持つ。読者の年齢で丸めない。
 *
 * 2026年8月13日に gov.uk で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const JOBS_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const JOBS_UPDATED_AT = "2026-08-13";

/** 現行レートの適用開始日。改定のたびに更新する。 */
export const WAGE_RATES_EFFECTIVE_FROM = "2026年4月1日";

/**
 * 法定最低賃金の区分。
 *
 * 21歳以上が National Living Wage、それ未満が National Minimum Wage という
 * 建て付け。名前が違うだけで、下回れば違法である点は同じ。
 */
export type WageBand = {
  /** 制度上の名称。記事では英名をそのまま出す。 */
  name: string;
  /** 適用される年齢・ステータス。 */
  appliesTo: string;
  /** 時給(ポンド)。 */
  hourlyRate: number;
};

export const WAGE_BANDS: WageBand[] = [
  {
    name: "National Living Wage",
    appliesTo: "21歳以上",
    hourlyRate: 12.71,
  },
  {
    name: "National Minimum Wage（18-20歳）",
    appliesTo: "18〜20歳",
    hourlyRate: 10.85,
  },
  {
    name: "National Minimum Wage（16-17歳）",
    appliesTo: "16〜17歳",
    hourlyRate: 8.0,
  },
  {
    name: "Apprentice Rate",
    appliesTo: "見習い（Apprenticeship）中の労働者",
    hourlyRate: 8.0,
  },
];

/**
 * 最低賃金違反に対する HMRC のペナルティ。
 *
 * 「通報しても何も起きない」と思われないよう、記事で具体額を出す。
 */
export const MINIMUM_WAGE_PENALTY = {
  /** 未払い額に対する倍率。 */
  percentOfArrears: 200,
  /** 労働者1人あたりの上限。 */
  capPerWorker: 20000,
} as const;

/**
 * 職場年金(auto-enrolment)の閾値と拠出率。
 *
 * qualifying earnings の下限・上限は毎年度の見直し対象で、政府が据え置く年も
 * あるが自動更新ではない。記事側に「年収£6,240超〜£50,270まで」と書くと、
 * 動いた年に本文の計算例まで一斉に誤りになるため、計算は必ず
 * pensionContribution() を通す。
 */
export const PENSION = {
  /** 自動加入の対象になる年収の下限。 */
  autoEnrolmentEarnings: 10000,
  /** 自動加入の対象になる年齢の下限。 */
  autoEnrolmentMinAge: 22,
  /** 拠出の対象になる所得(qualifying earnings)の下限。この額を超えた分だけ。 */
  qualifyingEarningsLower: 6240,
  /** 同上限。これを超える分には拠出がかからない。 */
  qualifyingEarningsUpper: 50270,
  /** 従業員の最低拠出率(%)。 */
  employeePercent: 5,
  /** 雇用主の最低拠出率(%)。 */
  employerPercent: 3,
  /** 合計の最低拠出率(%)。 */
  totalPercent: 8,
  /** small pot ルールで一時金として受け取れる上限。 */
  smallPotLimit: 10000,
} as const;

/**
 * 年収から従業員の年金拠出額を求める。
 *
 * qualifying earnings は「年収そのもの」ではなく「下限を超え上限までの部分」。
 * ここを取り違えた計算例が日本語圏に多いので、記事では必ずこの関数で出す。
 */
export function pensionContribution(annualSalary: number) {
  const capped = Math.min(annualSalary, PENSION.qualifyingEarningsUpper);
  const qualifying = Math.max(0, capped - PENSION.qualifyingEarningsLower);
  const yearly = (qualifying * PENSION.employeePercent) / 100;
  return {
    /** 拠出の対象になる所得。 */
    qualifying,
    /** 年間の自己負担額。 */
    yearly,
    /** 月あたりの自己負担額。 */
    monthly: yearly / 12,
  };
}

/**
 * ポンド表記。端数が .00 のときは小数を省き、4桁以上は桁区切りを入れる。
 * 例: gbp(12.71) → £12.71 / gbp(20000) → £20,000
 */
export function gbp(value: number) {
  const hasFraction = !Number.isInteger(value);
  return `£${value.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * 時給表記。レート表では桁を揃えたいので £8 ではなく £8.00 と出す。
 */
export function hourlyGbp(value: number) {
  return `£${value.toFixed(2)}`;
}

/** 年齢から適用される区分を返す。見習いは年齢では決まらないので対象外。 */
export function wageBandForAge(age: number): WageBand | null {
  if (age >= 21) return WAGE_BANDS[0];
  if (age >= 18) return WAGE_BANDS[1];
  if (age >= 16) return WAGE_BANDS[2];
  return null;
}

/**
 * 出典。記事の参照元として、また更新時に開くべき一次情報として持つ。
 * レートは毎年4月に変わるため、更新時は必ずここを開いて確認すること。
 */
export const JOBS_SOURCES = [
  {
    label: "GOV.UK - National Minimum Wage and National Living Wage rates",
    url: "https://www.gov.uk/national-minimum-wage-rates",
  },
  {
    label: "GOV.UK - National Minimum Wage calculator",
    url: "https://www.gov.uk/am-i-getting-minimum-wage",
  },
  {
    label: "Acas - Pay and wages",
    url: "https://www.acas.org.uk/pay-and-wages",
  },
] as const;
