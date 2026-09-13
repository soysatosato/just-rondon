"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TakeHomeResult } from "@/lib/money/take-home/calculate";
import { formatGbp } from "@/lib/money/take-home/format";
import { describeTaxCode } from "@/lib/money/take-home/tax-code";
import {
  STUDENT_LOAN_PLANS,
  TAX_YEARS,
  type TaxYearId,
} from "@/lib/money/take-home/tax-years";
import type { CalculatorState } from "@/lib/money/take-home/url-state";
import InfoTip from "./InfoTip";
import Segmented from "./Segmented";

const TAX_CODE_EXAMPLES = ["1257L", "BR", "0T", "1257L M1", "S1257L"];

function ToggleChip({
  pressed,
  onClick,
  children,
  title,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        pressed
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {pressed && <Check className="h-3 w-3" aria-hidden />}
      {children}
    </button>
  );
}

/**
 * 大半の人には要らないが、要る人には決定的な条件。
 *
 * 学生ローン・税コード・年度・週の労働時間・年金受給年齢。どれも
 * 既定のままで明細と合う人が多いので、最初は畳んでおく。
 * 畳んでいても、何か1つでも既定から変えていれば見出しに件数を出す。
 */
export default function AdvancedOptions({
  state,
  result,
  onChange,
}: {
  state: CalculatorState;
  result: TakeHomeResult;
  onChange: (patch: Partial<CalculatorState>) => void;
}) {
  const codeId = useId();
  const hoursId = useId();
  const code = state.taxCode.trim();
  const year = result.year;

  return (
    <div className="space-y-6">
      {state.per !== "hour" && (
        <div>
          <div className="flex items-center gap-1.5">
            <label htmlFor={hoursId} className="text-sm font-semibold">
              週の労働時間
            </label>
            <InfoTip label="週の労働時間">
              手取りを時給に直すときと、最低賃金を下回っていないかの確認に使います。フルタイムの目安は週37.5〜40時間です。
            </InfoTip>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              id={hoursId}
              type="number"
              inputMode="decimal"
              min={1}
              max={100}
              step={0.5}
              value={state.hoursPerWeek}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (Number.isFinite(next) && next > 0) {
                  onChange({ hoursPerWeek: Math.min(100, next) });
                }
              }}
              className="h-10 w-24 rounded-lg border bg-background px-3 text-base font-semibold tabular-nums outline-none focus:border-foreground/40"
            />
            <span className="text-sm text-muted-foreground">時間</span>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">学生ローン</span>
          <InfoTip label="学生ローンの返済">
            英国の学生ローンは、額面が返済開始ラインを超えた部分の9%（大学院ローンは6%）が給与から引かれます。複数のプランがあるときは、いちばん低いラインを超えた分の9%です。
          </InfoTip>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {STUDENT_LOAN_PLANS.map((plan) => {
            const pressed = state.studentLoans.includes(plan.id);
            const rule = year.studentLoans[plan.id];
            return (
              <ToggleChip
                key={plan.id}
                pressed={pressed}
                title={plan.who}
                onClick={() =>
                  onChange({
                    studentLoans: pressed
                      ? state.studentLoans.filter((p) => p !== plan.id)
                      : [...state.studentLoans, plan.id],
                  })
                }
              >
                {plan.label}
                <span className="tabular-nums opacity-70">
                  {rule ? formatGbp(rule.threshold) : "返済なし"}
                </span>
              </ToggleChip>
            );
          })}
          <ToggleChip
            pressed={state.postgraduateLoan}
            onClick={() => onChange({ postgraduateLoan: !state.postgraduateLoan })}
          >
            大学院ローン
            <span className="tabular-nums opacity-70">
              {formatGbp(year.postgraduateLoan.threshold)}
            </span>
          </ToggleChip>
        </div>
        {state.studentLoans.length > 0 && (
          <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-muted-foreground">
            {STUDENT_LOAN_PLANS.filter((p) => state.studentLoans.includes(p.id)).map((p) => (
              <li key={p.id}>
                <span className="font-medium text-foreground/80">{p.label}</span>：{p.who}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor={codeId} className="flex items-center gap-1.5 text-sm font-semibold">
          税コード
          <span className="text-xs font-normal text-muted-foreground">（給与明細に載っている英数字）</span>
        </label>
        <input
          id={codeId}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
          value={state.taxCode}
          placeholder={`空欄なら自動（${result.taxCodeParsed ? "1257L" : result.taxCodeUsed}）`}
          onChange={(e) => onChange({ taxCode: e.target.value })}
          aria-invalid={code !== "" && !result.taxCodeValid}
          aria-describedby={`${codeId}-status`}
          className={cn(
            "mt-2 h-10 w-full rounded-lg border bg-background px-3 font-mono text-base uppercase tracking-wide outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-foreground/40",
            code !== "" && !result.taxCodeValid && "border-rose-500/70",
          )}
        />
        <p
          id={`${codeId}-status`}
          className={cn(
            "mt-1.5 text-xs leading-relaxed",
            code !== "" && !result.taxCodeValid
              ? "text-rose-700 dark:text-rose-400"
              : "text-muted-foreground",
          )}
        >
          {code === ""
            ? "£100,000を超える額面では、非課税枠の逓減も自動で反映します。"
            : result.taxCodeParsed
              ? describeTaxCode(result.taxCodeParsed)
              : "読み取れない税コードです。いまは自動の税コードで計算しています。"}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TAX_CODE_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onChange({ taxCode: code === example ? "" : example })}
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                code === example
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-semibold">税年度</span>
        <Segmented<TaxYearId>
          name="tax-year"
          legend="税年度"
          size="sm"
          value={state.yearId}
          onChange={(value) => onChange({ yearId: value })}
          className="mt-2"
          options={TAX_YEARS.map((y) => ({
            value: y.id,
            label: `${y.label}年度`,
            sub: `${Number(y.startsOn.slice(0, 4))}年4月6日〜`,
          }))}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={state.overStatePensionAge}
          onChange={(e) => onChange({ overStatePensionAge: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-foreground"
        />
        <span className="text-sm leading-snug">
          State Pension の受給年齢に達している
          <span className="block text-xs text-muted-foreground">
            受給年齢以上の人の給与には National Insurance がかかりません。
          </span>
        </span>
      </label>
    </div>
  );
}

/** 既定から変えている詳細条件の数。畳んだ見出しに出す。 */
export function countAdvancedChanges(state: CalculatorState, defaults: CalculatorState) {
  let count = 0;
  if (state.per !== "hour" && state.hoursPerWeek !== defaults.hoursPerWeek) count++;
  if (state.studentLoans.length > 0 || state.postgraduateLoan) count++;
  if (state.taxCode.trim()) count++;
  if (state.yearId !== defaults.yearId) count++;
  if (state.overStatePensionAge) count++;
  return count;
}
