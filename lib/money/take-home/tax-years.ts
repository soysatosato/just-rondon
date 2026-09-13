/**
 * 手取り計算機(/money/salary-calculator)が使う、年度ごとの税率と閾値。
 *
 * なぜ年度単位のオブジェクトにするか:
 * 英国の所得税・National Insurance・学生ローン・職場年金の閾値は、
 * 毎年4月6日に一斉に切り替わる。数字を記事や計算式にばらばらに書くと、
 * 改定のたびに「計算機は新しいのに早見表は去年の数字」という食い違いが
 * 起きる。手取りは読者がそのまま生活費の計算に使う数字なので、
 * 食い違いはそのまま読者の損になる。
 *
 * 運用ルール(毎年の更新はこのファイルだけで完結させる):
 * 1. 新年度の数字は、前年秋〜冬の予算と、1〜2月に出る GOV.UK の
 *    「Rates and thresholds for employers」で確定する。確定したら
 *    TAX_YEARS の先頭に1件足し、CURRENT_TAX_YEAR_ID を差し替える。
 * 2. 前年度のオブジェクトは消さない。計算機の「年度」切り替えと、
 *    「前年度と比べて手取りがいくら変わったか」の表示に使う。
 * 3. スコットランドの税率帯は、スコットランド議会が毎年別に決める。
 *    イングランドの据え置きが続いていても、こちらは動くので必ず確認する。
 * 4. ウェールズは Senedd が税率を決められるが、現状はイングランドと同じ
 *    (各帯10p)。独自の税率になったら TaxRegion に "wales" を足すこと。
 * 5. 最低賃金は lib/jobs/rates.ts が持つ。ここに二重に書かない。
 *
 * 2026年9月13日に GOV.UK で確認。
 */

export type TaxRegion = "england" | "scotland";

export const TAX_REGION_LABELS: Record<TaxRegion, string> = {
  england: "イングランド・ウェールズ・北アイルランド",
  scotland: "スコットランド",
};

/** 一律課税の税コード。どの帯の税率を全額にかけるかを表す。 */
export type FlatTaxCode = "BR" | "D0" | "D1" | "D2" | "D3";

export type IncomeTaxBand = {
  /**
   * 課税所得(非課税枠を引いたあと)の下限。この額を超えた部分に rate がかかる。
   * GOV.UK の表の「£37,701 to £125,140」は from: 37700 と書く。
   */
  from: number;
  rate: number;
  /** 給与明細や HMRC の書類に出る英語名。 */
  name: string;
  /** 日本語の呼び名。 */
  label: string;
  /** この帯の税率を一律にかける税コード(BR / D0 など)。 */
  flatCode?: FlatTaxCode;
};

export type StudentLoanPlanId = "plan1" | "plan2" | "plan4" | "plan5";

export type RepaymentRule = {
  /** 年額の返済開始ライン。額面(税引き前)がこれを超えた部分にかかる。 */
  threshold: number;
  rate: number;
};

export type TaxYearId = "2026-27" | "2025-26";

export type TaxYear = {
  id: TaxYearId;
  /** 画面に出す表記。 */
  label: string;
  /** ISO日付。英国の税年度は4月6日始まり。 */
  startsOn: string;
  endsOn: string;
  personalAllowance: number;
  /**
   * 非課税枠が減り始める調整後所得。超えた£2ごとに£1減り、
   * personalAllowance の2倍を足した額でゼロになる。
   */
  allowanceTaperThreshold: number;
  incomeTax: Record<TaxRegion, IncomeTaxBand[]>;
  /**
   * RAS(relief at source)の年金拠出に、年金会社が上乗せする税の還付率。
   * スコットランドの納税者でも基本税率(20%)で付く。
   */
  reliefAtSourceRate: number;
  nationalInsurance: {
    /** 年額。これを超えた部分に mainRate がかかる。 */
    primaryThreshold: number;
    /** 年額。これを超えた部分は upperRate に下がる。 */
    upperEarningsLimit: number;
    mainRate: number;
    upperRate: number;
  };
  /** その年度に返済が発生しないプランは null。 */
  studentLoans: Record<StudentLoanPlanId, RepaymentRule | null>;
  postgraduateLoan: RepaymentRule;
  pension: {
    /** 自動加入の対象になる年収の下限。 */
    earningsTrigger: number;
    /** qualifying earnings の下限。この額を超えた部分だけが拠出の対象。 */
    qualifyingLower: number;
    /** qualifying earnings の上限。 */
    qualifyingUpper: number;
    /** 従業員の最低拠出率(%)。税の還付ぶんを含む。 */
    employeeMinimumPercent: number;
    /** 雇用主の最低拠出率(%)。 */
    employerMinimumPercent: number;
  };
  /**
   * 前年度から変わったこと。本文の「今年度の変更点」にそのまま出す。
   * markdown 不可。1項目1文で、数字は前後の値を両方書く。
   */
  changes: string[];
};

