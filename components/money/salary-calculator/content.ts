import type { GuideFaqItem, GuideSectionData } from "@/components/guides/types";
import { WAGE_BANDS, hourlyGbp } from "@/lib/jobs/rates";
import {
  calculateTakeHome,
  marginalRates,
  type TakeHomeInput,
} from "@/lib/money/take-home/calculate";
import { formatGbp, formatPercent } from "@/lib/money/take-home/format";
import {
  CURRENT_TAX_YEAR,
  STUDENT_LOAN_PLANS,
  type IncomeTaxBand,
  type TaxYear,
} from "@/lib/money/take-home/tax-years";
import { calculatorHref } from "@/lib/money/take-home/url-state";

/**
 * 手取り計算機ページの本文(早見表・税率表・FAQ)。
 *
 * 本文の数字はすべて lib/money/take-home の計算と税率表から書き出す。
 * 「年収£30,000の手取りは月£2,093」のような数字を手で書くと、
 * 年度を更新したときに計算機だけが新しくなり、本文とFAQ(構造化データ)が
 * 古い数字のまま検索結果に出続けるため。
 */

export const SALARY_CALCULATOR_PATH = "/money/salary-calculator";

const year = CURRENT_TAX_YEAR;
const NLW = WAGE_BANDS[0].hourlyRate;

const BASE_INPUT: TakeHomeInput = {
  yearId: year.id,
  grossAnnual: 0,
  region: "england",
  pension: { kind: "none" },
  studentLoans: [],
  postgraduateLoan: false,
  taxCode: "",
  overStatePensionAge: false,
};

function calc(grossAnnual: number, patch: Partial<TakeHomeInput> = {}) {
  return calculateTakeHome({ ...BASE_INPUT, ...patch, grossAnnual });
}

const g = (value: number) => formatGbp(value);

/** 税率帯の境目を、非課税枠を含む額面の年収に直す。 */
function grossBoundary(taxYear: TaxYear, from: number) {
  const withAllowance = from + taxYear.personalAllowance;
  // £100,000を超える帯では非課税枠が削られてゼロになるので、境目は課税所得そのもの。
  return withAllowance <= taxYear.allowanceTaperThreshold ? withAllowance : from;
}

function bandTable(taxYear: TaxYear, bands: IncomeTaxBand[]) {
  const rows = [
    `| ${g(taxYear.personalAllowance)}まで | 0% | 非課税枠（Personal Allowance） |`,
    ...bands.map((band, i) => {
      const lower = grossBoundary(taxYear, band.from);
      const next = bands[i + 1];
      const range = next
        ? `${g(lower + 1)}〜${g(grossBoundary(taxYear, next.from))}`
        : `${g(lower)}超`;
      return `| ${range} | ${Math.round(band.rate * 1000) / 10}% | ${band.label}（${band.name}） |`;
    }),
  ];
  return `| 額面の年収 | 税率 | 区分 |\n|---|---|---|\n${rows.join("\n")}`;
}

// ---- 早見表 ------------------------------------------------------------------

export const FULL_TIME_HOURS = 37.5;
export const MINIMUM_WAGE_FULL_TIME = Math.round(NLW * FULL_TIME_HOURS * 52 * 100) / 100;

export type QuickRow = {
  gross: number;
  label?: string;
  href: string;
  takeHome: number;
  monthly: number;
  incomeTax: number;
  nationalInsurance: number;
  scotlandMonthly: number;
  marginal: number;
};

const QUICK_GROSS = [
  15000,
  20000,
  MINIMUM_WAGE_FULL_TIME,
  25000,
  30000,
  35000,
  40000,
  45000,
  50000,
  60000,
  70000,
  80000,
  100000,
  125140,
  150000,
];

export function quickTableRows(): QuickRow[] {
  return QUICK_GROSS.map((gross) => {
    const england = calc(gross);
    const scotland = calc(gross, { region: "scotland" });
    const isMinimumWage = gross === MINIMUM_WAGE_FULL_TIME;
    return {
      gross,
      label: isMinimumWage ? `最低賃金・週${FULL_TIME_HOURS}時間` : undefined,
      href: isMinimumWage
        ? calculatorHref(SALARY_CALCULATOR_PATH, {
            per: "hour",
            pay: NLW,
            hoursPerWeek: FULL_TIME_HOURS,
            pension: "none",
          })
        : calculatorHref(SALARY_CALCULATOR_PATH, { pay: gross, pension: "none" }),
      takeHome: england.takeHome,
      monthly: england.takeHome / 12,
      incomeTax: england.incomeTax,
      nationalInsurance: england.nationalInsurance,
      scotlandMonthly: scotland.takeHome / 12,
      marginal: marginalRates({ ...BASE_INPUT, grossAnnual: gross }).government,
    };
  });
}

