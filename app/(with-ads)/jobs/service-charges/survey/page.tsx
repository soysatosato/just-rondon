// app/(with-ads)/jobs/service-charges/survey/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { submitSurvey } from "@/utils/actions/jobs";
import PlaceAutocomplete, {
  SelectedPlace,
} from "@/components/jobs/PlaceAutocomplete";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MEAL_RESTRICTION_LABEL,
  MEAL_DRINK_LABEL,
  SHIFT_SCHEDULE_LABEL,
  VISA_SUPPORT_LABEL,
  MANAGEMENT_PRESENCE_LABEL,
  WORK_ATMOSPHERE_LABEL,
  ETHNICITY_RATIO_LABEL,
  type MealDrink,
  type ShiftSchedule,
  type VisaSupport,
  type ManagementPresence,
  type WorkAtmosphere,
  type EthnicityRatio,
} from "@/utils/labels";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending || disabled}
      className="flex-1"
    >
      {pending ? "送信中..." : "この内容で送信"}
    </Button>
  );
}

type ActionState = { ok: true } | { ok: false; message: string };

const STEP_TITLES: Record<number, string> = {
  1: "店舗を選ぶ",
  2: "サービスチャージの有無",
  3: "分配方法・金額",
  4: "コメント",
  5: "追加の質問",
};

