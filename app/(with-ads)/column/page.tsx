export const revalidate = 60 * 60;

import Link from "next/link";
import { fetchColumns } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  columnHubCollectionJsonLd,
} from "@/components/column/jsonld";
import ColumnBrowser from "@/components/column/ColumnBrowser";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

export const metadata = buildPageMetadata({
  path: "/column",
  title: "コラム | イギリスの歴史・文化・伝統を深掘りする読み物",
  description:
    "イギリスの歴史・文化・伝統・制度にまつわるコラムを毎日更新でお届けします。旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解く読み物です。",
  keywords: [
    "イギリス コラム",
    "イギリス 歴史",
    "イギリス 文化",
    "イギリス 豆知識",
    "ロンドン コラム",
  ],
});

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function ColumnHubPage() {
  const columns = await fetchColumns();
  const [latest] = columns;

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/column" })} />
      <JsonLd data={columnHubCollectionJsonLd(columns)} />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-background to-sky-50 px-6 py-10 dark:border-amber-900/50 dark:from-amber-950/25 dark:via-background dark:to-sky-950/20 sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-[-10%] h-48 w-48 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10"
        />

        <div className="relative">
          <span className="inline-block rounded-full bg-amber-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Column
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            イギリスは、
            <br className="sm:hidden" />
            <span className="text-amber-700 dark:text-amber-400">
              掘るほど面白い
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            歴史・文化・伝統・制度にまつわる読み物コラム。
            旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解きます。
          </p>
          {columns.length > 0 && (
            <p className="mt-5 text-xs text-muted-foreground">
              現在{" "}
              <span className="font-bold text-foreground">
                {columns.length}
              </span>{" "}
              本を公開中
            </p>
          )}
        </div>
      </header>

      {/* 最新コラムを大きく1本 */}
      {latest && (
        <section className="mb-12">
          <span className="inline-block rounded-full bg-rose-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            New
          </span>
          <Link
            href={`/column/${latest.slug}`}
            className="group mt-3 block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex flex-col sm:flex-row">
              {latest.image && (
                <div className="relative h-44 w-full shrink-0 sm:h-auto sm:w-2/5">
                  <img
                    src={latest.image}
                    alt={latest.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    decoding="async"
                  />
                </div>
              )}
              <div className="flex-1 p-5 sm:p-6">
                <p className="text-xs text-muted-foreground">
                  {formatDate(latest.createdAt)}
                </p>
                <h2 className="mt-2 text-lg font-bold leading-snug tracking-tight group-hover:text-sky-700 dark:group-hover:text-sky-300 sm:text-xl">
                  {latest.title}
                </h2>
                {latest.summary && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {latest.summary}
                  </p>
                )}
                <p className="mt-4 text-xs font-medium text-sky-600 dark:text-sky-300">
                  続きを読む →
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {columns.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <ColumnBrowser columns={columns} />
      )}

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