export const MATRIX_HOURLY = [NLW, 14, 16, 18, 20, 25];
export const MATRIX_HOURS = [16, 20, 30, 37.5, 40];

/** 時給×週の時間 → 手取りの月額。 */
export function hourlyMatrix() {
  return MATRIX_HOURLY.map((hourly) => ({
    hourly,
    isMinimumWage: hourly === NLW,
    cells: MATRIX_HOURS.map((hours) => {
      const gross = hourly * hours * 52;
      return {
        hours,
        monthly: calc(gross).takeHome / 12,
        href: calculatorHref(SALARY_CALCULATOR_PATH, {
          per: "hour",
          pay: hourly,
          hoursPerWeek: hours,
          pension: "none",
        }),
      };
    }),
  }));
}

// ---- 本文 --------------------------------------------------------------------

const ni = year.nationalInsurance;
const pension = year.pension;
const scotlandBands = year.incomeTax.scotland;
const englandTaperMarginal = marginalRates({ ...BASE_INPUT, grossAnnual: 110000 }).government;
const scotlandTaperMarginal = marginalRates({
  ...BASE_INPUT,
  grossAnnual: 110000,
  region: "scotland",
}).government;

export const SALARY_SECTIONS: GuideSectionData[] = [
  {
    id: "how-it-works",
    title: "手取りはこの順番で計算されます",
    navLabel: "計算の順番",
    body: `英国の給与からは、次の順で引かれます。計算機もこの順番どおりに計算しています。

| 順番 | 引かれるもの | かかり方 |
|---|---|---|
| 1 | 給与犠牲（salary sacrifice）の年金 | 額面そのものを減らす |
| 2 | Net pay 方式の年金 | 所得税を計算する前に引く |
| 3 | 所得税（Income Tax） | 非課税枠を超えた部分に20〜45% |
| 4 | National Insurance | 年${g(ni.primaryThreshold)}を超えた部分に${formatPercent(ni.mainRate, 0)} |
| 5 | 学生ローン | 返済開始ラインを超えた部分に9% |
| 6 | RAS 方式の年金（Nest など） | 税引き後の給与から、拠出額の80% |

**額面が同じでも、年金の方式で手取りは変わります**。所得税の前に引かれるのか後に引かれるのかが違うためです。明細の手取りが計算と合わないときは、まず年金の行と税コードを確かめてください。`,
  },
  {
    id: "income-tax",
    title: `所得税の税率（${year.label}年度）`,
    navLabel: "所得税",
    body: `### イングランド・ウェールズ・北アイルランド

${bandTable(year, year.incomeTax.england)}

### スコットランド

${bandTable(year, scotlandBands)}

どちらの税率になるかは、**勤務地ではなく住んでいる場所**で決まります。ウェールズは独自に税率を決められますが、${year.label}年度もイングランドと同じ税率です。

### £100,000を超えると、非課税枠が削られる

調整後の所得が${g(year.allowanceTaperThreshold)}を超えると、超えた£2ごとに非課税枠が£1ずつ減り、${g(
      year.allowanceTaperThreshold + year.personalAllowance * 2,
    )}でゼロになります。この区間では額面が£1増えるたびに所得税が60p増え、National Insurance の2%と合わせて実質${formatPercent(
      englandTaperMarginal,
      0,
    )}（スコットランドは${formatPercent(scotlandTaperMarginal, 1)}）が**増えた分から引かれる計算**です。

この区間にいる人は、超えた分を給与犠牲などで年金に回すと非課税枠が戻るため、年金の拠出に対する実質の負担が小さくなります。

### 税率帯は2031年まで据え置き

イングランド・ウェールズ・北アイルランドの非課税枠（${g(year.personalAllowance)}）と税率帯は、2031年4月5日まで据え置きが決まっています。賃金が上がるほど高い税率帯に入る人が増える仕組みで、毎年の手取りの伸びは額面の伸びより小さくなります。`,
  },
  {
    id: "national-insurance",
    title: "National Insurance（国民保険料）",
    navLabel: "NI",
    body: `| 額面の年収 | 率 |
|---|---|
| ${g(ni.primaryThreshold)}まで | 0% |
| ${g(ni.primaryThreshold + 1)}〜${g(ni.upperEarningsLimit)} | ${formatPercent(ni.mainRate, 0)} |
| ${g(ni.upperEarningsLimit)}超 | ${formatPercent(ni.upperRate, 0)} |

National Insurance の納付記録で、State Pension（国の年金）の受給資格が決まります。**State Pension の受給年齢に達した人の給与には、National Insurance がかかりません。**

所得税はすべての給与を合わせて決まるのに対し、National Insurance は原則として**仕事ごと**に計算されます。掛け持ちで2つの仕事がどちらも週${g(
      Math.round(ni.primaryThreshold / 52),
    )}程度に満たなければ、National Insurance は引かれません。番号の取り方は[National Insurance number を取る](/money/national-insurance-number)にまとめています。`,
  },
  {
    id: "workplace-pension",
    title: "職場年金は、方式で手取りが変わる",
    navLabel: "職場年金",
    body: `年収${g(pension.earningsTrigger)}以上・22歳以上の従業員は、会社が職場年金に自動で加入させます。最低拠出は、年収のうち**下限と上限のあいだの部分**（${g(
      pension.qualifyingLower,
    )}〜${g(pension.qualifyingUpper)}）に対して、本人${pension.employeeMinimumPercent}%（税の還付込み）と会社${pension.employerMinimumPercent}%です。年収の全額にかかるわけではありません。

| 方式 | 引かれるタイミング | 所得税 | NI | 明細の見え方 |
|---|---|---|---|---|
| RAS（Nest など） | 税引き後の給与から | 年金会社が20%分を足す | 減らない | 拠出額の80%が載る |
| Net pay | 所得税の前 | 減る | 減らない | 拠出額がそのまま載る |
| 給与犠牲 | 額面を減らす | 減る | 減る | 額面そのものが下がる |

RAS 方式で自動的に付く還付は基本税率（20%）の分だけです。40%以上の税率がかかっている人は、残りを Self Assessment（確定申告）で請求します。計算機はこの額を手取りとは別に表示します。

給与犠牲は所得税と National Insurance の両方が減るため、同じ拠出額なら手取りの減りがいちばん小さい方式です。ただし2029年4月からは、給与犠牲のうち年£2,000を超える部分に National Insurance がかかるようになる予定です。

自動加入の仕組みと、脱退するかどうかの判断は[職場年金（Nest）の仕組みと脱退方法](/jobs/workplace-pension)で詳しく書いています。`,
  },
  {
    id: "student-loans",
    title: "学生ローンの返済",
    navLabel: "学生ローン",
    body: `| プラン | 返済開始ライン（年収） | 率 | 対象 |
|---|---|---|---|
${STUDENT_LOAN_PLANS.map((plan) => {
  const rule = year.studentLoans[plan.id];
  return `| ${plan.label} | ${rule ? g(rule.threshold) : "返済なし"} | ${
    rule ? formatPercent(rule.rate, 0) : "—"
  } | ${plan.who} |`;
}).join("\n")}
| 大学院ローン | ${g(year.postgraduateLoan.threshold)} | ${formatPercent(year.postgraduateLoan.rate, 0)} | 修士・博士課程のローン |

返済は**税引き前の額面**が返済開始ラインを超えた部分にだけかかります。複数のプランを持っている人は、いちばん低いラインを超えた分に9%で、大学院ローンの6%はそれとは別にかかります。

Plan 2 の返済開始ラインは、2027年4月から3年間${g(year.studentLoans.plan2?.threshold ?? 0)}のまま据え置かれることが決まっています。`,
  },
  {
    id: "tax-codes",
    title: "給与明細の税コードの読み方",
    navLabel: "税コード",
    body: `| 税コード | 意味 |
|---|---|
| 1257L | 年£12,570まで非課税。いちばん一般的なコード |
| 1257L M1 / W1 / X | 緊急税コード（非累積）。年度の途中から働き始めた人は多く引かれる |
| BR | 非課税枠を使わず、全額に20%。2つ目の仕事や、情報が足りないとき |
| 0T | 非課税枠が£0。税率帯はそのまま |
| D0 / D1 | 全額に40% / 45%（スコットランドは SD0〜SD3） |
| K で始まる | 非課税枠がマイナス。社用車などの現物給与や未払いの税を回収している |
| S / C で始まる | スコットランド / ウェールズの納税者 |
| NT | 所得税を引かない |

新しい職場に前職の P45（源泉徴収の記録）を出せないと、Starter checklist の回答に応じて 1257L M1 や BR などの暫定のコードになり、多く引かれることがあります。**払いすぎた分は戻ります**。正しいコードに切り替わったあとの給与か、年度末の精算で調整されます。

計算機の「詳しい条件」に明細の税コードを入れると、標準のコードとの差額が出ます。還付の流れは[National Insurance number を取る](/money/national-insurance-number)で説明しています。`,
  },
  {
    id: "tax-year-changes",
    title: `${year.label}年度に変わったこと`,
    navLabel: "今年度の変更点",
    body: `英国の税年度は**4月6日から翌年4月5日まで**です。${year.label}年度（${year.startsOn.slice(
      0,
      4,
    )}年4月6日〜${year.endsOn.slice(0, 4)}年4月5日）に、前年度から次の点が変わりました。

${year.changes.map((change) => `- ${change}`).join("\n")}

### この先に決まっていること

- Plan 2 の学生ローンの返済開始ラインは、2027年4月から3年間据え置き
- 給与犠牲の年金は、2029年4月から年£2,000を超える部分に National Insurance がかかる予定
- イングランド・ウェールズ・北アイルランドの非課税枠と税率帯、National Insurance の閾値は2031年4月5日まで据え置き

この計算機は、新しい年度の税率が確定するたびに更新します。`,
  },
  {
    id: "assumptions",
    title: "この計算機の前提",
    navLabel: "計算の前提",
    body: `- 年額で計算し、月額は12、週額は52で割っています。実際の給与計算は支払いのたびに端数を切り捨てるため、明細とは数ペンスずれることがあります
- 1つの仕事の給与だけを計算しています。副業・家賃収入・預金の利息などほかの所得、社用車などの現物給与、Child Benefit の返還（High Income Child Benefit Charge）は含みません
- ボーナスは支給された月にまとめて計算されるため、年収に含めて計算した額とは National Insurance を中心にずれます
- 税コードを手入力した場合は、£100,000を超える額面の非課税枠の逓減を自動では反映しません（HMRC がコードに反映している前提です）
- 円換算は欧州中央銀行（ECB）の参考レートで、実際に送金するときのレートとは数%離れます
- 税務上の助言ではありません。個別の状況は HMRC か税理士に確認してください`,
  },
];

