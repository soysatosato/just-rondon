// app/(with-ads)/jobs/service-charges/stores/[slug]/page.tsx
//
// 店舗1軒ぶんのページ。検索で「店名 + サービスチャージ」「店名 + バイト」と
// 引いた人が着地する場所なので、店名を見出しに立て、その店について
// 分かっていることだけを上から順に置く。
//
// 中身の薄い店舗(回答1件・自由記述なし・金額なし)は noindex になる。
// 判定は lib/jobs/store-slug.js の isIndexableStore が持ち、
// sitemap 側も同じ関数を読んでいるので、申告と noindex が食い違うことはない。
export const revalidate = 60 * 60;

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamicImport from "next/dynamic";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import StoreSummary from "@/components/jobs/dashboard/StoreSummary";
import ResponseCard from "@/components/jobs/dashboard/ResponseCard";
import StoreObligations from "@/components/jobs/stores/StoreObligations";
import StoreRow, { shortAddress } from "@/components/jobs/stores/StoreRow";
import {
  storeDescription,
  storeKeywords,
  storeTitle,
} from "@/components/jobs/stores/meta";
import { fetchStorePage, fetchStoreSlugs } from "@/utils/actions/jobs";
import { buildPageMetadata } from "@/lib/seo";
import { storePath } from "@/lib/jobs/store-slug";

type Props = {
  params: { slug: string };
};

const PropertyMap = dynamicImport(
  () => import("@/components/museums/PropertyMap"),
  { ssr: false },
);

export async function generateStaticParams() {
  const slugs = await fetchStoreSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchStorePage(params.slug);
  if (!data) return {};

  const { store } = data;
  return buildPageMetadata({
    path: storePath(store.slug),
    title: storeTitle(store),
    description: storeDescription(store),
    keywords: storeKeywords(store),
    type: "article",
    modifiedTime: store.latestAt.toISOString(),
    noindex: !store.indexable,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
}

export default async function StorePage({ params }: Props) {
  const data = await fetchStorePage(params.slug);
  if (!data) notFound();

  const { store, records, nearby } = data;
  // 地図は座標が入っている回答から拾う。手入力の回答には座標が無い。
  const located = records.find((r) => r.lat != null && r.lng != null) as
    | { lat: number; lng: number }
    | undefined;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/jobs/service-charges/stores",
          current: store.storeName,
          currentHref: storePath(store.slug),
        })}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Breadcrumbs
          path="/jobs/service-charges/stores"
          current={store.storeName}
          className="mb-6"
        />

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            店舗別サービスチャージ
          </p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            {store.storeName || "（店舗名不明）"}のサービスチャージ
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            この店で働いた人から届いた匿名回答{store.responseCount}件をまとめています。
            最後に回答が届いたのは{formatDate(store.latestAt)}です。
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {store.storeAddress && <span>{shortAddress(store.storeAddress)}</span>}
            {store.storeAddress && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${store.storeName} ${store.storeAddress}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 transition hover:text-foreground"
              >
                Google Maps で開く ↗
              </a>
            )}
          </div>
        </header>

        <section className="mt-8">
          <StoreSummary store={store} />
        </section>

        <section className="mt-5">
          <StoreObligations store={store} />
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
              <Link href="/jobs/service-charges/stores">他の店舗を見る</Link>
            </Button>
          </div>
        </section>

        {nearby.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold tracking-tight">
              近くの店舗
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                同じ{store.postcode?.split(" ")[0]}エリア
              </span>
            </h2>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
              {nearby.map((s) => (
                <StoreRow key={s.placeId} store={s} />
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12 rounded-xl border border-border p-5 sm:p-6">
          <h2 className="text-base font-bold tracking-tight">
            この数字を読む前に
          </h2>
          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-sm font-semibold text-foreground">
                サービスチャージは全額がスタッフのもの
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                2024年10月1日以降、雇用主が差し引けるのは税金と国民保険料だけです。管理費や手数料の控除は違法です。
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-foreground">
                未払いの申立ては12か月以内
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                起点は「支払われるべきだった日」なので、辞めたあとでも請求できます。ポリシーや記録が開示されない場合は3か月以内です。
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm">
            <Link
              href="/jobs/service-charges"
              className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
            >
              サービスチャージ完全ガイドを読む →
            </Link>
          </p>
        </section>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          掲載しているのは働いた人からの自己申告で、裏付けは取っていません。同じ店でも人によって見え方は違い、
          回答が寄せられたあとに運用が変わっている可能性もあります。記載内容に事実と異なる点がある場合は、
          <Link
            href="/contact"
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            お問い合わせ
          </Link>
          から店舗の方にご連絡いただければ確認・修正します。
        </p>
      </div>
    </main>
  );
}
