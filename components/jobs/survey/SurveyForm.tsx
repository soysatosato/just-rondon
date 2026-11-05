// components/jobs/survey/SurveyForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { submitSurvey, type StoreSearchResult } from "@/utils/actions/jobs";
import BotGuardFields from "@/components/form/BotGuardFields";
import StoreSearch, { SelectedStore } from "@/components/jobs/StoreSearch";
import Choice, { Question } from "./Choice";
import DiagnosisPanel from "./DiagnosisPanel";
import { SURVEY_COPY, type StepId, type SurveyLocale } from "./copy";
import type {
  DistributionType,
  JobRole,
  WorkPeriod,
  YesNoUnknown,
} from "@/utils/labels";
import { diagnose } from "@/utils/service-charge";

type ActionState = { ok: true } | { ok: false; message: string };

/* ------------------------------------------------------------------
 * 設問の定義(値の並び。文言は copy.tsx)
 * ---------------------------------------------------------------- */

const WORK_PERIODS: WorkPeriod[] = ["current", "within1y", "1to3y", "over3y"];
const JOB_ROLES: JobRole[] = ["floor", "kitchen", "both", "other"];
const DISTRIBUTIONS: DistributionType[] = ["equal", "gradient", "fixed", "none"];
const YES_NO_UNKNOWN: YesNoUnknown[] = ["yes", "no", "unknown"];

type RateChoice = "12.5" | "15" | "10" | "other" | "unknown";

/**
 * 回答の流れ。
 *
 * - 通常: 6ステップ。徴収していない職場では「分配の中身」を飛ばす。
 * - 短縮版(quick): 2店舗目以降。店名・時期・サービスチャージの有無と分配だけを
 *   聞き、詳しい設問と自由記述は出さない。1人が働いた店をまとめて答えやすくする。
 */
function stepsFor(quick: boolean, collected: "yes" | "no" | null): StepId[] {
  if (quick) return [1, 2, 3, 6];
  return collected === "no" ? [1, 2, 3, 5, 6] : [1, 2, 3, 4, 5, 6];
}

/* ------------------------------------------------------------------ */

function SubmitButton({
  disabled,
  label,
  pendingLabel,
}: {
  disabled: boolean;
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || disabled}
      className="flex-1"
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}

