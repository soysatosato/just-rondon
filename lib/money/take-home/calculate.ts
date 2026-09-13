import {
  getTaxYear,
  type IncomeTaxBand,
  type StudentLoanPlanId,
  type TaxRegion,
  type TaxYear,
  type TaxYearId,
} from "./tax-years";
import { parseTaxCode, type ParsedTaxCode } from "./tax-code";

/**
 * 額面から手取りを出す計算の本体。
 *
 * React から切り離して純粋な関数にしてあるのは、同じ式を
 * 3か所で使うため: 計算機の画面、サーバーで書き出す早見表とFAQの数字、
 * それにチャートの標本点。どれか1つだけ別の式で計算すると、
 * 「早見表と計算機で手取りが違う」という一番信用を失う食い違いが起きる。
 *
 * 計算は年額でまとめて行う。実際の給与計算は月ごと・週ごとに端数を
 * 切り捨てるので、明細とは数ペンス単位でずれることがある。
 *
 * 出す数字は「給与から実際に引かれる額」。RAS 方式の年金で高税率の人が
 * 自己申告で取り戻せる税は、手取りに混ぜずに extraPensionRelief として
 * 別に返す(明細には出てこないお金なので、混ぜると明細と照合できなくなる)。
 */

export type PensionMethod = "relief-at-source" | "net-pay" | "salary-sacrifice";

/** 拠出率をかける元。 */
export type PensionBasis = "qualifying" | "total";

export type PensionInput =
  | { kind: "none" }
  /** 自動加入の法定最低額。年収が自動加入の下限未満なら引かれない。 */
  | { kind: "auto" }
  | {
      kind: "custom";
      employeePercent: number;
      employerPercent: number;
      method: PensionMethod;
      basis: PensionBasis;
    };

export type TakeHomeInput = {
  yearId: TaxYearId;
  /** 額面の年収。 */
  grossAnnual: number;
  region: TaxRegion;
  pension: PensionInput;
  studentLoans: StudentLoanPlanId[];
  postgraduateLoan: boolean;
  /** 空文字は自動(1257L 相当・£100,000超で非課税枠を減らす)。 */
  taxCode: string;
  /** State Pension の受給年齢以上。National Insurance がかからない。 */
  overStatePensionAge: boolean;
  /**
   * 画面の入力には出さない、給与犠牲の上乗せ額(年額)。
   * 「£100,000を超えた分を年金に回すと手取りはいくら減るか」の試算に使う。
   */
  extraSalarySacrifice?: number;
};

export type TakeHomeResult = {
  year: TaxYear;
  /** 税率の地域。税コードの S / C が入力の地域より優先される。 */
  region: TaxRegion;
  grossAnnual: number;
  /** 給与から引かれる年額の内訳。すべて0以上。 */
  incomeTax: number;
  nationalInsurance: number;
  /** 学部の学生ローン(Plan 1/2/4/5)。 */
  studentLoan: number;
  postgraduateLoan: number;
  /** 年金のうち、給与から実際に消える額(給与犠牲ぶんを含む)。 */
  pensionFromPay: number;
  takeHome: number;
  /** 所得税がかかる額(非課税枠を引く前)。 */
  taxablePay: number;
  /** 使われた非課税枠。K コードでは負。一律課税コードでは0。 */
  allowance: number;
  /** 自動で決めた、または入力から読んだ税コード。 */
  taxCodeUsed: string;
  /** 入力された税コードを読めたか。空欄のときは true。 */
  taxCodeValid: boolean;
  taxCodeParsed: ParsedTaxCode | null;
  /** 非課税枠が£100,000超で削られているか(自動のときだけ)。 */
  allowanceTapered: boolean;
  pension: {
    /** 年金口座に入る本人ぶん(税の還付込み)。 */
    employeeContribution: number;
    employerContribution: number;
    /** RAS で年金会社が HMRC から受け取り、口座に足す還付。 */
    reliefAddedToPot: number;
    /** 高税率の人が申告で取り戻せる税(RAS のみ)。手取りには含めない。 */
    extraPensionRelief: number;
    method: PensionMethod | null;
    /** 自動加入を選んだが年収が下限に届かず、何も引かれていない。 */
    belowAutoEnrolmentTrigger: boolean;
    /** 拠出の元にした額。 */
    contributionBase: number;
  };
  /** 給与犠牲で額面から減らした額(年金の給与犠牲+上乗せ試算)。 */
  salarySacrifice: number;
};

type ResolvedPension = {
  employeePercent: number;
  employerPercent: number;
  method: PensionMethod;
  basis: PensionBasis;
  auto: boolean;
};

