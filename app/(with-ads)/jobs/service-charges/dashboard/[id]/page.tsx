// app/(with-ads)/jobs/service-charges/dashboard/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchServiceChargesByPlaceId } from "@/utils/actions/jobs";
import StoreSummary from "@/components/jobs/StoreSummary";
import {
  DISTRIBUTION_LABEL,
  AMOUNT_PERIOD_LABEL,
  ETHNICITY_RATIO_LABEL,
  WORK_ATMOSPHERE_LABEL,
  MEAL_DRINK_LABEL,
  SHIFT_SCHEDULE_LABEL,
  VISA_SUPPORT_LABEL,
  MANAGEMENT_PRESENCE_LABEL,
  labelOf,
  MEAL_RESTRICTION_LABEL,
} from "@/utils/labels";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import dynamic from "next/dynamic";
import type { ServiceCharge } from "@prisma/client";

import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ集計の詳細");

type Props = {
  params: {
    id: string; // placeId
  };
};

function formatAmount(value: number | null, period: string | null): string {
  if (!value) return "-";
  return `${labelOf(AMOUNT_PERIOD_LABEL, period)} 約£${value}`;
}

// 選択式だった旧設問（賄いの回数・食材・ドリンク、労働条件、職場環境）は
// 現在の調査では自由記述に統合された。過去の回答を持つレコードでのみ表示する。
function hasLegacyAnswers(r: ServiceCharge): boolean {
  return Boolean(
    r.mealCountPerDay ||
      r.mealRestrictions?.length ||
      r.mealDrink ||
      r.shiftSchedule ||
      r.visaSupport ||
      r.managementPresence ||
      r.workAtmosphere ||
      r.ethnicityRatio
  );
}

function renderMealRestrictions(values: string[]) {
  if (!values || values.length === 0) return "-";

  // 「特に制限なし」が含まれていたら、それだけ表示
  if (values.includes("none")) {
    return MEAL_RESTRICTION_LABEL.none;
  }

  return values
    .map(
      (v) => MEAL_RESTRICTION_LABEL[v as keyof typeof MEAL_RESTRICTION_LABEL]
    )
    .join("・");
}

const PropertyMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
});

export default async function DashboardDetailPage({ params }: Props) {
  const reviews = await fetchServiceChargesByPlaceId(params.id);

  if (reviews.length === 0) {
    notFound();
  }

  const store = reviews[0];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <section className="space-y-6">
          {/* 店舗情報 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {store.storeName || "（店舗名不明）"}
            </h1>

            <div className="space-y-0.5 text-sm text-muted-foreground">
              {store.storeAddress && <div>{store.storeAddress}</div>}
              <div>{reviews.length} reviews</div>
            </div>
          </div>

          {/* 地図 */}
          {store.lat && store.lng && (
            <div className="space-y-2">
              <div className="relative z-0 h-[38vh] w-full overflow-hidden rounded-xl">
                <PropertyMap lat={store.lat} lng={store.lng} />
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 dark:ring-white/10" />
              </div>

              {/* Google Maps link */}
              <div className="text-right">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${store.storeName} ${store.storeAddress}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-foreground transition"
                >
                  Google Maps ↗
                </a>
              </div>
            </div>
          )}
        </section>

        <Separator />

        <StoreSummary reviews={reviews} />

        <Separator />

        {/* レビュー一覧 */}
        <div className="space-y-6">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  投稿日：
                  {r.createdAt.toLocaleDateString("ja-JP")}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 text-sm">
                {/* ===== サービスチャージ（常時表示・強調） ===== */}
                <section className="space-y-2 rounded-lg bg-muted/40 p-4">
                  <p className="text-base font-semibold">サービスチャージ</p>

                  <p>
                    サービスチャージ：
                    <span className="ml-1 font-medium">
                      {r.serviceChargeCollected ? "あり" : "なし"}
                    </span>
                  </p>

                  {r.serviceChargeCollected && (
                    <>
                      <p>
                        分配方法：
                        <span className="ml-1">
                          {labelOf(DISTRIBUTION_LABEL, r.distributionType)}
                        </span>
                      </p>
                      <p>
                        金額：
                        <span className="ml-1">
                          {formatAmount(r.amountValue, r.amountPeriod)}
                        </span>
                      </p>
                    </>
                  )}

                  {r.serviceChargeComment && (
                    <p className="text-muted-foreground">
                      {r.serviceChargeComment}
                    </p>
                  )}
                </section>

                {/* ===== 職場について（自由記述） ===== */}
                {(r.mealComment || r.generalComment) && (
                  <section className="space-y-4">
                    {r.mealComment && (
                      <div className="space-y-1">
                        <p className="font-semibold">賄い</p>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {r.mealComment}
                        </p>
                      </div>
                    )}

                    {r.generalComment && (
                      <div className="space-y-1">
                        <p className="font-semibold">その他</p>
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {r.generalComment}
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* ===== 旧設問の回答（過去データのみ・開閉式） ===== */}
                {hasLegacyAnswers(r) && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                      >
                        以前の設問への回答を見る
                        <span className="text-muted-foreground">▼</span>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4 space-y-6 rounded-lg border p-4">
                      {(r.mealCountPerDay ||
                        r.mealRestrictions?.length > 0 ||
                        r.mealDrink) && (
                        <section className="space-y-1">
                          <p className="font-semibold text-base mb-3">賄い</p>
                          {r.mealCountPerDay && (
                            <p>回数：{r.mealCountPerDay}</p>
                          )}
                          {r.mealRestrictions?.length > 0 && (
                            <p>
                              提供されない食材：
                              {renderMealRestrictions(r.mealRestrictions)}
                            </p>
                          )}
                          {r.mealDrink && (
                            <p>
                              ドリンク：
                              {labelOf(MEAL_DRINK_LABEL, r.mealDrink)}
                            </p>
                          )}
                        </section>
                      )}

                      {(r.shiftSchedule ||
                        r.visaSupport ||
                        r.managementPresence) && (
                        <>
                          <Separator />
                          <section className="space-y-1">
                            <p className="font-semibold text-base mb-3">
                              労働条件・制度
                            </p>
                            {r.shiftSchedule && (
                              <p>
                                シフト：
                                {labelOf(SHIFT_SCHEDULE_LABEL, r.shiftSchedule)}
                              </p>
                            )}
                            {r.visaSupport && (
                              <p>
                                ビザサポート：
                                {labelOf(VISA_SUPPORT_LABEL, r.visaSupport)}
                              </p>
                            )}
                            {r.managementPresence && (
                              <p>
                                管理体制：
                                {labelOf(
                                  MANAGEMENT_PRESENCE_LABEL,
                                  r.managementPresence
                                )}
                              </p>
                            )}
                          </section>
                        </>
                      )}

                      {(r.workAtmosphere || r.ethnicityRatio) && (
                        <>
                          <Separator />
                          <section className="space-y-1">
                            <p className="font-semibold text-base mb-3">
                              職場環境
                            </p>
                            {r.workAtmosphere && (
                              <p>
                                雰囲気：
                                {labelOf(
                                  WORK_ATMOSPHERE_LABEL,
                                  r.workAtmosphere
                                )}
                              </p>
                            )}
                            {r.ethnicityRatio && (
                              <p>
                                スタッフ構成：
                                {labelOf(
                                  ETHNICITY_RATIO_LABEL,
                                  r.ethnicityRatio
                                )}
                              </p>
                            )}
                          </section>
                        </>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* 追加登録導線 */}
        <div className="text-center">
          <Button asChild>
            <Link href="/jobs/service-charges/dashboard">検索ページに戻る</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