// ---- FAQ ---------------------------------------------------------------------

const r30 = calc(30000);
const r30Pension = calc(30000, { pension: { kind: "auto" } });
const rMinimum = calc(MINIMUM_WAGE_FULL_TIME);
const rMinimumPension = calc(MINIMUM_WAGE_FULL_TIME, { pension: { kind: "auto" } });
const r100 = calc(100000);
const r125 = calc(125140);
const scotlandCompare = [25000, 50000, 80000].map((gross) => ({
  gross,
  diff: calc(gross, { region: "scotland" }).takeHome - calc(gross).takeHome,
}));

export const SALARY_FAQ: GuideFaqItem[] = [
  {
    question: "イギリスで年収£30,000だと、手取りはいくらですか？",
    answer: `**イングランド・ウェールズ・北アイルランドなら年${g(r30.takeHome)}、月${g(
      r30.takeHome / 12,
    )}です**（${year.label}年度、年金なし）。所得税が年${g(r30.incomeTax)}、National Insurance が年${g(
      r30.nationalInsurance,
    )}引かれます。職場年金に自動加入の最低額で入っている場合は、手取りがさらに月${g(
      (r30.takeHome - r30Pension.takeHome) / 12,
    )}少なくなります。`,
  },
  {
    question: "最低賃金でフルタイムで働くと、手取りはいくらになりますか？",
    answer: `21歳以上の最低賃金は時給${hourlyGbp(NLW)}です。週${FULL_TIME_HOURS}時間・52週で額面は年${formatGbp(
      MINIMUM_WAGE_FULL_TIME,
      { pence: true },
    )}、**手取りは月${g(rMinimum.takeHome / 12)}です**（年金なし）。職場年金の自動加入の最低額が引かれると、月${g(
      rMinimumPension.takeHome / 12,
    )}になります。`,
  },
  {
    question: "税コード「1257L」とは、どういう意味ですか？",
    answer:
      "**年£12,570まで所得税がかからない、という意味です**。数字を10倍した額が非課税枠で、末尾の L は標準の非課税枠を受けていることを表します。先頭に S があればスコットランド、C があればウェールズの納税者です。末尾に M1・W1・X が付いていたら緊急税コードです。",
  },
  {
    question: "給与明細の税コードが BR や 0T になっています。払いすぎた税金は戻りますか？",
    answer: `**戻ります**。BR や 0T は、雇用主があなたの非課税枠を知らないときに使う暫定のコードで、年収£30,000なら標準のコードより年${g(
      calc(30000, { taxCode: "BR" }).incomeTax - r30.incomeTax,
    )}多く引かれる計算です。HMRC から正しいコードが届けば以後の給与で調整され、年度末までに調整されなければ還付を請求できます。ただし2つ目の仕事で BR になっているのは正しい扱いです。`,
  },
  {
    question: "職場年金（Nest）をやめると、手取りはいくら増えますか？",
    answer: `年収£30,000で自動加入の最低額を払っている場合、**やめると手取りは月${g(
      (r30.takeHome - r30Pension.takeHome) / 12,
    )}増えます**。そのかわり、会社が払っている年${g(
      r30Pension.pension.employerContribution,
    )}と、税の還付の年${g(
      r30Pension.pension.reliefAddedToPot,
    )}も受け取れなくなります。加入から1か月以内に脱退すれば払った分は戻りますが、それを過ぎると55歳（2028年4月からは57歳）まで引き出せません。`,
  },
  {
    question: "スコットランドは、イングランドより税金が高いですか？",
    answer: `**年収によります**。${year.label}年度の手取りをイングランドと比べると、${scotlandCompare
      .map(
        ({ gross, diff }) =>
          `年収${g(gross)}で年${g(Math.abs(diff))}${diff >= 0 ? "多く" : "少なく"}`,
      )
      .join("、")}なります。スコットランドは低い所得に19%のスターター税率がある一方、額面${g(
      year.personalAllowance + (scotlandBands.find((b) => b.flatCode === "D1")?.from ?? 0),
    )}を超える部分から42%になるため、中所得以上では手取りが少なくなります。`,
  },
  {
    question: "年収£100,000を超えると、税率が60%になるというのは本当ですか？",
    answer: `**本当です**。£100,000を超えた£2ごとに非課税枠が£1ずつ削られるため、£100,000から£125,140までは、額面が増えた分の${formatPercent(
      englandTaperMarginal,
      0,
    )}が所得税と National Insurance に回ります。実際に年収£100,000と£125,140の手取りを比べると、額面は${g(
      125140 - 100000,
    )}増えるのに、手取りは${g(r125.takeHome - r100.takeHome)}しか増えません。`,
  },
  {
    question: "仕事を掛け持ちしている場合は、どう計算すればいいですか？",
    answer:
      "所得税はすべての給与を合わせた年収で決まるので、合計額を入れれば年間の所得税の目安になります。ただし実際の明細では、非課税枠が1つ目の仕事に使われ、2つ目の仕事は BR コードで全額に20%かかるのが一般的です。**National Insurance は原則として仕事ごとに計算される**ため、合計額で計算すると実際より多めに出ます。",
  },
  {
    question: "手取りは日本円でいくらになりますか？",
    answer:
      "計算機では、欧州中央銀行（ECB）の参考レートで手取りを円に換算して表示しています。レートは平日1日1回の更新で、実際に日本へ送金するときは手数料や為替の上乗せで数%離れます。**送金するなら、手数料ではなく受取額で比べてください**。詳しくは[日本から送金する](/money/sending-money-from-japan)を参照してください。",
  },
];
