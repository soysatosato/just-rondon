// app/(with-ads)/jobs/service-charges/dashboard/[id]/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { Button } from "@/components/ui/button";
import { fetchServiceChargesByPlaceId } from "@/utils/actions/jobs";
import StoreSummary from "@/components/jobs/dashboard/StoreSummary";
import ResponseCard from "@/components/jobs/dashboard/ResponseCard";
import { aggregateStore } from "@/utils/service-charge";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ実態調査 店舗詳細");

type Props = {
  params: {
    id: string; // placeId
  };
};

const PropertyMap = dynamicImport(
  () => import("@/components/museums/PropertyMap"),
  { ssr: false },
);

export default async function DashboardDetailPage({ params }: Props) {
  const records = await fetchServiceChargesByPlaceId(params.id);

  if (records.length === 0) {
    notFound();
  }

  const store = aggregateStore(records);
  // 地図は座標が入っている回答から拾う。手入力の回答には座標が無い。
  const located = records.find((r) => r.lat != null && r.lng != null) as
    | { lat: number; lng: number }
    | undefined;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link
            href="/jobs/service-charges/dashboard"
            className="transition hover:text-foreground"
          >
            実態調査
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">店舗詳細</span>
        </nav>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {store.storeName || "（店舗名不明）"}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {store.storeAddress && <span>{store.storeAddress}</span>}
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums">
              {store.responseCount}件の回答
            </span>
          </div>

          {store.storeAddress && (
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

        <section className="mt-8">
          <StoreSummary store={store} />
        </section>

        {located && (
          <section className="mt-8">
            <div className="relative z-0 h-[240px] w-full overflow-hidden rounded-xl">
              <PropertyMap lat={located.lat} lng={located.lng} />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5 dark:ring-white/10" />
            </div>
          </section>
        )}

        <section className="mt-12 space-y-4">
          <h2 className="text-lg font-bold tracking-tight">
            寄せられた回答
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              新しい順に{store.responseCount}件
            </span>
          </h2>

          <div className="space-y-4">
            {records.map((r) => (
              <ResponseCard key={r.id} record={r} showStoreName={false} />
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-muted/40 p-5 text-center">
          <p className="font-semibold text-foreground">
            この店舗で働いた経験がありますか？
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            回答が増えるほど、実態が正確に見えるようになります。所要3分・匿名で、
            送信する前にその場で判定が出ます。
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/jobs/service-charges/survey">診断をはじめる</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/jobs/service-charges/dashboard">
                他の店舗を見る
              </Link>
            </Button>
          </div>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          掲載しているのは働いた人からの自己申告で、裏付けは取っていません。
          記載内容に事実と異なる点がある場合は、店舗の方からのご連絡で確認・修正します。
        </p>
      </div>
    </main>
  );
}