export const TAX_YEARS: TaxYear[] = [
  {
    id: "2026-27",
    label: "2026/27",
    startsOn: "2026-04-06",
    endsOn: "2027-04-05",
    personalAllowance: 12570,
    allowanceTaperThreshold: 100000,
    incomeTax: {
      england: [
        { from: 0, rate: 0.2, name: "Basic rate", label: "基本税率", flatCode: "BR" },
        { from: 37700, rate: 0.4, name: "Higher rate", label: "高税率", flatCode: "D0" },
        { from: 125140, rate: 0.45, name: "Additional rate", label: "最高税率", flatCode: "D1" },
      ],
      scotland: [
        { from: 0, rate: 0.19, name: "Starter rate", label: "スターター税率" },
        { from: 3967, rate: 0.2, name: "Basic rate", label: "基本税率", flatCode: "BR" },
        { from: 16956, rate: 0.21, name: "Intermediate rate", label: "中間税率", flatCode: "D0" },
        { from: 31092, rate: 0.42, name: "Higher rate", label: "高税率", flatCode: "D1" },
        { from: 62430, rate: 0.45, name: "Advanced rate", label: "上級税率", flatCode: "D2" },
        { from: 125140, rate: 0.48, name: "Top rate", label: "最高税率", flatCode: "D3" },
      ],
    },
    reliefAtSourceRate: 0.2,
    nationalInsurance: {
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
    },
    studentLoans: {
      plan1: { threshold: 26900, rate: 0.09 },
      plan2: { threshold: 29385, rate: 0.09 },
      plan4: { threshold: 33795, rate: 0.09 },
      plan5: { threshold: 25000, rate: 0.09 },
    },
    postgraduateLoan: { threshold: 21000, rate: 0.06 },
    pension: {
      earningsTrigger: 10000,
      qualifyingLower: 6240,
      qualifyingUpper: 50270,
      employeeMinimumPercent: 5,
      employerMinimumPercent: 3,
    },
    changes: [
      "スコットランドのスターター税率(19%)の上限が£15,397から£16,537に、基本税率(20%)の上限が£27,491から£29,526に上がりました(いずれも額面の年収)。",
      "学生ローンの返済開始ラインが、Plan 1は£26,065から£26,900、Plan 2は£28,470から£29,385、Plan 4は£32,745から£33,795に上がりました。",
      "2023年8月以降にイングランドで進学した人の Plan 5 で、返済が始まりました(年収£25,000超の部分の9%)。",
      "イングランド・ウェールズ・北アイルランドの所得税の税率帯と、National Insurance の閾値は据え置きです。2025年11月の予算で、据え置きは2031年4月5日まで延長されました。",
      "21歳以上の最低賃金(National Living Wage)は、時給£12.21から£12.71に上がりました。",
    ],
  },
  {
    id: "2025-26",
    label: "2025/26",
    startsOn: "2025-04-06",
    endsOn: "2026-04-05",
    personalAllowance: 12570,
    allowanceTaperThreshold: 100000,
    incomeTax: {
      england: [
        { from: 0, rate: 0.2, name: "Basic rate", label: "基本税率", flatCode: "BR" },
        { from: 37700, rate: 0.4, name: "Higher rate", label: "高税率", flatCode: "D0" },
        { from: 125140, rate: 0.45, name: "Additional rate", label: "最高税率", flatCode: "D1" },
      ],
      scotland: [
        { from: 0, rate: 0.19, name: "Starter rate", label: "スターター税率" },
        { from: 2827, rate: 0.2, name: "Basic rate", label: "基本税率", flatCode: "BR" },
        { from: 14921, rate: 0.21, name: "Intermediate rate", label: "中間税率", flatCode: "D0" },
        { from: 31092, rate: 0.42, name: "Higher rate", label: "高税率", flatCode: "D1" },
        { from: 62430, rate: 0.45, name: "Advanced rate", label: "上級税率", flatCode: "D2" },
        { from: 125140, rate: 0.48, name: "Top rate", label: "最高税率", flatCode: "D3" },
      ],
    },
    reliefAtSourceRate: 0.2,
    nationalInsurance: {
      primaryThreshold: 12570,
      upperEarningsLimit: 50270,
      mainRate: 0.08,
      upperRate: 0.02,
    },
    studentLoans: {
      plan1: { threshold: 26065, rate: 0.09 },
      plan2: { threshold: 28470, rate: 0.09 },
      plan4: { threshold: 32745, rate: 0.09 },
      // Plan 5 の返済は2026年4月から。この年度はまだ誰も返済していない。
      plan5: null,
    },
    postgraduateLoan: { threshold: 21000, rate: 0.06 },
    pension: {
      earningsTrigger: 10000,
      qualifyingLower: 6240,
      qualifyingUpper: 50270,
      employeeMinimumPercent: 5,
      employerMinimumPercent: 3,
    },
    changes: [],
  },
];

