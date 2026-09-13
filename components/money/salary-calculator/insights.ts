import {
  calculateTakeHome,
  marginalRates,
  type TakeHomeInput,
  type TakeHomeResult,
} from "@/lib/money/take-home/calculate";
import { formatGbp, formatPercent } from "@/lib/money/take-home/format";
import {
  CURRENT_TAX_YEAR_ID,
  previousTaxYear,
} from "@/lib/money/take-home/tax-years";
import type { CalculatorState } from "@/lib/money/take-home/url-state";
import { WAGE_BANDS, hourlyGbp } from "@/lib/jobs/rates";

/**
 * 計算結果から「この条件の人が知っておくべきこと」を拾う。
 *
 * 数字だけ出す計算機は、読者が数字の意味を読み違えたときに止められない。
 * 時給が最低賃金を割っている、緊急税コードで多く引かれている、
 * £100,000を超えて実質60%超の帯にいる——こうした状況は計算の途中で
 * 判定できるので、その場で言葉にして、該当する記事へつなぐ。
 *
 * 比較のための再計算(年金なし、前年度、イングランドなら…)もここで行う。
 * 画面側は並べて描くだけにする。
 */

export type InsightTone = "warn" | "tip" | "info";

export type Insight = {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

const TONE_ORDER: Record<InsightTone, number> = { warn: 0, tip: 1, info: 2 };

export function buildInsights(
  state: CalculatorState,
  input: TakeHomeInput,
  result: TakeHomeResult,
  limit = 4,
): Insight[] {
  const insights: Insight[] = [];
  const gross = result.grossAnnual;
  const year = result.year;
  if (gross <= 0) return insights;

  // ---- 最低賃金 -----------------------------------------------------------
  // 最低賃金の表(lib/jobs/rates.ts)は今年度の値しか持たない。
  if (state.yearId === CURRENT_TAX_YEAR_ID && state.hoursPerWeek > 0) {
    const [adult, youth, young] = WAGE_BANDS;
    const hourly =
      state.per === "hour" ? state.pay ?? 0 : gross / (state.hoursPerWeek * 52);
    if (hourly > 0 && hourly < adult.hourlyRate - 0.004) {
      insights.push({
        id: "minimum-wage",
        // 年収や月給で入れた人の労働時間は、既定の週37.5時間で仮に置いているだけ。
        // パートタイムの年収を入れた人に「違法」と強く出さないよう、時給で入れたときだけ注意にする。
        tone: state.per === "hour" ? "warn" : "info",
        title:
          state.per === "hour"
            ? `時給${hourlyGbp(hourly)}は、21歳以上の最低賃金を下回っています`
            : `週${state.hoursPerWeek}時間働く契約なら、時給${hourlyGbp(hourly)}で最低賃金を下回ります`,
        body: `21歳以上の National Living Wage は時給${hourlyGbp(adult.hourlyRate)}です(18〜20歳は${hourlyGbp(
          youth.hourlyRate,
        )}、16〜17歳と見習いは${hourlyGbp(young.hourlyRate)})。${
          state.per === "hour"
            ? "年齢区分に当てはまらないのにこの時給なら、違法の可能性があります。"
            : "実際の労働時間が違うときは、詳しい条件で週の時間を直してください。"
        }`,
        href: "/jobs/minimum-wage",
        cta: "最低賃金と給与明細の確かめ方",
      });
    }
  }

  // ---- 税コード -----------------------------------------------------------
  const code = result.taxCodeParsed;
  if (code) {
    // 比べる相手は「同じ地域の標準コード」。S / C の記号で地域が変わった分を差に混ぜない。
    const standard = calculateTakeHome({ ...input, taxCode: "", region: result.region });
    const extra = standard.takeHome - result.takeHome;
    const isEmergency =
      code.nonCumulative ||
      (code.kind === "flat" && code.flatCode === "BR") ||
      (code.kind === "allowance" && !code.isK && code.allowance === 0);

    if (extra >= 1) {
      insights.push({
        id: "tax-code-extra",
        tone: isEmergency ? "warn" : "info",
        title: `税コード${code.normalized}だと、標準より年${formatGbp(extra)}多く引かれます`,
        body: isEmergency
          ? `月にすると${formatGbp(extra / 12)}です。BR や 0T は、雇用主があなたの非課税枠を知らないときに使う暫定のコードです。正しいコードに切り替われば、払いすぎた分は以後の給与か年度末の精算で戻ります。2つ目の仕事で BR になっているなら、それは正しい扱いです。`
          : code.kind === "flat"
            ? "全額に高い税率をかけるコードです。ほかの仕事や年金ですでに税率帯を使い切っている場合に出ます。心当たりがなければ HMRC のアカウントで確認してください。"
            : "非課税枠が標準の£12,570より小さいコードです。配偶者に非課税枠を移している(末尾が N)、前年度の未払いの税や現物給与を回収している、などの理由が考えられます。",
        href: "/money/national-insurance-number",
        cta: "税コードと還付の仕組み",
      });
    } else if (extra <= -1) {
      insights.push({
        id: "tax-code-less",
        tone: "info",
        title: `税コード${code.normalized}だと、標準より年${formatGbp(-extra)}少なく引かれます`,
        body: "非課税枠が標準より大きいか、課税しないコードです。結婚手当(Marriage Allowance)の受け取りなどが反映されている可能性があります。心当たりがなければ、あとで不足分を請求されることがあるので HMRC のアカウントで確認してください。",
        href: "/money/national-insurance-number",
        cta: "税コードの確かめ方",
      });
    } else if (code.nonCumulative) {
      insights.push({
        id: "tax-code-non-cumulative",
        tone: "info",
        title: `${code.normalized} の末尾は、緊急税コードの印です`,
        body: "1年を通して同じ額をもらうなら、年額の手取りは標準のコードと変わりません。年度の途中から働き始めた場合は、それまでの月の非課税枠が使われないぶん多く引かれ、差額は正しいコードになったあとで戻ります。",
        href: "/money/national-insurance-number",
        cta: "緊急税コードと還付の仕組み",
      });
    }
  }

  // ---- £100,000超の逓減 -----------------------------------------------------
  const taperEnd = year.allowanceTaperThreshold + year.personalAllowance * 2;
  if (!code && result.allowanceTapered && result.taxablePay <= taperEnd) {
    const excess = result.taxablePay - year.allowanceTaperThreshold;
    const sacrificed = calculateTakeHome({ ...input, extraSalarySacrifice: excess });
    const cost = result.takeHome - sacrificed.takeHome;
    const marginal = marginalRates(input).government;
    insights.push({
      id: "allowance-taper",
      tone: "tip",
      title: `£100,000を超えた部分には、実質${formatPercent(marginal, 0)}かかっています`,
      body: `非課税枠が£2につき£1ずつ削られるためです。超えている${formatGbp(
        excess,
      )}を給与犠牲(salary sacrifice)で年金に回すと、手取りの減りは${formatGbp(
        cost,
      )}で済み、年金には${formatGbp(excess)}がそのまま入ります。会社に給与犠牲の制度があるか確認してみてください。`,
    });
  }

  // ---- RAS の追加還付 ---------------------------------------------------------
  if (result.pension.extraPensionRelief >= 1) {
    insights.push({
      id: "pension-extra-relief",
      tone: "tip",
      title: `申告すれば、年金の税の還付があと年${formatGbp(
        result.pension.extraPensionRelief,
      )}戻ります`,
      body: "RAS 方式の年金で自動的に付く還付は、基本税率(20%)の分だけです。それより高い税率がかかっている部分は給与からは戻らず、Self Assessment(確定申告)で請求するか HMRC の調整で戻ります。この額は上の手取りに含めていません。",
    });
  }

  // ---- 前年度との差 -----------------------------------------------------------
  if (state.yearId === CURRENT_TAX_YEAR_ID) {
    const previous = previousTaxYear(state.yearId);
    if (previous) {
      const before = calculateTakeHome({ ...input, yearId: previous.id });
      const diff = result.takeHome - before.takeHome;
      if (Math.abs(diff) >= 1) {
        const parts = [
          { label: "所得税", delta: result.incomeTax - before.incomeTax },
          {
            label: "学生ローンの返済",
            delta:
              result.studentLoan +
              result.postgraduateLoan -
              before.studentLoan -
              before.postgraduateLoan,
          },
          {
            label: "National Insurance",
            delta: result.nationalInsurance - before.nationalInsurance,
          },
        ].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
        const main = parts[0];
        insights.push({
          id: "previous-year",
          tone: "info",
          title: `${previous.label}年度より、手取りが年${formatGbp(Math.abs(diff))}${
            diff > 0 ? "増えています" : "減っています"
          }`,
          body: `同じ額面で比べた差です。いちばん大きいのは${main.label}で、年${formatGbp(
            Math.abs(main.delta),
          )}${main.delta < 0 ? "減りました" : "増えました"}。税率帯や返済開始ラインの改定によるものです。`,
          href: "#tax-year-changes",
          cta: `${year.label}年度の変更点`,
        });
      }
    }
  }

  // ---- 地域 -----------------------------------------------------------------
  if (!code && result.region === "scotland") {
    const england = calculateTakeHome({ ...input, region: "england" });
    const diff = england.takeHome - result.takeHome;
    const higherBand = year.incomeTax.scotland.find((b) => b.flatCode === "D1");
    if (Math.abs(diff) >= 1 && higherBand) {
      insights.push({
        id: "region",
        tone: "info",
        title:
          diff > 0
            ? `イングランドに住んでいたら、手取りは年${formatGbp(diff)}多くなります`
            : `イングランドより、手取りが年${formatGbp(-diff)}多くなっています`,
        body: `スコットランドの所得税は6段階で、額面${formatGbp(
          year.personalAllowance + higherBand.from,
        )}を超える部分から42%になります。どちらの税率になるかは、勤務地ではなく住んでいる場所で決まります。`,
      });
    }
  }

  // ---- 年金 -----------------------------------------------------------------
  const pension = result.pension;
  if (pension.employeeContribution > 0) {
    const without = calculateTakeHome({ ...input, pension: { kind: "none" } });
    const cost = without.takeHome - result.takeHome;
    const inflow = pension.employeeContribution + pension.employerContribution;
    insights.push({
      id: "pension-trade-off",
      tone: "info",
      title: `年金をやめると、手取りは月${formatGbp(cost / 12)}増えます`,
      body: `そのかわり、年金口座に入る年${formatGbp(inflow)}(うち会社負担${formatGbp(
        pension.employerContribution,
      )})がなくなります。手取りを年${formatGbp(cost)}減らして、${formatGbp(
        inflow,
      )}を積み立てている計算です。英国の年金は原則55歳(2028年4月からは57歳)まで引き出せないので、帰国の予定があるなら判断材料になります。`,
      href: "/jobs/workplace-pension",
      cta: "職場年金の仕組みと脱退の判断",
    });
  } else if (state.pension === "auto" && pension.belowAutoEnrolmentTrigger) {
    insights.push({
      id: "pension-below-trigger",
      tone: "info",
      title: `年収${formatGbp(year.pension.earningsTrigger)}未満なので、年金の自動加入の対象外です`,
      body:
        gross > year.pension.qualifyingLower
          ? "この計算では年金を引いていません。本人が申し出れば加入でき、その場合は会社にも拠出する義務があります。"
          : `この計算では年金を引いていません。本人が申し出れば加入できますが、年収${formatGbp(
              year.pension.qualifyingLower,
            )}以下では会社に拠出の義務はありません。`,
      href: "/jobs/workplace-pension",
      cta: "自動加入の条件",
    });
  } else if (state.pension === "none" && gross >= year.pension.earningsTrigger) {
    const auto = calculateTakeHome({ ...input, pension: { kind: "auto" } });
    const cost = result.takeHome - auto.takeHome;
    insights.push({
      id: "pension-eligible",
      tone: "info",
      title: "会社員なら、年金に自動で加入させられている年収です",
      body: `自動加入の最低額だと、手取りは月${formatGbp(
        cost / 12,
      )}減り、年金口座には年${formatGbp(
        auto.pension.employeeContribution + auto.pension.employerContribution,
      )}(うち会社負担${formatGbp(
        auto.pension.employerContribution,
      )})が入ります。明細の手取りがこの計算より少ないときは、まず年金の天引きを確認してください。`,
      href: "/jobs/workplace-pension",
      cta: "明細で年金の天引きを見分ける",
    });
  }

  // ---- 非課税の範囲 ------------------------------------------------------------
  if (
    !code &&
    result.incomeTax === 0 &&
    result.nationalInsurance === 0 &&
    gross <= year.personalAllowance
  ) {
    insights.push({
      id: "below-allowance",
      tone: "info",
      title: `年収${formatGbp(year.personalAllowance)}以下なので、所得税も National Insurance もかかりません`,
      body: "仕事を掛け持ちしている場合、所得税はすべての給与を合わせて決まり、2つ目の仕事には BR コードで全額に20%かかることがあります(払いすぎは年度末に戻ります)。National Insurance は原則として仕事ごとに計算されます。",
    });
  }

  // ---- 学生ローン ----------------------------------------------------------------
  if (state.studentLoans.length > 0 && result.studentLoan === 0) {
    const thresholds = state.studentLoans
      .map((plan) => year.studentLoans[plan]?.threshold)
      .filter((t): t is number => typeof t === "number");
    insights.push({
      id: "student-loan-none",
      tone: "info",
      title:
        thresholds.length > 0
          ? `返済開始ライン(${formatGbp(Math.min(...thresholds))})に届かないので、学生ローンは引かれません`
          : `${year.label}年度は、選んだプランの返済がありません`,
      body: "返済は額面(税引き前)が返済開始ラインを超えた部分にだけかかります。収入が下がって返済が止まっても、残高と利息はそのまま残ります。",
    });
  }

  return insights
    .sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone])
    .slice(0, limit);
}
