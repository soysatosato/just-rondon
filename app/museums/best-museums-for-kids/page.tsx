export const revalidate = 60 * 60;

import Link from "next/link";

import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import MuseumRankedList from "@/components/museums/MuseumRankedList";
import JsonLd from "@/components/seo/JsonLd";
import {
  museumsCollectionJsonLd,
  museumsHubBreadcrumbJsonLd,
} from "@/components/museums/jsonld";
import { buildPageMetadata } from "@/lib/seo";
import { fetchKidsMuseums } from "@/utils/actions/museums";
import { Button } from "@/components/ui/button";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

const PAGE_TITLE = "子どもと行くロンドンの博物館・美術館";
const PAGE_DESCRIPTION =
  "恐竜の全身骨格、触って動かせる展示、週末のワークショップ。ロンドンで子ども連れが楽しめる博物館・美術館を、ベビーカーや授乳室の事情もふまえて紹介します。多くが入場無料です。";

export const metadata = buildPageMetadata({
  path: "/museums/best-museums-for-kids",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン 子連れ 博物館",
    "ロンドン 子ども 美術館",
    "自然史博物館 恐竜",
    "ロンドン 科学博物館",
    "ロンドン 子連れ 観光",
    "ロンドン 雨の日 子ども",
  ],
});

export default async function KidsMuseumsPage() {
  const museums = await fetchKidsMuseums();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <JsonLd
        data={museumsHubBreadcrumbJsonLd({
          name: "子どもと行く博物館",
          path: "/museums/best-museums-for-kids",
        })}
      />
      <JsonLd
        data={museumsCollectionJsonLd({
          path: "/museums/best-museums-for-kids",
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          museums,
        })}
      />

      <div className="mb-6">
        <MuseumBreadCrumbs
          name="美術館ナビ"
          link2=""
          name2="子ども向け"
        />
      </div>

      <header className="mb-8 space-y-4">
        <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          For Kids
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          子どもと行く博物館・美術館
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          「静かにしなさい」と言い続ける一日にはなりません。
          ロンドンの博物館には、レバーを引いたりボタンを押したりできる展示室があり、
          子どもが声を出すことが前提の空間として設計されています。
          恐竜の全身骨格、実際に触れる隕石、体を使って仕組みを学ぶ装置。
          しかもその多くが無料です。
        </p>
      </header>

      {/* 子連れ向けの実務情報 */}
      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "ベビーカーで入れます",
            body: "主要館はエレベーター完備で、ベビーカーのまま館内を回れます。混雑時は預けるよう案内されることもあります。",
          },
          {
            title: "ワークショップは週末と学校休暇中",
            body: "工作や実験の体験プログラムは土日とハーフターム(学期中の休暇)に集中します。人気の回は事前予約制です。",
          },
          {
            title: "ランチは持ち込める館も",
            body: "自然史博物館や科学博物館にはピクニックエリアがあります。館内のカフェは混むので、持参が確実です。",
          },
        ].map((tip) => (
          <div
            key={tip.title}
            className="rounded-xl border border-border bg-card p-4"
          >
            <h2 className="text-sm font-semibold tracking-tight">
              {tip.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {tip.body}
            </p>
          </div>
        ))}
      </section>

      <MuseumRankedList museums={museums} showKidsBadge />

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-bold tracking-tight">
          大人だけの時間もつくるなら
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          落ち着いて絵を見たい日には、規模の小さい館が向いています。
          全館の一覧から探してみてください。
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/museums/all-museums">全館の一覧を見る</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sightseeing/kids-free-activities">
              子どもと楽しむ無料スポット
            </Link>
          </Button>
        </div>
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
