// app/dashboard/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchServiceChargesByPlaceId } from "@/utils/actions/jobs";
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
} from "@/utils/labels";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import dynamic from "next/dynamic";

type Props = {
  params: {
    id: string; // placeId
  };
};

function formatAmount(value: number | null, period: string | null): string {
  if (!value) return "未記入";
  return `${labelOf(AMOUNT_PERIOD_LABEL, period)} 約£${value}`;
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
                  href={`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${store.placeId}`}
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
                    会計時にサービスチャージを徴収：
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

                {/* ===== その他（開閉式） ===== */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                    >
                      その他の情報を見る
                      <span className="text-muted-foreground">▼</span>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-6 rounded-lg border p-4">
                    {/* 賄い */}
                    <section className="space-y-1">
                      <p className="font-medium">賄い</p>
                      <p>回数：{r.mealCountPerDay ?? "未記入"}</p>
                      <p>
                        提供されない食材：
                        {r.mealRestrictions.length
                          ? r.mealRestrictions.join("・")
                          : "特に制限なし"}
                      </p>
                      <p>
                        ドリンク：
                        {labelOf(MEAL_DRINK_LABEL, r.mealDrink)}
                      </p>

                      {r.mealComment && (
                        <p className="text-muted-foreground">
                          その他：{r.mealComment}
                        </p>
                      )}
                    </section>

                    <Separator />

                    {/* 労働条件 */}
                    <section className="space-y-1">
                      <p className="font-medium">労働条件・制度</p>
                      <p>
                        シフト：
                        {labelOf(SHIFT_SCHEDULE_LABEL, r.shiftSchedule)}
                      </p>
                      <p>
                        ビザサポート：
                        {labelOf(VISA_SUPPORT_LABEL, r.visaSupport)}
                      </p>
                      <p>
                        管理体制：
                        {labelOf(
                          MANAGEMENT_PRESENCE_LABEL,
                          r.managementPresence
                        )}
                      </p>
                    </section>

                    <Separator />

                    {/* 職場環境 */}
                    <section className="space-y-1">
                      <p className="font-medium">職場環境</p>
                      <p>
                        雰囲気：
                        {labelOf(WORK_ATMOSPHERE_LABEL, r.workAtmosphere)}
                      </p>
                      <p>
                        スタッフ構成：
                        {labelOf(ETHNICITY_RATIO_LABEL, r.ethnicityRatio)}
                      </p>

                      {r.generalComment && (
                        <p className="text-muted-foreground">
                          その他：{r.generalComment}
                        </p>
                      )}
                    </section>
                  </CollapsibleContent>
                </Collapsible>
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
