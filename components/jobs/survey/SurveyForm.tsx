// components/jobs/survey/SurveyForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { submitSurvey } from "@/utils/actions/jobs";
import StoreSearch, { SelectedStore } from "@/components/jobs/StoreSearch";
import Choice, { Question } from "./Choice";
import DiagnosisPanel from "./DiagnosisPanel";
import {
  DISTRIBUTION_LABEL,
  DISTRIBUTION_LEGAL_NOTE,
  JOB_ROLE_LABEL,
  WORK_PERIOD_LABEL,
  type DistributionType,
  type JobRole,
  type WorkPeriod,
  type YesNoUnknown,
} from "@/utils/labels";
import { diagnose } from "@/utils/service-charge";

type ActionState = { ok: true } | { ok: false; message: string };

/* ------------------------------------------------------------------
 * 設問の定義
 * ---------------------------------------------------------------- */

const WORK_PERIOD_OPTIONS = (
  ["current", "within1y", "1to3y", "over3y"] as WorkPeriod[]
).map((value) => ({
  value,
  label: WORK_PERIOD_LABEL[value],
  note:
    value === "over3y"
      ? "全額分配の義務が始まったのは2024年10月1日です"
      : undefined,
}));

const JOB_ROLE_OPTIONS = (
  ["floor", "kitchen", "both", "other"] as JobRole[]
).map((value) => ({ value, label: JOB_ROLE_LABEL[value] }));

const DISTRIBUTION_OPTIONS = (
  ["equal", "gradient", "fixed", "none"] as DistributionType[]
).map((value) => ({
  value,
  label: DISTRIBUTION_LABEL[value],
  note: DISTRIBUTION_LEGAL_NOTE[value],
  warn: value === "fixed" || value === "none",
}));

const YES_NO_UNKNOWN_OPTIONS: {
  value: YesNoUnknown;
  label: string;
  note?: string;
}[] = [
  { value: "yes", label: "はい" },
  { value: "no", label: "いいえ" },
  { value: "unknown", label: "わからない" },
];

type RateChoice = "12.5" | "15" | "10" | "other" | "unknown";

const RATE_OPTIONS: { value: RateChoice; label: string }[] = [
  { value: "12.5", label: "12.5%" },
  { value: "15", label: "15%" },
  { value: "10", label: "10%" },
  { value: "other", label: "その他の料率" },
  { value: "unknown", label: "わからない" },
];

const STEPS = [
  { id: 1, title: "店舗" },
  { id: 2, title: "働き方" },
  { id: 3, title: "サービスチャージ" },
  { id: 4, title: "分配の中身" },
  { id: 5, title: "自由記述" },
  { id: 6, title: "診断と送信" },
] as const;

/* ------------------------------------------------------------------ */

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || disabled}
      className="flex-1"
    >
      {pending ? "送信中..." : "この内容で送信する"}
    </Button>
  );
}

