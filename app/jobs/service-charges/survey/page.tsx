// app/survey/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { submitSurvey } from "@/utils/actions/jobs";
import PlaceAutocomplete, {
  SelectedPlace,
} from "@/components/jobs/PlaceAutocomplete";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? "送信中..." : "送信"}
    </Button>
  );
}

type ActionState = { ok: true } | { ok: false; message: string };

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
    null
  );
  const [showError, setShowError] = useState(true);
  const [showExtra, setShowExtra] = useState(false);
  const [showMealOther, setShowMealOther] = useState(false);
  const [placeMeta, setPlaceMeta] = useState<{
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    borough?: string;
    postcode?: string;
  } | null>(null);

  useEffect(() => {
    if (!needsPeriod) setAmountPeriod(null);
  }, [needsPeriod]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl md:text-2xl">
              ロンドン日本食レストランに関する実態調査
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              個人が特定される情報（氏名・連絡先等）は入力しないでください。
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {showError && !state.ok && (
              <Alert variant="destructive">
                <AlertTitle>入力内容をご確認ください</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <form action={action} className="space-y-6">
              {/* Q0: 店舗（現状はテキスト。後で Google Places Autocomplete で place_id をセット） */}
              <section className="space-y-2">
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

              <Separator />

              {/* Q1 */}
              <section className="space-y-3">
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
                    // NOの場合は下位質問を出さないだけで、FormDataは送られない（未選択）のでOK
                  }}
                  className="grid gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="collected-yes" />
                    <Label htmlFor="collected-yes">はい</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="collected-no" />
                    <Label htmlFor="collected-no">いいえ</Label>
                  </div>
                </RadioGroup>

                {collected === "no" && (
                  <p className="text-sm text-muted-foreground">
                    ご回答ありがとうございました。送信で終了します。
                  </p>
                )}
              </section>

              {/* YESのときだけ */}
              {collected === "yes" && (
                <>
                  <Separator />

                  {/* Q2 */}
                  <section className="space-y-3">
                    <p className="font-medium">
                      Q2. サービスチャージはどのように分配されていますか？
                    </p>

                    <RadioGroup name="distribution" className="grid gap-3">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="equal" id="dist-equal" />
                        <Label htmlFor="dist-equal" className="leading-tight">
                          <span className="block">
                            従業員に等分配されている
                          </span>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
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

                      <div className="flex items-start space-x-2">
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

                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="none" id="dist-none" />
                        <Label htmlFor="dist-none" className="leading-tight">
                          <span className="block">分配されていない</span>
                          <span className="block text-xs text-muted-foreground">
                            （実質オーナー側が取得）
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </section>

                  <Separator />

                  {/* Q3 */}
                  {/* Q3 */}
                  <section className="space-y-3">
                    <div className="space-y-1">
                      <p className="font-medium">
                        Q3. サービスチャージ金額（任意）
                      </p>
                      <p className="text-xs text-muted-foreground">
                        分かる範囲で、週額または月額の概算を入力してください。
                        未入力でも問題ありません。
                      </p>
                    </div>

                    {/* 週 / 月 は常に選択可能 */}
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
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="period-weekly" />
                        <Label htmlFor="period-weekly">週額</Label>
                      </div>

                      <div className="flex items-center space-x-2">
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

                    <p className="text-xs text-muted-foreground">
                      ※
                      金額を入力した場合は、週額または月額のどちらかを選択してください。
                    </p>
                  </section>
                </>
              )}

              <Separator />
              <Separator />

              <section className="space-y-2">
                <div className="space-y-1">
                  <p className="font-medium">Q4. 自由記載（任意）</p>
                  <p className="text-xs text-muted-foreground">
                    サービスチャージの運用について、補足や気になる点があればご記入ください。
                    個人が特定される内容は書かないでください。
                  </p>
                </div>

                <Textarea
                  name="serviceChargeComment"
                  rows={4}
                  maxLength={1000}
                  placeholder="例）サービスチャージはフロアスタッフのみの間で分配。キッチンスタッフは分配されていない"
                />
              </section>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExtra(true)}
              >
                追加の質問に答える（任意）
              </Button>

              {showExtra && (
                <>
                  <Separator />

                  <section className="space-y-8">
                    {/* セクションタイトル */}
                    <div className="space-y-1">
                      <p className="font-medium text-lg">追加質問（任意）</p>
                      <p className="text-xs text-muted-foreground">
                        労働環境や福利厚生について、分かる範囲でお答えください。
                      </p>
                    </div>

                    {/* ================= 賄い ================= */}
                    <section className="space-y-6 rounded-lg bg-muted/40 p-4">
                      <p className="font-medium text-foreground">
                        賄いについて
                      </p>

                      {/* 回数 */}
                      <section className="space-y-2">
                        <p className="text-sm font-medium text-foreground/90">
                          1日の賄い回数
                        </p>
                        <RadioGroup
                          name="mealCountPerDay"
                          className="grid gap-1"
                        >
                          <Label>
                            <RadioGroupItem value="0" /> 賄いなし
                          </Label>
                          <Label>
                            <RadioGroupItem value="1" /> 1回
                          </Label>
                          <Label>
                            <RadioGroupItem value="2plus" /> 2回以上
                          </Label>
                        </RadioGroup>
                      </section>

                      {/* 制限食材 */}
                      <section className="space-y-2">
                        <p className="text-sm font-medium text-foreground/90">
                          提供されない食材
                        </p>
                        <div className="grid gap-1">
                          <label>
                            <input
                              type="checkbox"
                              name="mealRestrictions"
                              value="beef"
                            />{" "}
                            牛肉
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              name="mealRestrictions"
                              value="meat"
                            />{" "}
                            肉全般
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              name="mealRestrictions"
                              value="fish"
                            />{" "}
                            魚
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              name="mealRestrictions"
                              value="none"
                            />{" "}
                            特に制限なし
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value="other"
                              onChange={(e) =>
                                setShowMealOther(e.target.checked)
                              }
                            />
                            その他
                          </label>
                        </div>

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

                      {/* ドリンク */}
                      <section className="space-y-2">
                        <p className="text-sm font-medium text-foreground/90">
                          賄い時のドリンク提供
                        </p>
                        <RadioGroup name="mealDrink" className="grid gap-1">
                          <Label>
                            <RadioGroupItem value="alcohol" /> 酒まで自由
                          </Label>
                          <Label>
                            <RadioGroupItem value="softdrink" />{" "}
                            ソフトドリンク自由
                          </Label>
                          <Label>
                            <RadioGroupItem value="water" /> 水・お茶のみ
                          </Label>
                          <Label>
                            <RadioGroupItem value="none" /> 提供なし
                          </Label>
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
                          <Label>
                            <RadioGroupItem value="monthly" /> 月ごとに決まる
                          </Label>
                          <Label>
                            <RadioGroupItem value="weekly" /> 週ごとに決まる
                          </Label>
                        </RadioGroup>
                      </section>

                      <section className="space-y-2">
                        <p className="text-sm font-medium text-foreground/90">
                          ビザサポート
                        </p>
                        <RadioGroup name="visaSupport" className="grid gap-1">
                          <Label>
                            <RadioGroupItem value="yes" /> あり
                          </Label>
                          <Label>
                            <RadioGroupItem value="no" /> なし
                          </Label>
                          <Label>
                            <RadioGroupItem value="unknown" /> 分からない
                          </Label>
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
                          <Label>
                            <RadioGroupItem value="owner-daily" />{" "}
                            オーナーが日常的に関与
                          </Label>
                          <Label>
                            <RadioGroupItem value="manager-daily" />{" "}
                            マネージャー常駐
                          </Label>
                          <Label>
                            <RadioGroupItem value="sometimes" /> ときどき
                          </Label>
                          <Label>
                            <RadioGroupItem value="hands-off" /> ほぼ不在
                          </Label>
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
                        <RadioGroup
                          name="workAtmosphere"
                          className="grid gap-1"
                        >
                          <Label>
                            <RadioGroupItem value="good" /> 良い
                          </Label>
                          <Label>
                            <RadioGroupItem value="neutral" /> 普通
                          </Label>
                          <Label>
                            <RadioGroupItem value="tense" /> ピリピリしている
                          </Label>
                          <Label>
                            <RadioGroupItem value="toxic" /> 明らかに問題あり
                          </Label>
                        </RadioGroup>
                      </section>

                      <section className="space-y-2">
                        <p className="text-sm font-medium text-foreground/90">
                          スタッフ構成
                        </p>
                        <RadioGroup
                          name="ethnicityRatio"
                          className="grid gap-1"
                        >
                          <Label>
                            <RadioGroupItem value="mostly-japanese" />{" "}
                            日本人が多い
                          </Label>
                          <Label>
                            <RadioGroupItem value="mixed" /> 多国籍
                          </Label>
                          <Label>
                            <RadioGroupItem value="mostly-non-japanese" />{" "}
                            日本人は少数
                          </Label>
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
                        placeholder="職場全体について補足があればご記入ください"
                      />
                    </section>
                  </section>
                </>
              )}

              <SubmitButton disabled={!placeId} />
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
