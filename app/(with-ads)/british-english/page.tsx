export const revalidate = 60 * 60;

import { fetchBritishEnglishEntries } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  britishEnglishHubBreadcrumbJsonLd,
  britishEnglishHubCollectionJsonLd,
} from "@/components/british-english/jsonld";
import BritishEnglishCard from "@/components/british-english/BritishEnglishCard";
import BritishEnglishTraits from "@/components/british-english/BritishEnglishTraits";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

export const metadata = buildPageMetadata({
  path: "/british-english",
  title: "イギリス英語 | フレーズと表現を毎日1つ紹介",
  description:
    "イギリス英語ならではの単語・言い回し・スラングを毎日1つ、由来や使い方とあわせてお届けします。アメリカ英語との違いも解説。",
  keywords: [
    "イギリス英語",
    "英国英語",
    "イギリス スラング",
    "britishism",
    "イギリス英語 アメリカ英語 違い",
  ],
});

export default async function BritishEnglishHubPage() {
  const entries = await fetchBritishEnglishEntries();

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={britishEnglishHubBreadcrumbJsonLd()} />
      <JsonLd data={britishEnglishHubCollectionJsonLd(entries)} />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-background to-sky-50 px-6 py-10 dark:border-rose-900/50 dark:from-rose-950/25 dark:via-background dark:to-sky-950/20 sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-[-10%] h-48 w-48 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10"
        />

        <div className="relative">
          <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            British English
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            イギリス英語は、
            <br className="sm:hidden" />
            <span className="text-rose-600 dark:text-rose-400">
              ちょっとひねくれてる
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            単語・言い回し・スラングを毎日1つ。由来や使い方、アメリカ英語との違いまで、
            笑いながら読めるように掘り下げます。
          </p>
        </div>
      </header>

      <section className="mb-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Archive
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              これまでの1日1語
            </h2>
          </div>
          {entries.length > 0 && (
            <p className="shrink-0 text-xs text-muted-foreground">
              全 <span className="font-bold text-foreground">{entries.length}</span> 語
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-muted-foreground">近日公開予定です。</p>
        ) : (
          <div className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {entries.map((item, i) => (
              <BritishEnglishCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      <BritishEnglishTraits />

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
