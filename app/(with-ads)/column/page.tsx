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
import HubMasthead from "@/components/reading/HubMasthead";
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

      <HubMasthead
        accent="column"
        eyebrow="Column"
        kicker="毎日更新"
        titleLead="イギリスは、"
        titleAccent="掘るほど面白い"
        description="歴史・文化・伝統・制度にまつわる読み物コラム。旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解きます。"
        image={newest?.image}
        stats={[
          { label: "公開中", value: `${columns.length}`, unit: "本" },
          ...(series.length > 0
            ? [{ label: "連載", value: `${series.length}`, unit: "本" }]
            : []),
          ...(newest
            ? [{ label: "最終更新", value: formatUpdated(newest.createdAt) }]
            : []),
        ]}
      />

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
