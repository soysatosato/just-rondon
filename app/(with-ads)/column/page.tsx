export const revalidate = 60 * 60;

import {
  fetchColumns,
  fetchPopularContents,
  fetchWeeklyPopularContents,
} from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import JsonLd from "@/components/seo/JsonLd";
import { columnHubCollectionJsonLd } from "@/components/column/jsonld";
import ColumnBrowser from "@/components/column/ColumnBrowser";
import SeriesRail from "@/components/column/SeriesRail";
import ContentRankingTabs from "@/components/rankings/ContentRankingTabs";
import { toRankingEntries } from "@/lib/reading-ranking";
import { groupColumns } from "@/lib/column-grouping";
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

function formatUpdated(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function ColumnHubPage() {
  const [columns, allTime, weekly] = await Promise.all([
    fetchColumns(),
    fetchPopularContents("column", RANK_TAKE),
    fetchWeeklyPopularContents("column", RANK_TAKE),
  ]);

  // 連載の一覧はレール(横並び)に渡すだけ。書庫側は全件を1つの並びで扱うので、
  // ここで単発だけを切り出す必要はない。
  const { series } = groupColumns(columns);
  const newest = columns[0] ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/column" })} />
      <JsonLd data={columnHubCollectionJsonLd(columns)} />

      <Breadcrumbs path="/column" className="mb-6" />

      {/*
        題字。読み物のハブなので、雑誌の表紙のように濃い面を1枚敷いて、
        本文の白い面と切り替える。背景に沈めているのは最新コラムの挿絵。
        毎日更新されるので、ここも毎日変わる。
      */}
      <header className="relative mb-12 overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:px-12 sm:py-16">
        {newest?.image && (
          <img
            src={newest.image}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            fetchPriority="high"
            decoding="async"
          />
        )}
        {/* 文字は左に寄せているので、左を潰して右に写真を残す。挿絵は
            コラムごとに明度がばらばらで、1枚の覆いだけでは白い絵のときに
            見出しが読めなくなる。 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/55"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl"
        />

        <div className="relative">
          <p className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-400" />
            Column
            <span className="text-white/25">/</span>
            <span className="tracking-[0.2em] text-white/60">毎日更新</span>
          </p>

          <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
            イギリスは、
            <br className="sm:hidden" />
            <span className="text-amber-400">掘るほど面白い</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            歴史・文化・伝統・制度にまつわる読み物コラム。
            旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解きます。
          </p>

          {columns.length > 0 && (
            <dl className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-4 border-t border-white/15 pt-5">
              <Stat label="公開中" value={`${columns.length}`} unit="本" />
              {series.length > 0 && (
                <Stat label="連載" value={`${series.length}`} unit="本" />
              )}
              {newest && (
                <Stat label="最終更新" value={formatUpdated(newest.createdAt)} />
              )}
            </dl>
          )}
        </div>
      </header>

      {/*
        読者側の軸の棚。

        下の書庫(ColumnBrowser)は検索・タグという読者が「探す」ための場所で、
        既定の並びはコラムを足さない限り動かない。新着・週間・総合をタブで
        切り替えられる棚を頭に置いて、毎日更新しているものが毎日変わって
        見えるようにする。既定は新着。書いた順に届けるのがいちばんの役目で、
        再訪した人が最初に知りたいのもそこだから。
      */}
      <section className="mb-14">
        <ContentRankingTabs
          title="まずはこの一本から"
          theme="column"
          weekly={toRankingEntries("column", weekly)}
          allTime={toRankingEntries("column", allTime)}
          latest={toRankingEntries("column", columns.slice(0, 6))}
        />
      </section>

      {series.length > 0 && (
        <div className="mb-14">
          <SeriesRail series={series} />
        </div>
      )}

      {columns.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <ColumnBrowser columns={columns} />
      )}

      <div className="mt-12">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}

/** 題字の下に並べる数字。数字を大きく、ラベルを小さく。 */
function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-black leading-none tracking-tight">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-bold text-white/60">{unit}</span>
        )}
      </dd>
    </div>
  );
}