export default function SurveyForm({
  hourlyMedian,
  responseCount,
  storeCount,
  initialStore,
  initialQuery,
  locale = "ja",
  quick = false,
  initialJobRole,
}: {
  hourlyMedian: number | null;
  responseCount: number;
  storeCount: number;
  /** 店舗ページやダッシュボードで選んできた店舗。あれば2問目から始める。 */
  initialStore?: StoreSearchResult | null;
  /** ダッシュボードで打ちかけた店名。 */
  initialQuery?: string;
  locale?: SurveyLocale;
  /** 2店舗目以降の短縮版。 */
  quick?: boolean;
  /** 短縮版で、1店舗目に答えた職種。あれば聞き直さない。 */
  initialJobRole?: JobRole | null;
}) {
  const copy = SURVEY_COPY[locale];

  const [state, action] = useFormState<ActionState, FormData>(submitSurvey, {
    ok: true,
  });

  const [store, setStore] = useState<SelectedStore | null>(
    initialStore ? { mode: "matched", store: initialStore } : null,
  );
  const [workPeriod, setWorkPeriod] = useState<WorkPeriod | null>(null);
  const [jobRole, setJobRole] = useState<JobRole | null>(
    initialJobRole ?? null,
  );
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
  // 「残りの設問を飛ばして判定へ」を押したか。判定の画面で、戻って答える道を出す。
  const [skipped, setSkipped] = useState(false);

  // 店舗が決まって来た人に、同じ店を探し直させない。
  const [currentStep, setCurrentStep] = useState<StepId>(initialStore ? 2 : 1);

  const steps = useMemo(() => stepsFor(quick, collected), [quick, collected]);

  // 徴収していない職場には、分配の中身を聞く意味がない。
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

  // 必須の3問が済んだあとは、任意の設問を残したまま判定へ進める。
  // 送る前に判定を見られる約束(SURVEY_PROMISES の preview)はそのまま守る。
  const canSkipToResult =
    !quick && (currentStep === 3 || currentStep === 4) && !nextDisabled;

  function goTo(step: StepId) {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goNext() {
    if (!isLastStep) goTo(steps[stepIndex + 1]);
  }
  function goBack() {
    if (!isFirstStep) goTo(steps[stepIndex - 1]);
  }
  function skipToResult() {
    setSkipped(true);
    goTo(6);
  }

  function stepClass(n: StepId) {
    return cn("space-y-8", currentStep !== n && "hidden");
  }

  const storeName =
    store?.mode === "matched" ? store.store.name : store?.name ?? null;

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
      diagnose(
        {
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
        },
        locale,
      ),
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
      locale,
    ],
  );

  // 飛ばした詳しい設問が、判定を変えうるまま空になっているか。
  const detailsMissing =
    skipped &&
    collected === "yes" &&
    writtenPolicy === null &&
    onPayslip === null &&
    kitchenIncluded === null;

  const workPeriodOptions = WORK_PERIODS.map((value) => ({
    value,
    label: copy.workPeriod.labels[value],
    note: value === "over3y" ? copy.workPeriod.over3yNote : undefined,
  }));
  const jobRoleOptions = JOB_ROLES.map((value) => ({
    value,
    label: copy.jobRole.labels[value],
  }));
  const distributionOptions = DISTRIBUTIONS.map((value) => ({
    value,
    label: copy.distribution.labels[value],
    note: copy.distribution.legal[value],
    warn: value === "fixed" || value === "none",
  }));
  const yesNoUnknownOptions = YES_NO_UNKNOWN.map((value) => ({
    value,
    label: copy.yesNoUnknown[value],
  }));
  const rateOptions: { value: RateChoice; label: string }[] = [
    { value: "12.5", label: "12.5%" },
    { value: "15", label: "15%" },
    { value: "10", label: "10%" },
    { value: "other", label: copy.rate.other },
    { value: "unknown", label: copy.rate.unknown },
  ];

  // 短縮版で1店舗目の職種を引き継いだときは、聞き直さずにそのまま送る。
  const roleCarried = quick && initialJobRole != null;

  return (
    <>
      {/* 進捗 */}
      <div className="space-y-2">
        <ol className="flex items-center gap-1.5">
          {steps.map((id, i) => {
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
                  {copy.steps[id]}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-muted-foreground sm:hidden">
          {copy.stepCounter(
            stepIndex + 1,
            steps.length,
            copy.steps[currentStep],
          )}
        </p>
      </div>

      {/* どの店について答えているか。2問目以降は店舗欄が見えないので、ここに残す。 */}
      {storeName && currentStep !== 1 && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5">
          <p className="min-w-0 truncate text-sm">
            <span className="text-muted-foreground">{copy.answeringAbout}</span>
            <span className="font-medium text-foreground">{storeName}</span>
          </p>
          <button
            type="button"
            onClick={() => goTo(1)}
            className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          >
            {copy.change}
          </button>
        </div>
      )}

      {showError && !state.ok && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>{copy.errorTitle}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="mt-8">
        <BotGuardFields />
        {/* 完了画面と、エラーの文言の言語を決める。 */}
        <input type="hidden" name="locale" value={locale} />

        {/* 1. 店舗 ------------------------------------------------ */}
        <section className={stepClass(1)}>
          <Question
            label={copy.store.label}
            hint={copy.store.hint(storeCount, responseCount)}
          >
            <StoreSearch
              initialStore={initialStore ?? undefined}
              initialQuery={initialQuery}
              copy={copy.storeSearch}
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
          <Question label={copy.workPeriod.label} hint={copy.workPeriod.hint}>
            <Choice
              name="workPeriod"
              value={workPeriod}
              onChange={setWorkPeriod}
              options={workPeriodOptions}
            />
          </Question>

          {roleCarried ? (
            <input type="hidden" name="jobRole" value={initialJobRole ?? ""} />
          ) : (
            <>
              <Separator />

              <Question
                label={copy.jobRole.label}
                hint={copy.jobRole.hint}
                optional
                optionalLabel={copy.optional}
              >
                <Choice
                  name="jobRole"
                  value={jobRole}
                  onChange={setJobRole}
                  options={jobRoleOptions}
                  columns={2}
                />
              </Question>
            </>
          )}
        </section>

        {/* 3. サービスチャージ ------------------------------------ */}
        <section className={stepClass(3)}>
          <Question label={copy.collected.label}>
            <Choice
              name="collected"
              value={collected}
              onChange={setCollected}
              options={[
                { value: "yes", label: copy.collected.yes },
                {
                  value: "no",
                  label: copy.collected.no,
                  note: copy.collected.noNote,
                },
              ]}
              columns={2}
            />
          </Question>

          <div className={cn("space-y-8", collected !== "yes" && "hidden")}>
            <Separator />

            <Question
              label={copy.rate.label}
              hint={copy.rate.hint}
              optional
              optionalLabel={copy.optional}
            >
              <Choice
                name="rateChoice"
                value={rateChoice}
                onChange={setRateChoice}
                options={rateOptions}
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
                    placeholder="13"
                    aria-label={copy.rate.aria}
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
              label={copy.distribution.label}
              hint={copy.distribution.hint}
            >
              <Choice
                name="distribution"
                value={distribution}
                onChange={setDistribution}
                options={distributionOptions}
              />

              <div className="mt-3 rounded-lg border border-border/70 bg-muted/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
                {copy.distribution.law}
              </div>
            </Question>
          </div>
        </section>

        {/* 4. 分配の中身 ------------------------------------------ */}
        <section className={stepClass(4)}>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            {copy.detailsIntro}
          </div>

          <Question
            label={copy.writtenPolicy.label}
            hint={copy.writtenPolicy.hint}
          >
            <Choice
              name="writtenPolicy"
              value={writtenPolicy}
              onChange={setWrittenPolicy}
              options={yesNoUnknownOptions}
              columns={2}
            />
          </Question>

          <Separator />

          <Question label={copy.onPayslip.label} hint={copy.onPayslip.hint}>
            <Choice
              name="onPayslip"
              value={onPayslip}
              onChange={setOnPayslip}
              options={yesNoUnknownOptions}
              columns={2}
            />
          </Question>

          <Separator />

          <Question label={copy.kitchen.label} hint={copy.kitchen.hint}>
            <Choice
              name="kitchenIncluded"
              value={kitchenIncluded}
              onChange={setKitchenIncluded}
              options={yesNoUnknownOptions}
              columns={2}
            />
          </Question>

          <Separator />

          <Question
            label={copy.amount.label}
            hint={copy.amount.hint}
            optional
            optionalLabel={copy.optional}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="amountValue"
                  className="text-xs text-muted-foreground"
                >
                  {copy.amount.perMonthLabel}
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
                    placeholder={copy.amount.amountPlaceholder}
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {copy.amount.perMonth}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="monthlyHours"
                  className="text-xs text-muted-foreground"
                >
                  {copy.amount.hoursLabel}
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
                    placeholder={copy.amount.hoursPlaceholder}
                    value={monthlyHours}
                    onChange={(e) => setMonthlyHours(e.target.value)}
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {copy.amount.hoursUnit}
                  </span>
                </div>
              </div>
            </div>

            {diagnosis.hourly !== null && (
              <p className="mt-3 rounded-lg bg-muted/60 px-3.5 py-3 text-sm tabular-nums">
                {copy.amount.hourlySentence(
                  diagnosis.hourly.toFixed(2),
                  hourlyMedian != null ? hourlyMedian.toFixed(2) : null,
                )}
              </p>
            )}
          </Question>
        </section>

        {/* 5. 自由記述 -------------------------------------------- */}
        <section className={stepClass(5)}>
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            {copy.commentsIntro}
          </div>

          <Question
            label={copy.comments.serviceCharge.label}
            hint={copy.comments.serviceCharge.hint}
            optional
            optionalLabel={copy.optional}
          >
            <Textarea
              name="serviceChargeComment"
              rows={5}
              maxLength={1000}
              placeholder={copy.comments.serviceCharge.placeholder}
            />
          </Question>

          <Question
            label={copy.comments.meal.label}
            hint={copy.comments.meal.hint}
            optional
            optionalLabel={copy.optional}
          >
            <Textarea
              name="mealComment"
              rows={4}
              maxLength={1000}
              placeholder={copy.comments.meal.placeholder}
            />
          </Question>

          <Question
            label={copy.comments.general.label}
            hint={copy.comments.general.hint}
            optional
            optionalLabel={copy.optional}
          >
            <Textarea
              name="generalComment"
              rows={5}
              maxLength={1000}
              placeholder={copy.comments.general.placeholder}
            />
          </Question>
        </section>

        {/* 6. 診断と送信 ------------------------------------------ */}
        <section className={stepClass(6)}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.result.kicker}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {copy.result.sub}
            </p>
          </div>

          {detailsMissing && (
            <div className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {copy.result.skippedNote}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 self-start sm:self-auto"
                onClick={() => goTo(4)}
              >
                {copy.result.answerDetails}
              </Button>
            </div>
          )}

          <DiagnosisPanel
            diagnosis={diagnosis}
            hourlyMedian={hourlyMedian}
            locale={locale}
          />

          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">
              {copy.result.whatHappensTitle}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {copy.result.whatHappens.map((line) => (
                <li key={line}>・{line}</li>
              ))}
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
                {copy.nav.back}
              </Button>
            )}

            {isLastStep ? (
              <SubmitButton
                disabled={!store}
                label={copy.nav.send}
                pendingLabel={copy.nav.sending}
              />
            ) : (
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={nextDisabled}
                onClick={goNext}
              >
                {copy.nav.next}
              </Button>
            )}
          </div>

          {canSkipToResult && (
            <button
              type="button"
              onClick={skipToResult}
              className="mt-2.5 w-full text-center text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              {copy.nav.skipToResult}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
