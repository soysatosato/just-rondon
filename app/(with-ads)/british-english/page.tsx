export const revalidate = 60 * 60;

import Link from "next/link";

import {
  fetchBritishEnglishEntries,
  fetchPopularContents,
  fetchWeeklyPopularContents,
} from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import JsonLd from "@/components/seo/JsonLd";
import {
  britishEnglishHubCollectionJsonLd,
} from "@/components/british-english/jsonld";
import BritishEnglishCard from "@/components/british-english/BritishEnglishCard";
import BritishEnglishTraits from "@/components/british-english/BritishEnglishTraits";
import ContentRankingTabs from "@/components/rankings/ContentRankingTabs";
import { toRankingEntries } from "@/lib/reading-ranking";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { AD_SLOTS } from "@/lib/adsense";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

export const metadata = buildPageMetadata({
  path: "/british-english",
  title: "イギリス英語 | フレーズと表現を1つずつ紹介",
  description:
    "イギリス英語ならではの単語・言い回し・スラングを1つずつ、由来や使い方とあわせてお届けします。アメリカ英語との違いも解説。",
  keywords: [
    "イギリス英語",
    "英国英語",
    "イギリス スラング",
    "britishism",
    "イギリス英語 アメリカ英語 違い",
  ],
  // 既定のロゴ(810x665)ではなく、ハブごとの生成カードを配る。
  images: [hubOgImage("british-english")],
});

/** ランキング各面に並べる本数。1語目を大きく出し、残りを行で続ける。 */
const RANK_TAKE = 7;

export default async function BritishEnglishHubPage() {
  const [entries, allTime, weekly] = await Promise.all([
    fetchBritishEnglishEntries(),
    fetchPopularContents("british-english", RANK_TAKE),
    fetchWeeklyPopularContents("british-english", RANK_TAKE),
  ]);

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/british-english" })} />
      <JsonLd data={britishEnglishHubCollectionJsonLd(entries)} />

      <Breadcrumbs path="/british-english" className="mb-6" />

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
            単語・言い回し・スラングを1つずつ。由来や使い方、アメリカ英語との違いまで、
            笑いながら読めるように掘り下げます。
          </p>
        </div>
      </header>

      <Link
        href="/british-english/scenes"
        className="group mb-12 block rounded-2xl border border-border bg-muted/40 p-5 transition-colors hover:bg-accent/50 sm:p-6"
      >
        <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Phrasebook
        </span>
        <h2 className="mt-3 text-lg font-bold tracking-tight sm:text-xl">
          場面別フレーズ集 — パブ・店・交通の逆引き
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          「これを言いたい」から引ける実戦用のページ。注文・支払い・乗り換えで
          詰まりがちな場面の言い方と、向こうから言われる表現をまとめました。
        </p>
        <span className="mt-3 inline-block text-xs font-semibold text-rose-600 group-hover:underline dark:text-rose-400">
          場面別で引く →
        </span>
      </Link>

      {/*
        読者側の軸の棚。

        下のアーカイブは createdAt の降順で固定なので、語を足さない限り
        並びが動かない。新着・週間・総合を切り替えられる棚を挟んで、
        「増えた言葉」と「いま読まれている言葉」の両方から入れるようにする。
        既定は新着。
      */}
      <section className="mb-12">
        <ContentRankingTabs
          title="新着の言葉とランキング"
          description="既定は更新順です。今週の勢い、公開以来の累計にも切り替えられます。"
          theme="british-english"
          unitLabel="語"
          weekly={toRankingEntries("british-english", weekly)}
          allTime={toRankingEntries("british-english", allTime)}
          latest={toRankingEntries("british-english", entries.slice(0, 6))}
        />
      </section>

      <section className="mb-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Archive
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              これまでの言葉
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
