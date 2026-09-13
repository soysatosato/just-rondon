import type { TakeHomeResult } from "@/lib/money/take-home/calculate";

/**
 * 額面の行き先(手取り・所得税・NI・年金・学生ローン)の色と名前。
 *
 * 色は「どの項目か」を見分けるための分類色で、並び順ごと固定してある。
 * 順番を入れ替えたり、学生ローンが無い人のときに色を詰めたりしないこと。
 * 隣り合う色の組み合わせは、色覚の特性を模擬した差(ΔE)で検証済みで、
 * 色を詰めると検証していない組み合わせが隣に来る。
 *
 * 明るい背景では NI・年金・学生ローンの色がコントラスト3:1に届かないので、
 * 棒グラフの隣に必ず名前と金額を文字で出す(色だけで読ませない)。
 * 文字そのものには色を付けない。
 */
export type SeriesKey =
  | "takeHome"
  | "incomeTax"
  | "nationalInsurance"
  | "pension"
  | "studentLoan";

export const SERIES: {
  key: SeriesKey;
  label: string;
  /** 給与明細での英語表記。 */
  english: string;
  /** 棒・凡例の塗り。Tailwind が拾えるよう完全なクラス名で書く。 */
  fill: string;
  stroke: string;
}[] = [
  {
    key: "takeHome",
    label: "手取り",
    english: "Net pay",
    fill: "bg-[#2a78d6] dark:bg-[#3987e5]",
    stroke: "stroke-[#2a78d6] dark:stroke-[#3987e5]",
  },
  {
    key: "incomeTax",
    label: "所得税",
    english: "Income Tax (PAYE)",
    fill: "bg-[#eb6834] dark:bg-[#d95926]",
    stroke: "stroke-[#eb6834] dark:stroke-[#d95926]",
  },
  {
    key: "nationalInsurance",
    label: "National Insurance",
    english: "NI",
    fill: "bg-[#1baf7a] dark:bg-[#199e70]",
    stroke: "stroke-[#1baf7a] dark:stroke-[#199e70]",
  },
  {
    key: "pension",
    label: "職場年金",
    english: "Pension",
    fill: "bg-[#eda100] dark:bg-[#c98500]",
    stroke: "stroke-[#eda100] dark:stroke-[#c98500]",
  },
  {
    key: "studentLoan",
    label: "学生ローン",
    english: "Student Loan",
    fill: "bg-[#e87ba4] dark:bg-[#d55181]",
    stroke: "stroke-[#e87ba4] dark:stroke-[#d55181]",
  },
];

/** 年額の内訳を、項目の順に取り出す。 */
export function seriesValues(result: TakeHomeResult): Record<SeriesKey, number> {
  return {
    takeHome: Math.max(0, result.takeHome),
    incomeTax: result.incomeTax,
    nationalInsurance: result.nationalInsurance,
    pension: result.pensionFromPay,
    studentLoan: result.studentLoan + result.postgraduateLoan,
  };
}
