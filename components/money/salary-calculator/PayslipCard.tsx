import type { ReactNode } from "react";
import type { TakeHomeResult } from "@/lib/money/take-home/calculate";
import { formatGbp } from "@/lib/money/take-home/format";
import type { StudentLoanPlanId } from "@/lib/money/take-home/tax-years";
import { cn } from "@/lib/utils";

export type PayslipView = "year" | "month" | "week";

const VIEW_TITLE: Record<PayslipView, string> = {
  month: "月の給与明細にすると",
  week: "週払いの給与明細にすると",
  year: "1年分の合計（P60）にすると",
};

const DIVISOR: Record<PayslipView, number> = { year: 1, month: 12, week: 52 };

const METHOD_NOTE = {
  "relief-at-source": "RAS：拠出額の80%が引かれ、残り20%は税の還付で年金会社が足す",
  "net-pay": "Net pay：所得税を計算する前の給与から引かれる",
  "salary-sacrifice": "給与犠牲：額面そのものを減らして会社が年金に入れる",
} as const;

const PLAN_LABEL: Record<StudentLoanPlanId, string> = {
  plan1: "Plan 1",
  plan2: "Plan 2",
  plan4: "Plan 4",
  plan5: "Plan 5",
};

function Line({
  english,
  japanese,
  value,
  deduction = false,
  pence,
  strong = false,
}: {
  english: string;
  japanese: ReactNode;
  value: number;
  deduction?: boolean;
  pence: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 py-2">
      <div className="min-w-0">
        <p
          className={cn(
            "font-mono text-[13px] tracking-tight",
            strong ? "font-semibold text-foreground" : "text-foreground/90",
          )}
        >
          {english}
        </p>
        <p className="text-[11px] leading-snug text-muted-foreground">{japanese}</p>
      </div>
      <span
        aria-hidden
        className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-border"
      />
      <p
        className={cn(
          "shrink-0 font-mono text-[13px] tabular-nums",
          strong ? "text-base font-semibold text-foreground" : "text-foreground/90",
        )}
      >
        {deduction ? "−" : ""}
        {formatGbp(value, { pence })}
      </p>
    </div>
  );
}

/**
 * 計算結果を、英国の給与明細(payslip)の並びと言葉で書き直したもの。
 *
 * 帯グラフと同じ数字をもう一度出しているのは、読者の手元にある明細が
 * 英語だから。「Tax」「NI」「Nest」のどの行がどの控除か分からない人が、
 * 自分の明細と1行ずつ突き合わせられるように、英語の行名に日本語を添える。
 * 帯グラフを表で読み直す役(色に頼らない読み方)も兼ねる。
 */
export default function PayslipCard({
  result,
  view,
  studentLoans,
  overStatePensionAge,
}: {
  result: TakeHomeResult;
  view: PayslipView;
  studentLoans: StudentLoanPlanId[];
  overStatePensionAge: boolean;
}) {
  const divisor = DIVISOR[view];
  const pence = view !== "year";
  const pension = result.pension;
  const hasPension = pension.employeeContribution > 0 || pension.employerContribution > 0;
  const potTotal = pension.employeeContribution + pension.employerContribution;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-bold tracking-tight">{VIEW_TITLE[view]}</h3>
        <p className="font-mono text-[11px] text-muted-foreground">
          Tax code {result.taxCodeUsed} · NI letter {overStatePensionAge ? "C" : "A"}
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-border bg-background/60 px-4 py-2">
        <p className="pt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Payments
        </p>
        <Line
          english="Basic Pay"
          japanese="額面（税や控除を引く前の給与）"
          value={result.grossAnnual / divisor}
          pence={pence}
        />

        <p className="border-t border-border/70 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Deductions
        </p>
        <Line
          english="PAYE Tax"
          japanese="所得税（源泉徴収）"
          value={result.incomeTax / divisor}
          deduction
          pence={pence}
        />
        <Line
          english="National Insurance"
          japanese="国民保険料。State Pension の記録になる"
          value={result.nationalInsurance / divisor}
          deduction
          pence={pence}
        />
        {result.pensionFromPay > 0 && pension.method && (
          <Line
            english={
              pension.method === "salary-sacrifice"
                ? "Pension (Salary Sacrifice)"
                : "Pension (Employee)"
            }
            japanese={METHOD_NOTE[pension.method]}
            value={result.pensionFromPay / divisor}
            deduction
            pence={pence}
          />
        )}
        {result.studentLoan > 0 && (
          <Line
            english="Student Loan"
            japanese={`学生ローン（${studentLoans
              .map((p) => PLAN_LABEL[p])
              .join("・")}）`}
            value={result.studentLoan / divisor}
            deduction
            pence={pence}
          />
        )}
        {result.postgraduateLoan > 0 && (
          <Line
            english="Postgraduate Loan"
            japanese="大学院ローン"
            value={result.postgraduateLoan / divisor}
            deduction
            pence={pence}
          />
        )}

        <div className="border-t-2 border-foreground/80">
          <Line
            english="Net Pay"
            japanese="手取り（口座に振り込まれる額）"
            value={Math.max(0, result.takeHome) / divisor}
            pence={pence}
            strong
          />
        </div>
      </div>

      {hasPension && (
        <div className="mt-4 rounded-xl bg-muted/60 p-4">
          <p className="text-sm font-semibold">
            年金口座に入る額{" "}
            <span className="tabular-nums">{formatGbp(potTotal / divisor, { pence })}</span>
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li className="flex justify-between gap-3">
              <span>
                あなたの給与から
                {pension.method === "relief-at-source" && "（税の還付を除く）"}
              </span>
              <span className="tabular-nums text-foreground">
                {formatGbp(result.pensionFromPay / divisor, { pence })}
              </span>
            </li>
            {pension.reliefAddedToPot > 0 && (
              <li className="flex justify-between gap-3">
                <span>税の還付（年金会社が HMRC から受け取る）</span>
                <span className="tabular-nums text-foreground">
                  {formatGbp(pension.reliefAddedToPot / divisor, { pence })}
                </span>
              </li>
            )}
            <li className="flex justify-between gap-3">
              <span>会社の負担（明細に載らないことも多い）</span>
              <span className="tabular-nums text-foreground">
                {formatGbp(pension.employerContribution / divisor, { pence })}
              </span>
            </li>
          </ul>
          {pension.extraPensionRelief >= 1 && (
            <p className="mt-2 border-t border-border/70 pt-2 text-xs leading-relaxed text-muted-foreground">
              このほか、高い税率の部分の還付が年{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatGbp(pension.extraPensionRelief)}
              </span>{" "}
              あります。給与からは戻らず、Self Assessment（確定申告）などで請求します。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
