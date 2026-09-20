export const revalidate = 60 * 60;

import Link from "next/link";

import {
  fetchAreaEntries,
  fetchPopularContents,
  fetchWeeklyPopularContents,
} from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import JsonLd from "@/components/seo/JsonLd";
import { areaListCollectionJsonLd } from "@/components/areas/jsonld";
import AreaBrowser from "@/components/areas/AreaBrowser";
import HubMasthead from "@/components/reading/HubMasthead";
import ContentRankingTabs from "@/components/rankings/ContentRankingTabs";
import { toRankingEntries } from "@/lib/reading-ranking";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { AD_SLOTS } from "@/lib/adsense";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

/*
  検索語は「エリアガイド」系を狙わない。それは半日の回遊ルートを載せた
  /sightseeing/areas が先に持っている。こちらは街の名前で調べに来る読者
  ——「治安」「家賃」「どんな街」を打つ人——に寄せる。2つのハブで同じ語を
  狙うと、どちらも上がらないまま食い合うことになる。
*/
export const metadata = buildPageMetadata({
  path: "/areas",
  title: "ロンドンの街 | 治安・家賃・地名の由来をエリアごとに読み解く",
  description:
    "ロンドンのエリアを1つずつ読み解きます。地名の由来、その街がいまの姿になった経緯、警察と土地登記の統計で見る治安と家賃の実際、そして歩くならどこか。泊まる場所と住む場所を決める前に読むための、街そのものの記録。",
  keywords: [
    "ロンドン 治安 エリア",
    "ロンドン 住む エリア",
    "ロンドン エリア 特徴",
    "ロンドン 家賃 相場 エリア",
    "ロンドン 地名 由来",
  ],
  // 既定のロゴ(810x665)ではなく、ハブごとの生成カードを配る。
  images: [hubOgImage("areas")],
});

/** ランキング各面に並べる本数。1本目を大きく出し、残りを行で続ける。 */
const RANK_TAKE = 7;

function formatUpdated(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function AreasHubPage() {
  const [entries, allTime, weekly] = await Promise.all([
    fetchAreaEntries(),
    fetchPopularContents("area", RANK_TAKE),
    fetchWeeklyPopularContents("area", RANK_TAKE),
  ]);

  const newest = entries[0] ?? null;
  const cover = entries.find((e) => e.image)?.image ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/areas" })} />
      <JsonLd data={areaListCollectionJsonLd(entries)} />

      <Breadcrumbs path="/areas" className="mb-6" />

      <HubMasthead
        accent="area"
        eyebrow="London, Neighbourhood by Neighbourhood"
        kicker="毎週2本"
        titleLead="その街は、"
        titleAccent="どうしてそうなったのか"
        description="ロンドンは33の区と、名前を持った数百の街でできている。同じ地下鉄で15分の距離に、家賃が3倍違う街が並ぶ。その差は偶然ではなく、鉄道がどこを通ったか、誰がどこに住むことを許されたか、どの工場が閉じたかの結果である。一つずつ、名前の由来から今日の数字まで辿る。"
        image={cover}
        stats={[
          { label: "公開中", value: `${entries.length}`, unit: "の街" },
          ...(newest
            ? [{ label: "最終更新", value: formatUpdated(newest.createdAt) }]
            : []),
        ]}
      >
        <p className="mt-6 text-xs text-white/60">
          半日で歩く順路なら{" "}
          <Link
            href="/sightseeing/areas"
            className="font-semibold text-indigo-300 underline-offset-2 hover:underline"
          >
            エリアガイド
          </Link>
          、住む場所を決めるなら{" "}
          <Link
            href="/housing/where-to-live"
            className="font-semibold text-indigo-300 underline-offset-2 hover:underline"
          >
            住むエリアの選び方
          </Link>{" "}
          へ。
        </p>
      </HubMasthead>

      {/*
        読者側の軸の棚。

        下の書庫は既定が新着順で、街を足さない限り並びが動かない。
        ただしこのセクションは「どの街から読むか」を決めていない読者も
        多いので、読まれた順を1クリックで出せるようにしておく。
      */}
      <section className="mb-14">
        <ContentRankingTabs
          title="まずはこの街から"
          theme="area"
          weekly={toRankingEntries("area", weekly)}
          allTime={toRankingEntries("area", allTime)}
          latest={toRankingEntries("area", entries.slice(0, 6))}
        />
      </section>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <AreaBrowser entries={entries} />
      )}

      <div className="mt-12">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
