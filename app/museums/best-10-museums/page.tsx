export const revalidate = 60 * 60;

import Link from "next/link";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MuseumRankedList from "@/components/museums/MuseumRankedList";
import JsonLd from "@/components/seo/JsonLd";
import {
  museumsCollectionJsonLd,
} from "@/components/museums/jsonld";
import { buildPageMetadata } from "@/lib/seo";
import { fetchTop10Museums } from "@/utils/actions/museums";
import { Button } from "@/components/ui/button";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { AD_SLOTS } from "@/lib/adsense";

const PAGE_TITLE = "ロンドンで絶対に行くべき美術館・博物館10選";
const PAGE_DESCRIPTION =
  "初めてのロンドンならこの10館。大英博物館、ナショナル・ギャラリー、テート・モダン、V&A、自然史博物館など、常設展が無料で予約も不要な主要館を、見どころと所要時間つきで紹介します。";

export const metadata = buildPageMetadata({
  path: "/museums/best-10-museums",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン 美術館 おすすめ",
    "ロンドン 博物館 おすすめ",
    "大英博物館",
    "ナショナル・ギャラリー",
    "テート・モダン",
    "ロンドン 美術館 10選",
    "ロンドン 観光 美術館",
  ],
});

export default async function BestTenMuseumsPage() {
  const museums = await fetchTop10Museums();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/museums",
          current: "絶対に行くべき10館",
          currentHref: "/museums/best-10-museums",
        })}
      />
      <JsonLd
        data={museumsCollectionJsonLd({
          path: "/museums/best-10-museums",
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          museums,
        })}
      />

      <div className="mb-6">
        <Breadcrumbs path="/museums" current="絶対に行くべき10館" />
      </div>

      <header className="mb-10 space-y-4">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Best 10
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          絶対に行くべき美術館・博物館 10選
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          ロンドンは、世界で初めて国立の公共博物館を開いた街です。
          大英博物館が一般公開を始めたのは1759年。
          以来この街では「コレクションは市民のものである」という考え方が続いていて、
          ここに挙げた館のほとんどは、いまも常設展を無料で公開しています。
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          以下の10館は順不同です。すべてを一度の旅で回る必要はありません。
          気になった2〜3館を選んで、それぞれにたっぷり時間を使うほうが、
          駆け足で10館まわるよりずっと記憶に残ります。
        </p>
      </header>

      <MuseumRankedList museums={museums} />

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-bold tracking-tight">
          10館では物足りませんか
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          小規模でも見応えのある館や、専門的なコレクションを持つ館も掲載しています。
          無料かどうか、子ども連れ向きかで絞り込めます。
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/museums/all-museums">全館の一覧を見る</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/museums/best-museums-for-kids">子どもと行くなら</Link>
          </Button>
        </div>
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
