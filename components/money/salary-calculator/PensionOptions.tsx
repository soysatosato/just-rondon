"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PensionBasis, PensionMethod } from "@/lib/money/take-home/calculate";
import { formatGbp } from "@/lib/money/take-home/format";
import type { TaxYear } from "@/lib/money/take-home/tax-years";
import type { CalculatorState, PensionChoice } from "@/lib/money/take-home/url-state";
import InfoTip from "./InfoTip";
import Segmented from "./Segmented";

function PercentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="mt-1 flex items-center rounded-lg border bg-background px-3 focus-within:border-foreground/40">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.5}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(Number.isFinite(next) ? Math.min(100, Math.max(0, next)) : 0);
          }}
          className="h-10 w-full min-w-0 bg-transparent text-base font-semibold tabular-nums outline-none"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </span>
    </label>
  );
}

/**
 * 職場年金の入力。
 *
 * 「なし / 自動加入の最低額 / 自分で設定」の3択にしてある。拠出率と方式を
 * 最初から全部並べると、制度を知らない読者はどれを選べばいいか分からず
 * 手が止まる。大半の人は自動加入の最低額のままで明細と合うので、
 * 細かい指定は「自分で設定」を選んだ人にだけ開く。
 */
export default function PensionOptions({
  state,
  year,
  onChange,
}: {
  state: CalculatorState;
  year: TaxYear;
  onChange: (patch: Partial<CalculatorState>) => void;
}) {
  const { pension } = year;

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">職場年金</span>
        <InfoTip label="職場年金（workplace pension）">
          年収{formatGbp(pension.earningsTrigger)}以上・22歳以上の従業員は、会社が自動で年金に加入させます。最低拠出は、年収のうち
          {formatGbp(pension.qualifyingLower)}〜{formatGbp(pension.qualifyingUpper)}
          の部分に対して本人{pension.employeeMinimumPercent}%（税の還付込み）、会社
          {pension.employerMinimumPercent}%です。
        </InfoTip>
      </div>

      <Segmented<PensionChoice>
        name="pension-choice"
        legend="職場年金"
        value={state.pension}
        onChange={(value) => onChange({ pension: value })}
        className="mt-2"
        options={[
          { value: "none", label: "引かない" },
          {
            value: "auto",
            label: "最低額",
            sub: `本人${pension.employeeMinimumPercent}%`,
          },
          { value: "custom", label: "自分で設定" },
        ]}
      />

      <AnimatePresence initial={false}>
        {state.pension === "custom" && (
          <motion.div
            key="custom"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <PercentInput
                  label="本人の拠出率"
                  value={state.employeePercent}
                  onChange={(value) => onChange({ employeePercent: value })}
                />
                <PercentInput
                  label="会社の拠出率"
                  value={state.employerPercent}
                  onChange={(value) => onChange({ employerPercent: value })}
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">引かれ方</span>
                  <InfoTip label="年金の引かれ方">
                    <strong className="font-semibold text-foreground">RAS</strong>
                    ：税引き後の給与から引かれ、年金会社が20%分の税の還付を足します（Nest など）。明細に載るのは拠出額の80%です。
                    <br />
                    <strong className="font-semibold text-foreground">Net pay</strong>
                    ：所得税を計算する前の給与から引かれます。所得税は減りますが NI は減りません。
                    <br />
                    <strong className="font-semibold text-foreground">給与犠牲</strong>
                    ：契約上の給与を減らし、その分を会社が年金に入れます。所得税と NI の両方が減ります。
                  </InfoTip>
                </div>
                <Segmented<PensionMethod>
                  name="pension-method"
                  legend="年金の引かれ方"
                  size="sm"
                  value={state.pensionMethod}
                  onChange={(value) => onChange({ pensionMethod: value })}
                  className="mt-1.5"
                  options={[
                    { value: "relief-at-source", label: "RAS", sub: "Nest など" },
                    { value: "net-pay", label: "Net pay", sub: "税の前" },
                    { value: "salary-sacrifice", label: "給与犠牲", sub: "税と NI の前" },
                  ]}
                />
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  拠出率をかける額
                </span>
                <Segmented<PensionBasis>
                  name="pension-basis"
                  legend="拠出率をかける額"
                  size="sm"
                  value={state.pensionBasis}
                  onChange={(value) => onChange({ pensionBasis: value })}
                  className="mt-1.5"
                  options={[
                    {
                      value: "qualifying",
                      label: "一部分",
                      sub: `${formatGbp(pension.qualifyingLower)}〜${formatGbp(
                        pension.qualifyingUpper,
                      )}`,
                    },
                    { value: "total", label: "給与の全額", sub: "会社による" },
                  ]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
