export const revalidate = 60 * 60 * 24;

import Link from "next/link";

import { fetchFreeAttractionsByCategory } from "@/utils/actions/attractions";
import { categoryLabel } from "@/components/sightseeing/categories";
import { buildPageMetadata } from "@/lib/seo";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";
import {
  featureBreadcrumbJsonLd,
  getFeatureMeta,
} from "@/components/sightseeing/features/features";

export const metadata = buildPageMetadata({
  path: "/sightseeing/free",
  title: "ロンドンの無料観光スポット一覧｜入場料タダで楽しめる名所",
  titleSuffix: false,
  description:
    "ロンドンは大英博物館やナショナル・ギャラリーをはじめ、国立の博物館・美術館の常設展が無料です。入場無料で楽しめる観光スポットを、美術館・公園・街歩きなどジャンル別に所要時間つきでまとめました。",
  keywords: [
    "ロンドン 無料",
    "ロンドン 無料 観光",
    "ロンドン 無料スポット",
    "ロンドン 博物館 無料",
    "ロンドン 美術館 無料",
    "ロンドン 観光 節約",
    "ロンドン タダ",
    "ロンドン 予算",
  ],
});

export default async function FreeAttractionsPage() {
  const groups = await fetchFreeAttractionsByCategory();
  const total = groups.reduce((sum, g) => sum + g.spots.length, 0);

  const meta = getFeatureMeta("free");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd
        data={featureBreadcrumbJsonLd({
          slug: "free",
          title: "ロンドンの無料観光スポット",
        })}
      />
      {/* 特集ページと同じく ItemList で出す。並びはカテゴリー順のまま、
          読者が見るのと同じ順序で番号を振る。 */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${SITE_URL}/sightseeing/free#items`,
          url: `${SITE_URL}/sightseeing/free`,
          name: `ロンドンの無料観光スポット${total}選`,
          inLanguage: "ja",
          numberOfItems: total,
          itemListElement: groups
            .flatMap((group) => group.spots)
            .map((spot, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: spot.name,
              url: `${SITE_URL}/sightseeing/${spot.slug}`,
            })),
        }}
      />

      <div className="mb-4">
        <Breadcrumbs path="/sightseeing" current="無料スポット" />
      </div>

      {meta && (
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className={`h-3 w-0.5 shrink-0 rounded-full ${meta.stripe}`} />
          {meta.eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        ロンドンの無料観光スポット{total}選
      </h1>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <p>
          ロンドンが旅行先として優秀なのは、
          <strong>国立の博物館・美術館の常設展がすべて無料</strong>
          だからです。大英博物館もナショナル・ギャラリーも自然史博物館も、
          チケットを買わずに入れます。特別展だけが有料です。
        </p>
        <p>
          物価の高い街ですが、入場料をかけずに回れる場所を軸に組み立てれば、
          1日の出費を交通費と食費だけに抑えることもできます。
          ここでは入場無料のスポットをジャンル別に、所要時間の目安つきで並べました。
        </p>
      </div>

      <div className="my-6 flex justify-center">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      {/* 目次。カテゴリー数が7前後あるので、上から順に読ませない。 */}
      <nav className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
        <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
          ジャンル
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {groups.map((group) => (
            <li key={group.category}>
              <a
                href={`#${group.category}`}
                className="text-blue-700 hover:underline dark:text-blue-400"
              >
                {categoryLabel(group.category)}（{group.spots.length}）
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <section
            key={group.category}
            id={group.category}
            className="scroll-mt-20"
          >
            <h2 className="text-xl font-semibold tracking-tight">
              {categoryLabel(group.category)}
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.spots.map((spot) => (
                <Link
                  key={spot.slug}
                  href={`/sightseeing/${spot.slug}`}
                  className="group flex gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60"
                >
                  <img
                    src={spot.image}
                    alt={`${spot.name}｜ロンドンの無料観光スポット`}
                    className="h-20 w-20 flex-none rounded object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:underline">
                      {spot.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {[
                        spot.durationText ? `所要 ${spot.durationText}` : null,
                        spot.nearestStation,
                      ]
                        .filter(Boolean)
                        .join("・")}
                    </p>
                    {(spot.tagline || spot.summary) && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                        {spot.tagline || spot.summary}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-14 rounded-lg border border-gray-200 p-5 dark:border-neutral-700">
        <h2 className="text-lg font-semibold">あわせて読みたい</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/budget"
              className="text-blue-700 hover:underline dark:text-blue-400"
            >
              ロンドン旅行の予算とお金の話
            </Link>
            <span className="text-gray-600 dark:text-gray-400">
            {" "}
              — 宿代・交通費・食費の相場から1日の出費を積算しています。
            </span>
          </li>
          <li>
            <Link
              href="/sightseeing/kids-free-activities"
              className="text-blue-700 hover:underline dark:text-blue-400"
            >
              子どもと楽しむ無料スポットBEST10
            </Link>
            <span className="text-gray-600 dark:text-gray-400">
            {" "}
              — 子連れ向けに絞った無料の遊び場はこちら。
            </span>
          </li>
          <li>
            <Link
              href="/sightseeing/itinerary"
              className="text-blue-700 hover:underline dark:text-blue-400"
            >
              ロンドン モデルコース（1〜5日）
            </Link>
            <span className="text-gray-600 dark:text-gray-400">
            {" "}
              — 無料スポットを組み込んだ王道ルート。
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
