// app/(with-ads)/jobs/service-charges/dashboard/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
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
  if (!value) return "未回答";
  return `${labelOf(AMOUNT_PERIOD_LABEL, period)} 約£${value}`;
}

const PropertyMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
});

/** レビュー内の項目を「ラベル / 値」の2列で並べる。 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-1.5">
      <dt className="text-xs leading-relaxed text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed text-foreground">{children}</dd>
    </div>
  );
}

export default async function DashboardDetailPage({ params }: Props) {
  const reviews = await fetchServiceChargesByPlaceId(params.id);

  if (reviews.length === 0) {
    notFound();
  }

  const store = reviews[0];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* パンくず */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link
            href="/jobs/service-charges/dashboard"
            className="transition hover:text-foreground"
          >
            調査データ
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">店舗詳細</span>
        </nav>

        {/* 店舗情報 */}
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {store.storeName || "（店舗名不明）"}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {store.storeAddress && <span>{store.storeAddress}</span>}
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums">
              {reviews.length}件の回答
            </span>
          </div>

          {store.lat && store.lng && (
            <p className="pt-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${store.storeName} ${store.storeAddress}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
              >
                Google Maps で開く ↗
              </a>
            </p>
          )}
        </header>

        {/* サマリー */}
        <section className="mt-8">
          <StoreSummary reviews={reviews} />
        </section>

        {/* 地図 */}
        {store.lat && store.lng && (
          <section className="mt-8">
            <div className="relative z-0 h-[240px] w-full overflow-hidden rounded-xl">
              <PropertyMap lat={store.lat} lng={store.lng} />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 dark:ring-white/10" />
            </div>
          </section>
        )}

        {/* レビュー一覧 */}
        <section className="mt-12 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">
            寄せられた回答
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {reviews.length}件
            </span>
          </h2>

          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                {/* 見出し行：投稿日と徴収の有無 */}
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    {r.createdAt.toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                  <span
                    className={
                      r.serviceChargeCollected
                        ? "rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background"
                        : "rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {r.serviceChargeCollected ? "徴収あり" : "徴収なし"}
                  </span>
                </div>

                <div className="space-y-4 px-5 py-4">
                  {r.serviceChargeCollected && (
                    <dl className="divide-y divide-border/60">
                      <Field label="分配方法">
                        {labelOf(DISTRIBUTION_LABEL, r.distributionType)}
                      </Field>
                      <Field label="受取額">
                        {formatAmount(r.amountValue, r.amountPeriod)}
                      </Field>
                    </dl>
                  )}

                  {r.serviceChargeComment && (
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        サービスチャージについて
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                        {r.serviceChargeComment}
                      </p>
                    </div>
                  )}

                  {r.mealComment && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        賄い
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                        {r.mealComment}
                      </p>
                    </div>
                  )}

                  {r.generalComment && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        その他
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                        {r.generalComment}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 導線 */}
        <section className="mt-12 rounded-xl border border-border bg-muted/40 p-5 text-center">
          <p className="font-semibold text-foreground">
            この店舗で働いた経験がありますか？
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            回答が増えるほど、実態が正確に見えるようになります。所要3分・匿名です。
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/jobs/service-charges/survey">
                アンケートに回答する
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/jobs/service-charges/dashboard">
                他の店舗を検索する
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
