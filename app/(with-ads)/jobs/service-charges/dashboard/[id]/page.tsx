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
  labelOf,
} from "@/utils/labels";
import dynamic from "next/dynamic";

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
