export const revalidate = 60 * 60;

import {
  fetchColumns,
  fetchPopularContents,
  fetchWeeklyPopularContents,
} from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import JsonLd from "@/components/seo/JsonLd";
import {
  columnHubCollectionJsonLd,
} from "@/components/column/jsonld";
import ColumnBrowser from "@/components/column/ColumnBrowser";
import ContentRankingTabs from "@/components/rankings/ContentRankingTabs";
import { toRankingEntries } from "@/lib/reading-ranking";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
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
  // 既定のロゴ(810x665)ではなく、ハブごとの生成カードを配る。
  images: [hubOgImage("column")],
});

/** ランキング各面に並べる本数。1本目を大きく出し、残りを行で続ける。 */
const RANK_TAKE = 7;

export default async function ColumnHubPage() {
  const [columns, allTime, weekly] = await Promise.all([
    fetchColumns(),
    fetchPopularContents("column", RANK_TAKE),
    fetchWeeklyPopularContents("column", RANK_TAKE),
  ]);

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/column" })} />
      <JsonLd data={columnHubCollectionJsonLd(columns)} />

      <Breadcrumbs path="/column" className="mb-6" />

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

      {/*
        読者側の軸の棚。

        この下の一覧(ColumnBrowser)は連載・タグ・キーワードという編集側の
        軸で並んでいて、コラムを足さない限り顔ぶれが動かない。週間・総合・
        新着をタブで切り替えられる棚を頭に置いて、毎日更新しているものが
        毎日変わって見えるようにする。

        以前ここにあった「最新1本を大きく出す」枠は、新着タブが同じ役割を
        兼ねるので畳んだ。同じ記事が2つ隣り合って出るだけになるため。
      */}
      <section className="mb-12">
        <ContentRankingTabs
          title="よく読まれているコラム"
          description="実際に読まれている順です。今週の勢い、公開以来の累計、更新順の3つで切り替えられます。"
          theme="column"
          unitLabel="コラム"
          weekly={toRankingEntries("column", weekly)}
          allTime={toRankingEntries("column", allTime)}
          latest={toRankingEntries("column", columns.slice(0, 6))}
        />
      </section>

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