export default function SurveyForm({
  hourlyMedian,
  responseCount,
  storeCount,
}: {
  hourlyMedian: number | null;
  responseCount: number;
  storeCount: number;
}) {
  const [state, action] = useFormState<ActionState, FormData>(submitSurvey, {
    ok: true,
  });

  const [store, setStore] = useState<SelectedStore | null>(null);
  const [workPeriod, setWorkPeriod] = useState<WorkPeriod | null>(null);
  const [jobRole, setJobRole] = useState<JobRole | null>(null);
  const [collected, setCollected] = useState<"yes" | "no" | null>(null);
  const [rateChoice, setRateChoice] = useState<RateChoice | null>(null);
  const [rateOther, setRateOther] = useState("");
  const [distribution, setDistribution] = useState<DistributionType | null>(
    null,
  );
  const [kitchenIncluded, setKitchenIncluded] = useState<YesNoUnknown | null>(
    null,
  );
  const [onPayslip, setOnPayslip] = useState<YesNoUnknown | null>(null);
  const [writtenPolicy, setWrittenPolicy] = useState<YesNoUnknown | null>(null);
  const [amountValue, setAmountValue] = useState("");
  const [monthlyHours, setMonthlyHours] = useState("");
  const [showError, setShowError] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);

  // 徴収していない職場には、分配の中身を聞く意味がない。
  const steps = useMemo(
    () => (collected === "no" ? [1, 2, 3, 5, 6] : [1, 2, 3, 4, 5, 6]),
    [collected],
  );

  useEffect(() => {
    if (currentStep === 4 && collected === "no") setCurrentStep(5);
  }, [collected, currentStep]);

  const stepIndex = steps.indexOf(currentStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const nextDisabled = useMemo(() => {
    if (currentStep === 1) return !store;
    if (currentStep === 2) return workPeriod === null;
    if (currentStep === 3) return collected === null;
    return false;
  }, [currentStep, store, workPeriod, collected]);

  function goNext() {
    if (!isLastStep) {
      setCurrentStep(steps[stepIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function goBack() {
    if (!isFirstStep) {
      setCurrentStep(steps[stepIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function stepClass(n: number) {
    return cn("space-y-8", currentStep !== n && "hidden");
  }

  const amountNumber = amountValue === "" ? null : Number(amountValue);
  const hoursNumber = monthlyHours === "" ? null : Number(monthlyHours);

  const resolvedRate =
    rateChoice === "other"
      ? rateOther === "" || Number.isNaN(Number(rateOther))
        ? ""
        : rateOther
      : rateChoice && rateChoice !== "unknown"
        ? rateChoice
        : "";

  const diagnosis = useMemo(
    () =>
      diagnose({
        collected,
        distribution: collected === "no" ? null : distribution,
        kitchenIncluded: collected === "no" ? null : kitchenIncluded,
        onPayslip: collected === "no" ? null : onPayslip,
        writtenPolicy: collected === "no" ? null : writtenPolicy,
        workPeriod,
        jobRole,
        monthlyAmount:
          amountNumber !== null && !Number.isNaN(amountNumber)
            ? amountNumber
            : null,
        monthlyHours:
          hoursNumber !== null && !Number.isNaN(hoursNumber)
            ? hoursNumber
            : null,
      }),
    [
      collected,
      distribution,
      kitchenIncluded,
      onPayslip,
      writtenPolicy,
      workPeriod,
      jobRole,
      amountNumber,
      hoursNumber,
    ],
  );

  return (
    <>
      {/* 進捗 */}
      <div className="space-y-2">
        <ol className="flex items-center gap-1.5">
          {steps.map((id, i) => {
            const step = STEPS.find((s) => s.id === id)!;
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <li key={id} className="flex-1">
                <div
                  className={cn(
                    "h-1 rounded-full transition",
                    done || active ? "bg-foreground" : "bg-muted",
                  )}
                />
                <p
                  className={cn(
                    "mt-1.5 hidden text-[0.6875rem] leading-none sm:block",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted-foreground sm:hidden">
          ステップ {stepIndex + 1} / {steps.length}：
          {STEPS.find((s) => s.id === currentStep)?.title}
        </p>
      </div>

      {showError && !state.ok && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>入力内容をご確認ください</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="mt-8">
        {/* 1. 店舗 ------------------------------------------------ */}
        <section className={stepClass(1)}>
          <Question
            label="どの店舗について答えますか？"
            hint={`これまでに ${storeCount} 店舗・${responseCount} 件の回答が集まっています。候補に出てこない場合は手入力もできます。`}
          >
            <StoreSearch
              onSelect={(selection) => {
                setStore(selection);
                setShowError(false);
              }}
            />
          </Question>

          {store?.mode === "matched" && (
            <>
              <input type="hidden" name="storePlaceId" value={store.store.id} />
              <input type="hidden" name="storeName" value={store.store.name} />
              <input
                type="hidden"
                name="storeAddress"
                value={store.store.address}
              />
              <input type="hidden" name="lat" value={store.store.lat ?? ""} />
              <input type="hidden" name="lng" value={store.store.lng ?? ""} />
              <input
                type="hidden"
                name="borough"
                value={store.store.borough ?? ""}
              />
              <input
                type="hidden"
                name="postcode"
                value={store.store.postcode ?? ""}
              />
            </>
          )}

          {store?.mode === "manual" && (
            <>
              <input type="hidden" name="manualStoreName" value={store.name} />
              <input
                type="hidden"
                name="manualStoreAddress"
                value={store.address}
              />
            </>
          )}
        </section>

        {/* 2. 働き方 ---------------------------------------------- */}
        <section className={stepClass(2)}>
          <Question
            label="その職場で働いていたのはいつですか？"
            hint="サービスチャージの全額分配が義務になったのは2024年10月1日です。いつの話かによって、当てはまる法律が変わります。"
          >
            <Choice
              name="workPeriod"
              value={workPeriod}
              onChange={setWorkPeriod}
              options={WORK_PERIOD_OPTIONS}
            />
          </Question>

          <Separator />

          <Question
            label="どの職種で働いていましたか？"
            hint="「キッチンには分配されない」という証言が繰り返し寄せられています。どちら側から見た話かによって、意味が変わります。"
            optional
          >
            <Choice
              name="jobRole"
              value={jobRole}
              onChange={setJobRole}
              options={JOB_ROLE_OPTIONS}
              columns={2}
            />
          </Question>
        </section>

        {/* 3. サービスチャージ ------------------------------------ */}
        <section className={stepClass(3)}>
          <Question label="この店舗は、お客様からサービスチャージを徴収していますか？">
            <Choice
              name="collected"
              value={collected}
              onChange={setCollected}
              options={[
                { value: "yes", label: "徴収している" },
                {
                  value: "no",
                  label: "徴収していない",
                  note: "この先の分配についての設問はスキップされます",
                },
              ]}
              columns={2}
            />
          </Question>

          <div className={cn("space-y-8", collected !== "yes" && "hidden")}>
            <Separator />

            <Question
              label="料率は何％ですか？"
              hint="レシートの「service charge」の行に書かれています。近年は15%を掲げる店も増えています。"
              optional
            >
              <Choice
                name="rateChoice"
                value={rateChoice}
                onChange={setRateChoice}
                options={RATE_OPTIONS}
                columns={2}
              />
              {rateChoice === "other" && (
                <div className="mt-2 flex max-w-[12rem] items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="0.1"
                    value={rateOther}
                    onChange={(e) => setRateOther(e.target.value)}
                    placeholder="例）13"
                    aria-label="サービスチャージの料率"
                  />
                  <span className="text-sm text-muted-foreground">％</span>
                </div>
              )}
              <input
                type="hidden"
                name="chargeRatePercent"
                value={resolvedRate}
              />
            </Question>

            <Separator />

            <Question
              label="集めたサービスチャージは、どう分配されていますか？"
              hint="他のスタッフから聞いた話でも構いません。実際に受け取っていなくても、分かる範囲でお答えください。"
            >
              <Choice
                name="distribution"
                value={distribution}
                onChange={setDistribution}
                options={DISTRIBUTION_OPTIONS}
              />

              <div className="mt-3 rounded-lg border border-border/70 bg-muted/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    Employment (Allocation of Tips) Act 2023
                  </span>
                  （2024年10月1日施行）により、チップとサービスチャージは
                  <span className="font-medium text-foreground">
                    全額が働いた人のもの
                  </span>
                  と定められ、雇用主が税金・国民保険料以外を差し引くことは違法です。
                </p>
                <p className="mt-2">
                  「時給に固定額で上乗せ」は、上乗せという方式そのものが違法なのではなく、
                  <span className="font-medium text-foreground">
                    店が集めた総額が全額スタッフに渡っているか
                  </span>
                  が分かれ目になります。
                </p>
                <p className="mt-2">
                  <Link
                    href="/jobs/service-charges"
                    target="_blank"
                    className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
                  >
                    サービスチャージの法律を読む ↗
                  </Link>
                </p>
              </div>
            </Question>
          </div>
        </section>

        {/* 4. 分配の中身 ------------------------------------------ */}
        <section className={stepClass(4)}>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            ここから先は、雇用主に義務づけられていることを、働く人の側から確認する設問です。
            分からない項目は「わからない」で構いません。
          </div>

          <Question
            label="分配のルールを書いた文書（チップポリシー）を見たことがありますか？"
            hint="分配の責任者・分配方法・サービスチャージの扱いを書面にし、働く人が読める状態にしておくことは、2024年10月から雇用主の義務です。"
          >
            <Choice
              name="writtenPolicy"
              value={writtenPolicy}
              onChange={setWrittenPolicy}
              options={YES_NO_UNKNOWN_OPTIONS}
              columns={2}
            />
          </Question>

          <Separator />

          <Question
            label="給与明細に、サービスチャージが別項目として載っていますか？"
            hint="別項目で出ていれば、いくら受け取ったかを自分で確認できます。従業員には過去3年分の支払い記録を閲覧する権利もあります。"
          >
            <Choice
              name="onPayslip"
              value={onPayslip}
              onChange={setOnPayslip}
              options={YES_NO_UNKNOWN_OPTIONS}
              columns={2}
            />
          </Question>

          <Separator />

          <Question
            label="キッチンスタッフにも分配されていますか？"
            hint="分配の対象は「その職場で働く人」で、フロアに限られません。一律の除外は公平性の観点から問題になり得ます。"
          >
            <Choice
              name="kitchenIncluded"
              value={kitchenIncluded}
              onChange={setKitchenIncluded}
              options={YES_NO_UNKNOWN_OPTIONS}
              columns={2}
            />
          </Question>

          <Separator />

          <Question
            label="あなたが実際に受け取っている額を教えてください"
            hint="店舗全体の総額ではなく、あなた個人が1ヶ月に受け取っている概算です。勤務時間もあわせて答えていただくと、他店と比べられる「時給換算」が出せます。"
            optional
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="amountValue"
                  className="text-xs text-muted-foreground"
                >
                  1ヶ月に受け取る額
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">£</span>
                  <Input
                    id="amountValue"
                    name="amountValue"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    placeholder="例）250"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">
                    / 月
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="monthlyHours"
                  className="text-xs text-muted-foreground"
                >
                  1ヶ月の勤務時間（概算）
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="monthlyHours"
                    name="monthlyHours"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={744}
                    step="1"
                    placeholder="例）160"
                    value={monthlyHours}
                    onChange={(e) => setMonthlyHours(e.target.value)}
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">
                    時間 / 月
                  </span>
                </div>
              </div>
            </div>

            {diagnosis.hourly !== null && (
              <p className="mt-3 rounded-lg bg-muted/60 px-3.5 py-3 text-sm">
                サービスチャージは時給換算で{" "}
                <span className="font-semibold tabular-nums">
                  £{diagnosis.hourly.toFixed(2)}
                </span>{" "}
                です。
                {hourlyMedian != null && (
                  <>
                    {" "}
                    この調査の中央値は{" "}
                    <span className="font-semibold tabular-nums">
                      £{hourlyMedian.toFixed(2)}
                    </span>{" "}
                    です。
                  </>
                )}
              </p>
            )}
          </Question>
        </section>

        {/* 5. 自由記述 -------------------------------------------- */}
        <section className={stepClass(5)}>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            集計の数字より、ここに書かれた具体的な話のほうが読まれています。
            <span className="font-medium text-foreground">
              個人が特定される情報は書かないでください。
            </span>
            すべて任意です。
          </div>

          <Question
            label="サービスチャージについて"
            hint="分配の実態、店側の説明、質問したときの反応など。"
            optional
          >
            <Textarea
              name="serviceChargeComment"
              rows={5}
              maxLength={1000}
              placeholder="例）フロアスタッフのみで分配。キッチンには渡っていない。総額を聞いたが教えてもらえなかった。"
            />
          </Question>

          <Question
            label="賄いについて"
            hint="回数、内容、提供されない食材、ドリンクの有無など。"
            optional
          >
            <Textarea
              name="mealComment"
              rows={4}
              maxLength={1000}
              placeholder="例）1日1回、日替わりで選べない。ドリンクは水とお茶のみ。"
            />
          </Question>

          <Question
            label="その他（職場について）"
            hint="シフト、残業、休憩、人間関係、ビザサポートなど。良い点も書いてください。"
            optional
          >
            <Textarea
              name="generalComment"
              rows={5}
              maxLength={1000}
              placeholder="個人が特定される情報は入力しないでください。"
            />
          </Question>
        </section>

        {/* 6. 診断と送信 ------------------------------------------ */}
        <section className={stepClass(6)}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              あなたの回答からの判定
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              送信する前に、いただいた回答を法律に照らして整理しました。
              送信せずにこのまま閉じても、この判定は変わりません。
            </p>
          </div>

          <DiagnosisPanel diagnosis={diagnosis} hourlyMedian={hourlyMedian} />

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">
              送信すると、どうなりますか
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              <li>
                ・店舗名とあわせて集計され、ダッシュボードに匿名で反映されます。
              </li>
              <li>
                ・回答者を特定する情報（氏名・連絡先・IPアドレス）は保存していません。
              </li>
              <li>
                ・同じ店で働く次の人が、面接を受ける前に実態を知ることができます。
              </li>
            </ul>
          </div>
        </section>

        {/* ナビゲーション ----------------------------------------- */}
        <div className="sticky bottom-0 -mx-4 mt-8 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-8">
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={goBack}
              >
                戻る
              </Button>
            )}

            {isLastStep ? (
              <SubmitButton disabled={!store} />
            ) : (
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={nextDisabled}
                onClick={goNext}
              >
                次へ
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
