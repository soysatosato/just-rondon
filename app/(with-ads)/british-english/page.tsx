export const revalidate = 60 * 60;

import { fetchBritishEnglishEntries } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  britishEnglishHubBreadcrumbJsonLd,
  britishEnglishHubCollectionJsonLd,
} from "@/components/british-english/jsonld";
import BritishEnglishCard from "@/components/british-english/BritishEnglishCard";
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

      <header className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          イギリス英語
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          イギリス英語ならではの単語・言い回し・スラングを毎日1つ紹介します。
          <br />
          由来や使い方、アメリカ英語との違いまでじっくり掘り下げます。
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-full">
          {entries.map((item) => (
            <BritishEnglishCard key={item.id} item={item} />
          ))}
        </section>
      )}

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
