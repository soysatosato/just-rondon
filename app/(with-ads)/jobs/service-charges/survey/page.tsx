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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { submitSurvey } from "@/utils/actions/jobs";
import StoreSearch, { SelectedStore } from "@/components/jobs/StoreSearch";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DISTRIBUTION_LABEL,
  DISTRIBUTION_LEGAL_NOTE,
  type DistributionType,
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
  4: "職場について",
};

const DISTRIBUTION_ORDER: DistributionType[] = [
  "equal",
  "gradient",
  "fixed",
  "none",
];

export default function SurveyPage() {
  const [state, action] = useFormState<ActionState, FormData>(submitSurvey, {
    ok: true,
  });
  const [storeSelection, setStoreSelection] = useState<SelectedStore | null>(
    null,
  );

  const [collected, setCollected] = useState<"yes" | "no" | null>(null);
  const [amountValue, setAmountValue] = useState<string>("");
  const [showError, setShowError] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);

  const steps = useMemo(
    () => (collected === "no" ? [1, 2, 4] : [1, 2, 3, 4]),
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
    if (currentStep === 1) return !storeSelection;
    if (currentStep === 2) return collected === null;
    return false;
  }, [currentStep, storeSelection, collected]);

  function goNext() {
    if (!isLastStep) setCurrentStep(steps[stepIndex + 1]);
  }
  function goBack() {
    if (!isFirstStep) setCurrentStep(steps[stepIndex - 1]);
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
                {currentStep === 4 && (
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
              {/* ステップ1: 店舗（自前の店舗マスタから検索して選択） */}
              <section className={stepClass(1)}>
                <StoreSearch
                  onSelect={(selection) => {
                    setStoreSelection(selection);
                    setShowError(false);
                  }}
                />

                {storeSelection?.mode === "matched" && (
                  <>
                    <input
                      type="hidden"
                      name="storePlaceId"
                      value={storeSelection.store.id}
                    />
                    <input
                      type="hidden"
                      name="storeName"
                      value={storeSelection.store.name}
                    />
                    <input
                      type="hidden"
                      name="storeAddress"
                      value={storeSelection.store.address}
                    />
                    <input
                      type="hidden"
                      name="lat"
                      value={storeSelection.store.lat ?? ""}
                    />
                    <input
                      type="hidden"
                      name="lng"
                      value={storeSelection.store.lng ?? ""}
                    />
                    <input
                      type="hidden"
                      name="borough"
                      value={storeSelection.store.borough ?? ""}
                    />
                    <input
                      type="hidden"
                      name="postcode"
                      value={storeSelection.store.postcode ?? ""}
                    />
                  </>
                )}

                {storeSelection?.mode === "manual" && (
                  <>
                    <input
                      type="hidden"
                      name="manualStoreName"
                      value={storeSelection.name}
                    />
                    <input
                      type="hidden"
                      name="manualStoreAddress"
                      value={storeSelection.address}
                    />
                  </>
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

              {/* ステップ3: Q2 + Q3 + Q4（collected="yes" のときのみステップとして表示されるが、
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
                      {DISTRIBUTION_ORDER.map((v, i) => {
                        const isUnlawful = v === "fixed" || v === "none";
                        return (
                          <div
                            key={v}
                            className="flex items-start space-x-3 py-1.5"
                          >
                            <RadioGroupItem
                              value={v}
                              id={`dist-${v}`}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`dist-${v}`}
                              className="leading-tight"
                            >
                              <span className="block">
                                {["①", "②", "③", "④"][i]}{" "}
                                {DISTRIBUTION_LABEL[v]}
                              </span>
                              <span
                                className={cn(
                                  "mt-1 block text-xs font-normal",
                                  isUnlawful
                                    ? "text-destructive"
                                    : "text-muted-foreground",
                                )}
                              >
                                {DISTRIBUTION_LEGAL_NOTE[v]}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">
                          Employment (Allocation of Tips) Act 2023
                        </span>
                        （Tipping Act 2023・2024年10月施行）により、サービスチャージやチップは
                        <span className="font-medium text-foreground">
                          全額がスタッフに帰属する収入
                        </span>
                        と定められ、雇用主が税金・国民保険料以外を差し引くことは違法です。
                      </p>
                      <p className="mt-2">
                        ③は、上乗せ方式そのものが違法なのではなく、
                        <span className="font-medium text-foreground">
                          店が集めた総額が全額スタッフに渡っているか
                        </span>
                        が分かれ目になります。判断に迷う場合も、分かる範囲でお答えください。
                      </p>
                      <p className="mt-2">
                        <Link
                          href="/jobs/service-charges"
                          className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
                        >
                          サービスチャージの法律について詳しく読む →
                        </Link>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Q3. あなたが実際に受け取っている月額（任意）
                      </p>
                      <p className="text-xs text-muted-foreground">
                        店舗全体の総額ではなく、
                        <span className="font-medium text-foreground">
                          あなた個人が受け取っている1ヶ月あたりの金額
                        </span>
                        の概算を、分かる範囲で入力してください。未入力でも問題ありません。
                      </p>
                    </div>

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
                      <span className="text-sm text-muted-foreground">
                        / 月
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Q4. サービスチャージについて（自由記述・任意）
                      </p>
                      <p className="text-xs text-muted-foreground">
                        分配の実態や、疑問に感じている点があればご記入ください。
                      </p>
                    </div>

                    <Textarea
                      name="serviceChargeComment"
                      rows={4}
                      maxLength={1000}
                      placeholder="例）サービスチャージはフロアスタッフのみの間で分配。キッチンスタッフは分配されていない"
                      className="mt-2"
                    />
                  </div>
                </div>
              </section>

              {/* ステップ4: 職場について（任意） */}
              <section className={stepClass(4)}>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">職場について（任意）</p>
                    <p className="text-xs text-muted-foreground">
                      分かる範囲でお答えください。すべて任意です。回答しなくても送信できます。
                    </p>
                  </div>

                  <section className="space-y-2">
                    <p className="text-sm font-medium text-foreground/90">
                      賄いについて
                    </p>
                    <p className="text-xs text-muted-foreground">
                      回数、内容、提供されない食材、ドリンクの有無など、実態を自由にご記入ください。
                    </p>
                    <Textarea
                      name="mealComment"
                      rows={4}
                      maxLength={1000}
                      className="text-sm"
                      placeholder="例）1日1回、まかないは日替わりで選べない。ドリンクは水とお茶のみ"
                    />
                  </section>

                  <section className="space-y-2">
                    <p className="text-sm font-medium text-foreground/90">
                      その他（不満・良いところなど）
                    </p>
                    <p className="text-xs text-muted-foreground">
                      シフト、残業、休憩、人間関係、ビザサポートなど、職場全体について感じていることをご記入ください。
                    </p>
                    <Textarea
                      name="generalComment"
                      rows={5}
                      className="text-sm"
                      maxLength={1000}
                      placeholder="個人が特定される情報は入力しないでください。"
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
                    <SubmitButton disabled={!storeSelection} />
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
