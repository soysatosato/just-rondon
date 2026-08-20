export const revalidate = 60 * 60;

import { fetchModernBritainEntries } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  modernBritainHubBreadcrumbJsonLd,
  modernBritainHubCollectionJsonLd,
} from "@/components/modern-britain/jsonld";
import ModernBritainCard from "@/components/modern-britain/ModernBritainCard";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

export const metadata = buildPageMetadata({
  path: "/modern-britain",
  title: "いまのイギリス | 現代の暮らしと世相を毎日1本",
  description:
    "いまのイギリス人が何に金を払い、何に怒り、何を当たり前だと思っているのか。値上げ、定番の食べ物、テレビ、日常の習慣まで、現代のイギリスを毎日1本お届けします。",
  keywords: [
    "イギリス 生活",
    "イギリス 現在",
    "ロンドン 暮らし",
    "イギリス 物価",
    "イギリス 文化 現代",
  ],
});

export default async function ModernBritainHubPage() {
  const entries = await fetchModernBritainEntries();

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={modernBritainHubBreadcrumbJsonLd()} />
      <JsonLd data={modernBritainHubCollectionJsonLd(entries)} />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-background to-cyan-50 px-6 py-10 dark:border-indigo-900/50 dark:from-indigo-950/25 dark:via-background dark:to-cyan-950/20 sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-[-10%] h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10"
        />

        <div className="relative">
          <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Modern Britain
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            歴史になる前の
            <br className="sm:hidden" />
            <span className="text-indigo-600 dark:text-indigo-400">
              イギリスの話
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            いまのイギリス人が何に金を払い、何に怒り、何を当たり前だと思っているのか。
            観光ガイドには載らない現代の暮らしと世相を、毎日1本。
          </p>
        </div>
      </header>

      <section className="mb-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Archive
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              これまでの1日1本
            </h2>
          </div>
          {entries.length > 0 && (
            <p className="shrink-0 text-xs text-muted-foreground">
              全{" "}
              <span className="font-bold text-foreground">
                {entries.length}
              </span>{" "}
              本
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-muted-foreground">近日公開予定です。</p>
        ) : (
          <div className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {entries.map((item, i) => (
              <ModernBritainCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
