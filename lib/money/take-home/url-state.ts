import {
  CURRENT_TAX_YEAR_ID,
  isTaxYearId,
  type StudentLoanPlanId,
  type TaxRegion,
  type TaxYearId,
} from "./tax-years";
import type {
  PayPeriod,
  PensionBasis,
  PensionMethod,
  TakeHomeInput,
} from "./calculate";
import { toAnnual } from "./calculate";

/**
 * 計算機の入力と、それを URL のクエリに載せる書き方。
 *
 * 条件を URL に持たせるのは、計算結果をそのまま人に送れるようにするため。
 * 「このオファー、手取りだとこれだけ」と共有されたリンクがこのページへの
 * 被リンクになり、開いた人は同じ条件の計算機から始められる。
 *
 * 既定値と同じ項目はクエリに出さない。URL が短いほど共有されやすく、
 * 早見表から張るリンクも「?pay=30000」のように読める形で済む。
 */

export type PensionChoice = "none" | "auto" | "custom";

export type CalculatorState = {
  /** 入力欄が空のときは null。 */
  pay: number | null;
  per: PayPeriod;
  hoursPerWeek: number;
  region: TaxRegion;
  pension: PensionChoice;
  employeePercent: number;
  employerPercent: number;
  pensionMethod: PensionMethod;
  pensionBasis: PensionBasis;
  studentLoans: StudentLoanPlanId[];
  postgraduateLoan: boolean;
  taxCode: string;
  yearId: TaxYearId;
  overStatePensionAge: boolean;
};

export const DEFAULT_STATE: CalculatorState = {
  pay: 35000,
  per: "year",
  hoursPerWeek: 37.5,
  region: "england",
  // 自動加入は雇用主の法的義務なので、会社員の明細にはほぼ必ず載っている。
  // 既定を「年金なし」にすると、明細より多い手取りを見せることになる。
  pension: "auto",
  employeePercent: 5,
  employerPercent: 3,
  pensionMethod: "relief-at-source",
  pensionBasis: "qualifying",
  studentLoans: [],
  postgraduateLoan: false,
  taxCode: "",
  yearId: CURRENT_TAX_YEAR_ID,
  overStatePensionAge: false,
};

const PERIODS: PayPeriod[] = ["year", "month", "week", "hour"];
const PLAN_KEYS: Record<string, StudentLoanPlanId> = {
  "1": "plan1",
  "2": "plan2",
  "4": "plan4",
  "5": "plan5",
};
const METHOD_KEYS: Record<string, PensionMethod> = {
  ras: "relief-at-source",
  net: "net-pay",
  ss: "salary-sacrifice",
};
const BASIS_KEYS: Record<string, PensionBasis> = {
  qe: "qualifying",
  all: "total",
};

function keyOf<T extends string>(map: Record<string, T>, value: T) {
  return Object.keys(map).find((k) => map[k] === value) ?? "";
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readNumber(params: URLSearchParams, key: string) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** クエリを読む。壊れた値は黙って既定値に戻す(共有リンクの手打ち崩れに備える)。 */
export function stateFromSearchParams(
  params: URLSearchParams,
  base: CalculatorState = DEFAULT_STATE,
): CalculatorState {
  const state: CalculatorState = { ...base, studentLoans: [...base.studentLoans] };

  const pay = readNumber(params, "pay");
  if (pay !== null) state.pay = clampNumber(pay, 0, 10_000_000);

  const per = params.get("per");
  if (per && (PERIODS as string[]).includes(per)) state.per = per as PayPeriod;

  const hours = readNumber(params, "h");
  if (hours !== null) state.hoursPerWeek = clampNumber(hours, 1, 100);

  const region = params.get("region");
  if (region === "scotland" || region === "england") state.region = region;

  const pension = params.get("pension");
  if (pension === "none" || pension === "auto" || pension === "custom") {
    state.pension = pension;
  }

  const employee = readNumber(params, "pp");
  if (employee !== null) state.employeePercent = clampNumber(employee, 0, 100);
  const employer = readNumber(params, "ep");
  if (employer !== null) state.employerPercent = clampNumber(employer, 0, 100);

  const method = METHOD_KEYS[params.get("pm") ?? ""];
  if (method) state.pensionMethod = method;
  const basis = BASIS_KEYS[params.get("pb") ?? ""];
  if (basis) state.pensionBasis = basis;

  const plans = params.get("sl");
  if (plans !== null) {
    state.studentLoans = Array.from(
      new Set(
        plans
          .split(",")
          .map((p) => PLAN_KEYS[p.trim()])
          .filter((p): p is StudentLoanPlanId => Boolean(p)),
      ),
    );
  }

  if (params.has("pg")) state.postgraduateLoan = params.get("pg") === "1";

  const code = params.get("code");
  if (code !== null) state.taxCode = code.slice(0, 12);

  const year = params.get("year");
  if (year && isTaxYearId(year)) state.yearId = year;

  if (params.has("spa")) state.overStatePensionAge = params.get("spa") === "1";

  return state;
}

/** 既定と違う項目だけをクエリにする。 */
export function stateToSearchParams(state: CalculatorState): URLSearchParams {
  const params = new URLSearchParams();
  const d = DEFAULT_STATE;

  if (state.pay !== null && state.pay !== d.pay) params.set("pay", String(state.pay));
  if (state.per !== d.per) params.set("per", state.per);
  if (state.hoursPerWeek !== d.hoursPerWeek) params.set("h", String(state.hoursPerWeek));
  if (state.region !== d.region) params.set("region", state.region);
  if (state.pension !== d.pension) params.set("pension", state.pension);

  if (state.pension === "custom") {
    if (state.employeePercent !== d.employeePercent) params.set("pp", String(state.employeePercent));
    if (state.employerPercent !== d.employerPercent) params.set("ep", String(state.employerPercent));
    if (state.pensionMethod !== d.pensionMethod) params.set("pm", keyOf(METHOD_KEYS, state.pensionMethod));
    if (state.pensionBasis !== d.pensionBasis) params.set("pb", keyOf(BASIS_KEYS, state.pensionBasis));
  }

  if (state.studentLoans.length > 0) {
    params.set(
      "sl",
      state.studentLoans.map((p) => keyOf(PLAN_KEYS, p)).join(","),
    );
  }
  if (state.postgraduateLoan) params.set("pg", "1");
  if (state.taxCode.trim()) params.set("code", state.taxCode.trim());
  if (state.yearId !== d.yearId) params.set("year", state.yearId);
  if (state.overStatePensionAge) params.set("spa", "1");

  return params;
}

/** 早見表やほかの記事から、条件を入れた状態の計算機へ張るリンク。 */
export function calculatorHref(
  path: string,
  partial: Partial<CalculatorState>,
): string {
  const query = stateToSearchParams({ ...DEFAULT_STATE, ...partial }).toString();
  return query ? `${path}?${query}` : path;
}

export function stateToInput(state: CalculatorState): TakeHomeInput {
  return {
    yearId: state.yearId,
    grossAnnual: toAnnual(state.pay ?? 0, state.per, state.hoursPerWeek),
    region: state.region,
    pension:
      state.pension === "custom"
        ? {
            kind: "custom",
            employeePercent: state.employeePercent,
            employerPercent: state.employerPercent,
            method: state.pensionMethod,
            basis: state.pensionBasis,
          }
        : { kind: state.pension },
    studentLoans: state.studentLoans,
    postgraduateLoan: state.postgraduateLoan,
    taxCode: state.taxCode,
    overStatePensionAge: state.overStatePensionAge,
  };
}