export default function SurveyPage() {
  const [state, action] = useFormState<ActionState, FormData>(submitSurvey, {
    ok: true,
  });
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string>("");

  const [collected, setCollected] = useState<"yes" | "no" | null>(null);

  const [amountValue, setAmountValue] = useState<string>("");
  const needsPeriod = useMemo(() => amountValue.trim() !== "", [amountValue]);
  const [amountPeriod, setAmountPeriod] = useState<"weekly" | "monthly" | null>(
    null,
  );
  const amountMismatch = useMemo(
    () =>
      collected === "yes" &&
      (amountValue.trim() !== "") !== (amountPeriod !== null),
    [collected, amountValue, amountPeriod],
  );
  const [showError, setShowError] = useState(true);
  const [showMealOther, setShowMealOther] = useState(false);
  const [mealRestrictions, setMealRestrictions] = useState<string[]>([]);
  const [placeMeta, setPlaceMeta] = useState<{
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    borough?: string;
    postcode?: string;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!needsPeriod) setAmountPeriod(null);
  }, [needsPeriod]);

  const steps = useMemo(
    () => (collected === "no" ? [1, 2, 4, 5] : [1, 2, 3, 4, 5]),
    [collected],
  );

  useEffect(() => {
    if (currentStep === 3 && collected === "no") {
      setCurrentStep(4);
    }
  }, [collected, currentStep]);

  const stepIndex = steps.indexOf(currentStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const nextDisabled = useMemo(() => {
    if (currentStep === 1) return !placeId;
    if (currentStep === 2) return collected === null;
    if (currentStep === 3) return amountMismatch;
    return false;
  }, [currentStep, placeId, collected, amountMismatch]);

  function goNext() {
    if (!isLastStep) setCurrentStep(steps[stepIndex + 1]);
  }
  function goBack() {
    if (!isFirstStep) setCurrentStep(steps[stepIndex - 1]);
  }

  function toggleMealRestriction(value: string, checked: boolean) {
    setMealRestrictions((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value),
    );
  }

  function stepClass(n: number) {
    return cn("space-y-6", currentStep !== n && "hidden");
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-4 sm:py-8">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl md:text-2xl">
              ロンドン日本食レストランに関する実態調査
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              個人が特定される情報は入力しないでください。
            </p>

            <div className="space-y-1.5 pt-2">
              <p className="text-xs text-muted-foreground">
                ステップ {stepIndex + 1} / {steps.length}：
                {STEP_TITLES[currentStep]}
                {currentStep === 5 && (
                  <span className="ml-1 text-muted-foreground/70">
                    （すべて任意）
                  </span>
                )}
              </p>
              <Progress value={((stepIndex + 1) / steps.length) * 100} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {showError && !state.ok && (
              <Alert variant="destructive">
                <AlertTitle>入力内容をご確認ください</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <form action={action} className="space-y-6">
              {/* ステップ1: 店舗（Google Places Autocomplete で place_id を取得） */}
              <section className={stepClass(1)}>
                <PlaceAutocomplete
                  onSelect={(place: SelectedPlace) => {
                    setPlaceId(place.placeId);
                    setPlaceLabel(`${place.name} / ${place.address}`);
                    setPlaceMeta({
                      name: place.name,
                      address: place.address,
                      lat: place.lat,
                      lng: place.lng,
                      borough: place.borough,
                      postcode: place.postcode,
                    });
                    setShowError(false);
                  }}
                />

                <input
                  type="hidden"
                  name="storePlaceId"
                  value={placeId ?? ""}
                />
                <input
                  type="hidden"
                  name="storeName"
                  value={placeMeta?.name ?? ""}
                />
                <input
                  type="hidden"
                  name="storeAddress"
                  value={placeMeta?.address ?? ""}
                />
                <input type="hidden" name="lat" value={placeMeta?.lat ?? ""} />
                <input type="hidden" name="lng" value={placeMeta?.lng ?? ""} />
                <input
                  type="hidden"
                  name="borough"
                  value={placeMeta?.borough ?? ""}
                />
                <input
                  type="hidden"
                  name="postcode"
                  value={placeMeta?.postcode ?? ""}
                />

                {placeLabel && (
                  <p className="text-xs text-muted-foreground mt-1">
                    選択中: {placeLabel}
                  </p>
                )}
              </section>

              {/* ステップ2: Q1 */}
              <section className={stepClass(2)}>
                <div className="space-y-1">
                  <p className="font-medium">
                    Q1.
                    この店舗ではサービスチャージをお客様から徴収していますか？
                  </p>
                </div>

                <RadioGroup
                  name="collected"
                  value={collected ?? ""}
                  onValueChange={(v: any) => {
                    const next = v === "yes" || v === "no" ? v : null;
                    setCollected(next);
                  }}
                  className="grid gap-2 mt-3"
                >
                  <div className="flex items-center space-x-3 py-1.5">
                    <RadioGroupItem value="yes" id="collected-yes" />
                    <Label htmlFor="collected-yes">はい</Label>
                  </div>
                  <div className="flex items-center space-x-3 py-1.5">
                    <RadioGroupItem value="no" id="collected-no" />
                    <Label htmlFor="collected-no">いいえ</Label>
                  </div>
                </RadioGroup>

                {collected === "no" && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    「いいえ」の場合、分配方法・金額の質問はスキップされます。
                  </p>
                )}
              </section>

              {/* ステップ3: Q2 + Q3（collected="yes" のときのみステップとして表示されるが、
                  値の保持のため常にDOM上には残し、非表示はCSSのみで行う） */}
              <section className={stepClass(3)}>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="font-medium">
                      Q2. サービスチャージはどのように分配されていますか？
                    </p>
                    <p className="text-xs text-muted-foreground">
                      他のスタッフから聞いた話でも構いません（実際に受け取っていなくても分かる範囲でお答えください）。
                    </p>

                    <RadioGroup name="distribution" className="grid gap-3">
                      <div className="flex items-start space-x-3 py-1.5">
                        <RadioGroupItem value="equal" id="dist-equal" />
                        <Label htmlFor="dist-equal" className="leading-tight">
                          <span className="block">
                            従業員に等分配されている
                          </span>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 py-1.5">
                        <RadioGroupItem value="gradient" id="dist-gradient" />
                        <Label
                          htmlFor="dist-gradient"
                          className="leading-tight"
                        >
                          <span className="block">
                            役職・勤務時間等に応じたグラデーション分配
                          </span>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 py-1.5">
                        <RadioGroupItem value="fixed" id="dist-fixed" />
                        <Label htmlFor="dist-fixed" className="leading-tight">
                          <span className="block">
                            時給に一定額として固定で上乗せ
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            （大部分をオーナー側が取得）
                          </span>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 py-1.5">
                        <RadioGroupItem value="none" id="dist-none" />
                        <Label htmlFor="dist-none" className="leading-tight">
                          <span className="block">分配されていない</span>
                          <span className="block text-xs text-muted-foreground">
                            （実質オーナー側が取得）
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Q3. あなたが受け取っている金額（任意）
                      </p>
                      <p className="text-xs text-muted-foreground">
                        店舗全体の総額ではなく、
                        <span className="font-medium text-foreground">
                          あなた個人が受け取っている金額
                        </span>
                        の概算を、分かる範囲で週額または月額のどちらかで入力してください。未入力でも問題ありません。
                      </p>
                    </div>

                    <RadioGroup
                      name="amountPeriod"
                      value={amountPeriod ?? ""}
                      onValueChange={(v: any) => {
                        if (v === "weekly" || v === "monthly") {
                          setAmountPeriod(v);
                        } else {
                          setAmountPeriod(null);
                        }
                      }}
                      className="grid gap-2"
                    >
                      <div className="flex items-center space-x-3 py-1.5">
                        <RadioGroupItem value="weekly" id="period-weekly" />
                        <Label htmlFor="period-weekly">週額</Label>
                      </div>

                      <div className="flex items-center space-x-3 py-1.5">
                        <RadioGroupItem value="monthly" id="period-monthly" />
                        <Label htmlFor="period-monthly">月額</Label>
                      </div>
                    </RadioGroup>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">£</span>
                      <Input
                        name="amountValue"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        placeholder="例）250"
                        value={amountValue}
                        onChange={(e) => setAmountValue(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>

                    <p
                      className={cn(
                        "text-xs",
                        amountMismatch
                          ? "text-destructive font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      ※
                      金額を入力した場合は、週額または月額のどちらかを選択してください。
                    </p>
                  </div>
                </div>
              </section>

              {/* ステップ4: Q4 */}
              <section className={stepClass(4)}>
                <div className="space-y-1">
                  <p className="font-medium">Q4. 自由記載（任意）</p>
                  <p className="text-xs text-muted-foreground">
                    サービスチャージの運用について、補足や気になる点があればご記入ください。
                  </p>
                </div>

                <Textarea
                  name="serviceChargeComment"
                  rows={4}
                  maxLength={1000}
                  placeholder="例）サービスチャージはフロアスタッフのみの間で分配。キッチンスタッフは分配されていない"
                  className="mt-2"
                />
              </section>

              {/* ステップ5: 追加質問（任意） */}
              <section className={stepClass(5)}>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">追加質問（任意）</p>
                    <p className="text-xs text-muted-foreground">
                      労働環境や福利厚生について、分かる範囲でお答えください。
                      すべて任意です。回答しなくても送信できます。
                    </p>
                  </div>

                  {/* ================= 賄い ================= */}
                  <section className="space-y-6 rounded-lg bg-muted/40 p-4">
                    <p className="font-medium text-foreground">賄いについて</p>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        1日の賄い回数
                      </p>
                      <RadioGroup name="mealCountPerDay" className="grid gap-1">
                        <div className="flex items-center space-x-3 py-1.5">
                          <RadioGroupItem value="0" id="mealcount-0" />
                          <Label htmlFor="mealcount-0">賄いなし</Label>
                        </div>
                        <div className="flex items-center space-x-3 py-1.5">
                          <RadioGroupItem value="1" id="mealcount-1" />
                          <Label htmlFor="mealcount-1">1回</Label>
                        </div>
                        <div className="flex items-center space-x-3 py-1.5">
                          <RadioGroupItem value="2plus" id="mealcount-2plus" />
                          <Label htmlFor="mealcount-2plus">2回以上</Label>
                        </div>
                      </RadioGroup>
                    </section>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        提供されない食材
                      </p>
                      <div className="grid gap-1">
                        {(["beef", "meat", "fish", "none"] as const).map(
                          (v) => (
                            <div
                              key={v}
                              className="flex items-center space-x-3 py-1.5"
                            >
                              <Checkbox
                                id={`mealres-${v}`}
                                checked={mealRestrictions.includes(v)}
                                onCheckedChange={(c) =>
                                  toggleMealRestriction(v, c === true)
                                }
                              />
                              <Label htmlFor={`mealres-${v}`}>
                                {MEAL_RESTRICTION_LABEL[v]}
                              </Label>
                            </div>
                          ),
                        )}
                        <div className="flex items-center space-x-3 py-1.5">
                          <Checkbox
                            id="mealres-other"
                            checked={showMealOther}
                            onCheckedChange={(c) =>
                              setShowMealOther(c === true)
                            }
                          />
                          <Label htmlFor="mealres-other">その他</Label>
                        </div>
                      </div>

                      {mealRestrictions.map((v) => (
                        <input
                          key={v}
                          type="hidden"
                          name="mealRestrictions"
                          value={v}
                        />
                      ))}

                      {showMealOther && (
                        <Textarea
                          name="mealComment"
                          rows={3}
                          maxLength={500}
                          className="mt-2 text-sm"
                          placeholder="例）選択不可の賄いが多く、内容は日によってばらつきがある"
                        />
                      )}
                    </section>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        賄い時のドリンク提供
                      </p>
                      <RadioGroup name="mealDrink" className="grid gap-1">
                        {(Object.keys(MEAL_DRINK_LABEL) as MealDrink[]).map(
                          (v) => (
                            <div
                              key={v}
                              className="flex items-center space-x-3 py-1.5"
                            >
                              <RadioGroupItem value={v} id={`mealdrink-${v}`} />
                              <Label htmlFor={`mealdrink-${v}`}>
                                {MEAL_DRINK_LABEL[v]}
                              </Label>
                            </div>
                          ),
                        )}
                      </RadioGroup>
                    </section>
                  </section>

                  {/* ================= 労働条件 ================= */}
                  <section className="space-y-6 rounded-lg bg-muted/30 p-4">
                    <p className="font-medium text-foreground">
                      労働条件・制度
                    </p>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        シフトの決まり方
                      </p>
                      <RadioGroup name="shiftSchedule" className="grid gap-1">
                        {(
                          Object.keys(SHIFT_SCHEDULE_LABEL) as ShiftSchedule[]
                        ).map((v) => (
                          <div
                            key={v}
                            className="flex items-center space-x-3 py-1.5"
                          >
                            <RadioGroupItem value={v} id={`shift-${v}`} />
                            <Label htmlFor={`shift-${v}`}>
                              {SHIFT_SCHEDULE_LABEL[v]}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </section>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        ビザサポート
                      </p>
                      <RadioGroup name="visaSupport" className="grid gap-1">
                        {(Object.keys(VISA_SUPPORT_LABEL) as VisaSupport[]).map(
                          (v) => (
                            <div
                              key={v}
                              className="flex items-center space-x-3 py-1.5"
                            >
                              <RadioGroupItem value={v} id={`visa-${v}`} />
                              <Label htmlFor={`visa-${v}`}>
                                {VISA_SUPPORT_LABEL[v]}
                              </Label>
                            </div>
                          ),
                        )}
                      </RadioGroup>
                    </section>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        管理者の関与度
                      </p>
                      <RadioGroup
                        name="managementPresence"
                        className="grid gap-1"
                      >
                        {(
                          Object.keys(
                            MANAGEMENT_PRESENCE_LABEL,
                          ) as ManagementPresence[]
                        ).map((v) => (
                          <div
                            key={v}
                            className="flex items-center space-x-3 py-1.5"
                          >
                            <RadioGroupItem value={v} id={`mgmt-${v}`} />
                            <Label htmlFor={`mgmt-${v}`}>
                              {MANAGEMENT_PRESENCE_LABEL[v]}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </section>
                  </section>

                  {/* ================= 職場環境 ================= */}
                  <section className="space-y-6 rounded-lg bg-muted/20 p-4">
                    <p className="font-medium text-foreground">職場環境</p>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        職場の雰囲気
                      </p>
                      <RadioGroup name="workAtmosphere" className="grid gap-1">
                        {(
                          Object.keys(WORK_ATMOSPHERE_LABEL) as WorkAtmosphere[]
                        ).map((v) => (
                          <div
                            key={v}
                            className="flex items-center space-x-3 py-1.5"
                          >
                            <RadioGroupItem value={v} id={`atmosphere-${v}`} />
                            <Label htmlFor={`atmosphere-${v}`}>
                              {WORK_ATMOSPHERE_LABEL[v]}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </section>

                    <section className="space-y-2">
                      <p className="text-sm font-medium text-foreground/90">
                        スタッフ構成
                      </p>
                      <RadioGroup name="ethnicityRatio" className="grid gap-1">
                        {(
                          Object.keys(ETHNICITY_RATIO_LABEL) as EthnicityRatio[]
                        ).map((v) => (
                          <div
                            key={v}
                            className="flex items-center space-x-3 py-1.5"
                          >
                            <RadioGroupItem value={v} id={`ethnicity-${v}`} />
                            <Label htmlFor={`ethnicity-${v}`}>
                              {ETHNICITY_RATIO_LABEL[v]}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </section>
                  </section>

                  <section className="space-y-2">
                    <p className="text-sm font-medium text-foreground/90">
                      その他
                    </p>
                    <Textarea
                      name="generalComment"
                      rows={4}
                      className="text-sm"
                      maxLength={1000}
                      placeholder="職場全体について補足があればご記入ください。個人が特定される情報（氏名・連絡先等）や誹謗中傷は入力しないでください。"
                    />
                  </section>
                </div>
              </section>

              {/* ナビゲーション */}
              <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-4">
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
                    <SubmitButton disabled={!placeId || amountMismatch} />
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
          </CardContent>
        </Card>
        <div className="mt-6">
          <Link
            href="/jobs/service-charges/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
