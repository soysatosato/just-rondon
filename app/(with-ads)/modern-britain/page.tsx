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
import ModernBritainBrowser from "@/components/modern-britain/ModernBritainBrowser";
import HubMasthead from "@/components/reading/HubMasthead";
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

function formatUpdated(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function ModernBritainHubPage() {
  const [entries, allTime, weekly] = await Promise.all([
    fetchModernBritainEntries(),
    fetchPopularContents("modern-britain", RANK_TAKE),
    fetchWeeklyPopularContents("modern-britain", RANK_TAKE),
  ]);

  const newest = entries[0] ?? null;
  const cover = entries.find((e) => e.image)?.image ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/modern-britain" })} />
      <JsonLd data={modernBritainHubCollectionJsonLd(entries)} />

      <Breadcrumbs path="/modern-britain" className="mb-6" />

      <HubMasthead
        accent="modern-britain"
        eyebrow="Britain, Argued"
        kicker="随時更新"
        titleLead="そのニュースは、"
        titleAccent="何を意味するのか"
        description="ニュースは、社会の表面に浮かんだ一つの現象にすぎない。その下には、歴史があり、制度があり、人々の価値観がある。いま英国で起きていることを手がかりに、その奥にある「英国という国」の姿を読み解く。"
        image={cover}
        stats={[
          { label: "公開中", value: `${entries.length}`, unit: "本" },
          ...(newest
            ? [{ label: "最終更新", value: formatUpdated(newest.createdAt) }]
            : []),
        ]}
      >
        <p className="mt-6 text-xs text-white/60">
          今週のストライキや臨時休館なら{" "}
          <Link
            href="/events"
            className="font-semibold text-indigo-300 underline-offset-2 hover:underline"
          >
            今週のロンドン
          </Link>{" "}
          へ。
        </p>
      </HubMasthead>

      {/*
        読者側の軸の棚。

        下のアーカイブは createdAt の降順で固定で、論考を足さない限り
        並びが動かない。時事を扱う以上「何が新しく出たか」がいちばん強い
        入口になるので、新着を既定にした棚を頭に置く。週間・総合へは
        タブで1クリック。
      */}
      <section className="mb-14">
        <ContentRankingTabs
          title="まずはこの一編から"
          theme="modern-britain"
          weekly={toRankingEntries("modern-britain", weekly)}
          allTime={toRankingEntries("modern-britain", allTime)}
          latest={toRankingEntries("modern-britain", entries.slice(0, 6))}
        />
      </section>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <ModernBritainBrowser entries={entries} />
      )}

      <div className="mt-12">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
