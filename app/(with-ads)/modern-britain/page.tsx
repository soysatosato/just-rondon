export const revalidate = 60 * 60;

import Link from "next/link";

import {
  fetchModernBritainEntries,
  fetchPopularContents,
  fetchWeeklyPopularContents,
} from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import JsonLd from "@/components/seo/JsonLd";
import {
  modernBritainHubCollectionJsonLd,
} from "@/components/modern-britain/jsonld";
import ModernBritainCard from "@/components/modern-britain/ModernBritainCard";
import ContentRankingTabs from "@/components/rankings/ContentRankingTabs";
import { toRankingEntries } from "@/lib/reading-ranking";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { AD_SLOTS } from "@/lib/adsense";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

export const metadata = buildPageMetadata({
  path: "/modern-britain",
  title: "英国のいまを論じる | 最新ニュースの背景を掘り下げる時事コラム",
  description:
    "最新の英国ニュースを出典付きで紹介し、その背景・原因・英国社会への影響、制度や歴史との関係まで掘り下げて論じます。要約では終わらない、いまのイギリスの読み解き。",
  keywords: [
    "イギリス ニュース 解説",
    "英国 時事",
    "イギリス 社会 問題",
    "英国 政治 経済 解説",
    "イギリス 制度",
  ],
  // 既定のロゴ(810x665)ではなく、ハブごとの生成カードを配る。
  images: [hubOgImage("modern-britain")],
});

/** ランキング各面に並べる本数。1本目を大きく出し、残りを行で続ける。 */
const RANK_TAKE = 7;

export default async function ModernBritainHubPage() {
  const [entries, allTime, weekly] = await Promise.all([
    fetchModernBritainEntries(),
    fetchPopularContents("modern-britain", RANK_TAKE),
    fetchWeeklyPopularContents("modern-britain", RANK_TAKE),
  ]);

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/modern-britain" })} />
      <JsonLd data={modernBritainHubCollectionJsonLd(entries)} />

      <Breadcrumbs path="/modern-britain" className="mb-6" />

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
            Britain, Argued
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            そのニュースは、
            <br className="sm:hidden" />
            <span className="text-indigo-600 dark:text-indigo-400">
              何を意味するのか
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            ニュースは、社会の表面に浮かんだ一つの現象にすぎない。その下には、歴史があり、制度があり、人々の価値観がある。いま英国で起きていることを手がかりに、その奥にある「英国という国」の姿を読み解く。
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            今週のストライキや臨時休館なら{" "}
            <Link
              href="/events"
              className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
            >
              今週のロンドン
            </Link>{" "}
            へ。
          </p>
        </div>
      </header>

      {/*
        読者側の軸の棚。

        下のアーカイブは createdAt の降順で固定で、論考を足さない限り
        並びが動かない。時事を扱う以上「いま何が読まれているか」が
        いちばん強い入口になるので、週間を既定にした棚を頭に置く。
      */}
      <section className="mb-12">
        <ContentRankingTabs
          title="よく読まれている論考"
          description="実際に読まれている順です。今週の勢い、公開以来の累計、更新順の3つで切り替えられます。"
          theme="modern-britain"
          unitLabel="論考"
          weekly={toRankingEntries("modern-britain", weekly)}
          allTime={toRankingEntries("modern-britain", allTime)}
          latest={toRankingEntries("modern-britain", entries.slice(0, 6))}
        />
      </section>

      <section className="mb-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Archive
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              これまでの論考
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
