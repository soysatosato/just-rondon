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
import BritishEnglishBrowser from "@/components/british-english/BritishEnglishBrowser";
import HubMasthead from "@/components/reading/HubMasthead";
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

function formatUpdated(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function BritishEnglishHubPage() {
  const [entries, allTime, weekly] = await Promise.all([
    fetchBritishEnglishEntries(),
    fetchPopularContents("british-english", RANK_TAKE),
    fetchWeeklyPopularContents("british-english", RANK_TAKE),
  ]);

  // 題字に沈める挿絵。イギリス英語は挿絵の無い語のほうが多いので、
  // 最新1件ではなく「挿絵を持っている中でいちばん新しいもの」を探す。
  const newest = entries[0] ?? null;
  const cover = entries.find((e) => e.image)?.image ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/british-english" })} />
      <JsonLd data={britishEnglishHubCollectionJsonLd(entries)} />

      <Breadcrumbs path="/british-english" className="mb-6" />

      <HubMasthead
        accent="british-english"
        eyebrow="British English"
        kicker="毎日更新"
        titleLead="イギリス英語は、"
        titleAccent="ちょっとひねくれてる"
        description="単語・言い回し・スラングを1つずつ。由来や使い方、アメリカ英語との違いまで、笑いながら読めるように掘り下げます。"
        image={cover}
        stats={[
          { label: "公開中", value: `${entries.length}`, unit: "語" },
          ...(newest
            ? [{ label: "最終更新", value: formatUpdated(newest.createdAt) }]
            : []),
        ]}
      />

      {/*
        読者側の軸の棚。

        下のアーカイブは createdAt の降順で固定なので、語を足さない限り
        並びが動かない。新着・週間・総合を切り替えられる棚を挟んで、
        「増えた言葉」と「いま読まれている言葉」の両方から入れるようにする。
        既定は新着。
      */}
      <section className="mb-14">
        <ContentRankingTabs
          title="まずはこの一語から"
          theme="british-english"
          weekly={toRankingEntries("british-english", weekly)}
          allTime={toRankingEntries("british-english", allTime)}
          latest={toRankingEntries("british-english", entries.slice(0, 6))}
        />
      </section>

      {/* 逆引きのフレーズ集への導線。語を1つずつ読む書庫とは引き方が
          違うので、書庫の手前に横帯で挟む。 */}
      <Link
        href="/british-english/scenes"
        className="group mb-14 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
      >
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-rose-700 dark:text-rose-400">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-rose-500" />
            Phrasebook
          </p>
          <h2 className="mt-2 text-lg font-bold tracking-tight sm:text-xl">
            場面別フレーズ集 — パブ・店・交通の逆引き
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            「これを言いたい」から引ける実戦用のページ。注文・支払い・乗り換えで
            詰まりがちな場面の言い方と、向こうから言われる表現をまとめました。
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-rose-700">
          場面別で引く →
        </span>
      </Link>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <div className="mb-14">
          <BritishEnglishBrowser entries={entries} />
        </div>
      )}

      <BritishEnglishTraits />

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