/**
 * 計算機が最初に開く年度。
 *
 * 日付から自動で決めない。静的に書き出したページとブラウザで日付の判定が
 * ずれると、4月6日前後に表示が切り替わってハイドレーションが食い違う。
 * 新年度の数字を足した日にここを手で差し替える(運用ルール1)。
 */
export const CURRENT_TAX_YEAR_ID: TaxYearId = "2026-27";

/** 本文の「◯年◯月時点」バッジ。 */
export const TAKE_HOME_AS_OF = "2026年9月";

/** ISO日付。WebApplication の dateModified に出る。 */
export const TAKE_HOME_UPDATED_AT = "2026-09-13";

export function getTaxYear(id: TaxYearId): TaxYear {
  return TAX_YEARS.find((y) => y.id === id) ?? TAX_YEARS[0];
}

export const CURRENT_TAX_YEAR = getTaxYear(CURRENT_TAX_YEAR_ID);

/** 1つ前の年度。比較の表示に使う。無ければ null。 */
export function previousTaxYear(id: TaxYearId): TaxYear | null {
  const index = TAX_YEARS.findIndex((y) => y.id === id);
  return index >= 0 ? TAX_YEARS[index + 1] ?? null : null;
}

export function isTaxYearId(value: string): value is TaxYearId {
  return TAX_YEARS.some((y) => y.id === value);
}

/**
 * 最新の年度が終わっているか。
 *
 * 更新を忘れたまま4月を越えると、計算機は去年の税率のまま動き続ける。
 * 読者に「この数字は古い」と伝えるための判定で、クライアント側で使う。
 */
export function isLatestTaxYearOver(now: Date): boolean {
  const latest = TAX_YEARS[0];
  return now.getTime() > new Date(`${latest.endsOn}T23:59:59+01:00`).getTime();
}

export const STUDENT_LOAN_PLANS: {
  id: StudentLoanPlanId;
  label: string;
  /** 誰がこのプランか。GOV.UK の区分をそのまま短くしたもの。 */
  who: string;
}[] = [
  {
    id: "plan1",
    label: "Plan 1",
    who: "2012年9月より前にイングランド・ウェールズで進学した人、北アイルランドで借りた人",
  },
  {
    id: "plan2",
    label: "Plan 2",
    who: "2012年9月〜2023年7月にイングランドで進学した人、2012年9月以降にウェールズで進学した人",
  },
  {
    id: "plan4",
    label: "Plan 4",
    who: "スコットランド(SAAS)で借りた人",
  },
  {
    id: "plan5",
    label: "Plan 5",
    who: "2023年8月以降にイングランドで学部課程に進学した人",
  },
];

/**
 * 出典。更新時に開くべき一次情報でもある。
 */
export const TAKE_HOME_SOURCES = [
  {
    label: "GOV.UK - Rates and thresholds for employers 2026 to 2027",
    url: "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027",
  },
  {
    label: "GOV.UK - Income Tax rates and allowances for current and past years",
    url: "https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past",
  },
  {
    label: "GOV.UK - National Insurance rates and categories",
    url: "https://www.gov.uk/national-insurance-rates-letters",
  },
  {
    label: "GOV.UK - Repaying your student loan: what you pay",
    url: "https://www.gov.uk/repaying-your-student-loan/what-you-pay",
  },
  {
    label: "The Pensions Regulator - Automatic enrolment earnings thresholds",
    url: "https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/ongoing-duties-for-employers/earnings-thresholds",
  },
  {
    label: "GOV.UK - Tax codes",
    url: "https://www.gov.uk/tax-codes",
  },
  {
    label: "GOV.WALES - Welsh rates of Income Tax 2026 to 2027",
    url: "https://www.gov.wales/welsh-rates-of-income-tax-ready-reckoner-2026-to-2027",
  },
] as const;