function resolvePension(input: PensionInput, year: TaxYear): ResolvedPension | null {
  if (input.kind === "none") return null;
  if (input.kind === "auto") {
    return {
      employeePercent: year.pension.employeeMinimumPercent,
      employerPercent: year.pension.employerMinimumPercent,
      // Nest をはじめ、自動加入の受け皿の多くは RAS 方式。
      method: "relief-at-source",
      basis: "qualifying",
      auto: true,
    };
  }
  return {
    employeePercent: clampPercent(input.employeePercent),
    employerPercent: clampPercent(input.employerPercent),
    method: input.method,
    basis: input.basis,
    auto: false,
  };
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function nonNegative(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * 非課税枠の逓減。調整後所得が閾値を超えた£2ごとに£1減る。
 * HMRC は端数の£1未満を切り捨てて扱うので、超過額を2で割って切り捨てる。
 */
export function taperedAllowance(year: TaxYear, adjustedNetIncome: number) {
  const excess = adjustedNetIncome - year.allowanceTaperThreshold;
  if (excess <= 0) return year.personalAllowance;
  return Math.max(0, year.personalAllowance - Math.floor(excess / 2));
}

/**
 * 課税所得に税率帯を当てる。
 *
 * extension は RAS の年金拠出で基本税率帯を広げる額。基本税率帯より上の
 * 境目だけを後ろにずらす(スコットランドではスターター帯の上限は動かない)。
 */
function bandTax(bands: IncomeTaxBand[], taxable: number, extension = 0) {
  if (taxable <= 0) return 0;
  const basicIndex = Math.max(
    0,
    bands.findIndex((b) => b.flatCode === "BR"),
  );

  let tax = 0;
  for (let i = 0; i < bands.length; i++) {
    const lower = bands[i].from + (i > basicIndex ? extension : 0);
    const next = bands[i + 1];
    const upper = next ? next.from + (i + 1 > basicIndex ? extension : 0) : Infinity;
    if (taxable <= lower) break;
    tax += (Math.min(taxable, upper) - lower) * bands[i].rate;
  }
  return tax;
}

/** 税コードの一律課税が指す税率。その地域に無いコードなら null。 */
function flatRate(bands: IncomeTaxBand[], code: string) {
  return bands.find((b) => b.flatCode === code)?.rate ?? null;
}

export function calculateTakeHome(input: TakeHomeInput): TakeHomeResult {
  const year = getTaxYear(input.yearId);
  const gross = nonNegative(input.grossAnnual);

  const parsed = input.taxCode.trim() ? parseTaxCode(input.taxCode) : null;
  const region: TaxRegion = parsed?.region ?? input.region;
  const bands = year.incomeTax[region];

  // その地域に存在しない一律課税コード(イングランドの D2 など)は読めなかった扱い。
  const codeUsable =
    parsed !== null &&
    !(parsed.kind === "flat" && flatRate(bands, parsed.flatCode) === null);
  const code = codeUsable ? parsed : null;
  const taxCodeValid = !input.taxCode.trim() || codeUsable;

  // ---- 年金 -------------------------------------------------------------
  const pension = resolvePension(input.pension, year);
  let contributionBase = 0;
  let employeeContribution = 0;
  let employerContribution = 0;
  let belowAutoEnrolmentTrigger = false;

  if (pension) {
    contributionBase =
      pension.basis === "qualifying"
        ? Math.max(
            0,
            Math.min(gross, year.pension.qualifyingUpper) -
              year.pension.qualifyingLower,
          )
        : gross;

    if (pension.auto && gross < year.pension.earningsTrigger) {
      belowAutoEnrolmentTrigger = true;
    } else {
      employeeContribution = (contributionBase * pension.employeePercent) / 100;
      employerContribution = (contributionBase * pension.employerPercent) / 100;
    }
  }

  const method = pension?.method ?? null;
  const pensionSacrifice =
    method === "salary-sacrifice" ? Math.min(employeeContribution, gross) : 0;
  const salarySacrifice = Math.min(
    gross,
    pensionSacrifice + nonNegative(input.extraSalarySacrifice ?? 0),
  );

  /** 給与犠牲のあとに残る、実際に支払われる額面。NI と学生ローンはここにかかる。 */
  const paidGross = gross - salarySacrifice;
  const netPayContribution =
    method === "net-pay" ? Math.min(employeeContribution, paidGross) : 0;
  const reliefAddedToPot =
    method === "relief-at-source" ? employeeContribution * year.reliefAtSourceRate : 0;
  const rasFromPay =
    method === "relief-at-source" ? employeeContribution - reliefAddedToPot : 0;

  // ---- 所得税 -----------------------------------------------------------
  const taxablePay = Math.max(0, paidGross - netPayContribution);
  let incomeTax = 0;
  let allowance = 0;
  let allowanceTapered = false;
  let taxCodeUsed: string;
  let extraPensionRelief = 0;
  const rasGross = method === "relief-at-source" ? employeeContribution : 0;

  if (!code) {
    allowance = taperedAllowance(year, taxablePay);
    allowanceTapered = allowance < year.personalAllowance;
    incomeTax = bandTax(bands, Math.max(0, taxablePay - allowance));
    // 非課税枠を使い切った人に HMRC が出すのは 0L ではなく 0T。
    taxCodeUsed = `${region === "scotland" ? "S" : ""}${
      allowance > 0 ? `${Math.floor(allowance / 10)}L` : "0T"
    }`;

    if (rasGross > 0) {
      // RAS の拠出は調整後所得を減らし、基本税率帯を広げる。
      const allowanceWithRelief = taperedAllowance(year, taxablePay - rasGross);
      const taxWithRelief = bandTax(
        bands,
        Math.max(0, taxablePay - allowanceWithRelief),
        rasGross,
      );
      extraPensionRelief = Math.max(0, incomeTax - taxWithRelief);
    }
  } else {
    taxCodeUsed = code.normalized;
    if (code.kind === "no-tax") {
      incomeTax = 0;
    } else if (code.kind === "flat") {
      incomeTax = taxablePay * (flatRate(bands, code.flatCode) ?? 0);
    } else {
      allowance = code.allowance;
      incomeTax = bandTax(bands, Math.max(0, taxablePay - allowance));
      // K コードは、1回の給与から税を半分より多く引いてはいけない。
      if (code.isK) incomeTax = Math.min(incomeTax, paidGross * 0.5);
      if (rasGross > 0) {
        const taxWithRelief = bandTax(
          bands,
          Math.max(0, taxablePay - allowance),
          rasGross,
        );
        extraPensionRelief = Math.max(0, incomeTax - taxWithRelief);
      }
    }
  }

  // ---- National Insurance -------------------------------------------------
  const ni = year.nationalInsurance;
  const nationalInsurance = input.overStatePensionAge
    ? 0
    : Math.max(
        0,
        Math.min(paidGross, ni.upperEarningsLimit) - ni.primaryThreshold,
      ) *
        ni.mainRate +
      Math.max(0, paidGross - ni.upperEarningsLimit) * ni.upperRate;

  // ---- 学生ローン ---------------------------------------------------------
  // 複数のプランを持つ人は、いちばん低い返済開始ラインを超えた分に9%だけ。
  const rules = input.studentLoans
    .map((plan) => year.studentLoans[plan])
    .filter((rule): rule is NonNullable<typeof rule> => rule !== null);
  const lowest = rules.reduce<(typeof rules)[number] | null>(
    (min, rule) => (min === null || rule.threshold < min.threshold ? rule : min),
    null,
  );
  const studentLoan = lowest
    ? Math.max(0, paidGross - lowest.threshold) * lowest.rate
    : 0;
  const postgraduateLoan = input.postgraduateLoan
    ? Math.max(0, paidGross - year.postgraduateLoan.threshold) *
      year.postgraduateLoan.rate
    : 0;

  const pensionFromPay = pensionSacrifice + netPayContribution + rasFromPay;
  const extraSacrifice = salarySacrifice - pensionSacrifice;
  const takeHome =
    gross -
    extraSacrifice -
    pensionFromPay -
    incomeTax -
    nationalInsurance -
    studentLoan -
    postgraduateLoan;

  return {
    year,
    region,
    grossAnnual: gross,
    incomeTax,
    nationalInsurance,
    studentLoan,
    postgraduateLoan,
    pensionFromPay,
    takeHome,
    taxablePay,
    allowance,
    taxCodeUsed,
    taxCodeValid,
    taxCodeParsed: code,
    allowanceTapered,
    pension: {
      employeeContribution,
      employerContribution,
      reliefAddedToPot,
      extraPensionRelief,
      method,
      belowAutoEnrolmentTrigger,
      contributionBase,
    },
    salarySacrifice,
  };
}

/** 国に納める分の合計(所得税+NI+学生ローン)。年金は本人の資産なので入れない。 */
export function governmentTake(result: TakeHomeResult) {
  return (
    result.incomeTax +
    result.nationalInsurance +
    result.studentLoan +
    result.postgraduateLoan
  );
}

/**
 * 額面を少しだけ増やしたときの変化。
 *
 * 税率表の「あなたの税率」は、帯の境目・非課税枠の逓減・NI の上限・
 * 学生ローン・年金の方式が重なって決まるので、表から読むより
 * 実際に計算して差を取るほうが確実。
 */
export function marginalRates(input: TakeHomeInput, step = 100) {
  const base = calculateTakeHome(input);
  const next = calculateTakeHome({
    ...input,
    grossAnnual: input.grossAnnual + step,
  });
  return {
    /** 次の£1のうち、国に納める割合。 */
    government: (governmentTake(next) - governmentTake(base)) / step,
    /** 次の£1のうち、手取りとして残る割合。 */
    keep: (next.takeHome - base.takeHome) / step,
  };
}

export type PayPeriod = "year" | "month" | "week" | "hour";

export const PERIODS_PER_YEAR: Record<Exclude<PayPeriod, "hour">, number> = {
  year: 1,
  month: 12,
  week: 52,
};

/** 入力された額と単位を、額面の年収に直す。 */
export function toAnnual(amount: number, per: PayPeriod, hoursPerWeek: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (per === "hour") return amount * Math.max(0, hoursPerWeek) * 52;
  return amount * PERIODS_PER_YEAR[per];
}

/** 年額を単位あたりに割る。時給は週の労働時間から出す。 */
export function perPeriod(
  annual: number,
  per: PayPeriod,
  hoursPerWeek: number,
) {
  if (per === "hour") {
    const hours = hoursPerWeek * 52;
    return hours > 0 ? annual / hours : 0;
  }
  return annual / PERIODS_PER_YEAR[per];
}
