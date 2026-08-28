import Link from "next/link";
import { MapPin, Clapperboard, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  filmLocationsHubJsonLd,
  filmWorkPath,
  sightseeingBreadcrumbJsonLd,
  FILM_LOCATIONS_BASE,
} from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { AD_SLOTS } from "@/lib/adsense";
import { filmWorks } from "./data";

export const metadata = buildPageMetadata({
  path: FILM_LOCATIONS_BASE,
  title:
    "ロンドン ロケ地巡りガイド | 映画・ドラマの撮影地を作品別にたどる | ジャスト・ロンドン",
  titleSuffix: false,
  description:
    "SHERLOCK、ブリジャートン家、ダウントン・アビー。ロンドンで撮影された映画・ドラマのロケ地を作品別に紹介します。最寄り駅・公開状況・中に入れるかどうかまで、実際に訪ねるための情報つき。",
  keywords: [
    "ロンドン ロケ地",
    "ロンドン ロケ地巡り",
    "イギリス ドラマ ロケ地",
    "映画 ロケ地 ロンドン",
    "シャーロック ロケ地",
    "ブリジャートン ロケ地",
    "ダウントンアビー ロケ地",
    "聖地巡礼 ロンドン",
  ],
});

export default function FilmLocationsHubPage() {
  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={filmLocationsHubJsonLd(filmWorks)} />
      <JsonLd
        data={sightseeingBreadcrumbJsonLd([
          { name: "ロケ地巡り", path: FILM_LOCATIONS_BASE },
        ])}
      />

      <Breadcrumbs path="/sightseeing/film-locations" className="mb-6" />

      <header className="mb-8">
        <p className="text-sm font-medium tracking-wide text-sky-600 dark:text-sky-300 mb-2">
          Film &amp; TV Locations in London
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          ロンドン ロケ地巡りガイド
        </h1>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            ロンドンは世界でもっとも多く撮影された街のひとつです。ただし画面に映る「19世紀のロンドン」も「摂政時代の社交界」も、実際には市内各所の建物を選んで継ぎ合わせたもの。221Bはベーカー街になく、王妃の宮殿は政府の迎賓館です。
          </p>
          <p>
            このガイドでは作品ごとに、実際に訪ねられるロケ地だけを取り上げます。中に入れるのか外から見るだけなのか、最寄り駅はどこか、そしてなぜその場所が選ばれたのかまで含めて紹介します。
          </p>
        </div>
      </header>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-full">
        {filmWorks.map((work) => {
          const coverSpot = work.spots.find(
            (spot) => spot.image && spot.imageSource !== "instagram",
          );

          return (
          <Link key={work.slug} href={filmWorkPath(work.slug)} className="block">
            <Card className="w-full min-w-0 h-full overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              {coverSpot?.image && (
                <div className="relative aspect-[16/9] w-full">
                  <img
                    src={coverSpot.image}
                    alt={work.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
              )}
              <CardHeader className="space-y-2 px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-sky-600 dark:text-sky-300">
                  {work.eyebrow} · {work.years}
                </p>
                <CardTitle className="text-base font-semibold">
                  {work.title}のロケ地
                </CardTitle>
                <Badge
                  variant="outline"
                  className="w-fit border-sky-300 text-sky-700 dark:border-sky-400 dark:text-sky-100"
                >
                  {work.engTitle}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 text-sm leading-relaxed px-4 pb-4">
                <p className="text-gray-700 dark:text-gray-200">{work.summary}</p>

                <div className="flex items-start gap-2">
                  <Route className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    {work.routeHint}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 dark:text-gray-200">
                    掲載スポット {work.spots.length} か所
                  </p>
                </div>

                <p className="text-right text-xs text-sky-600 dark:text-sky-300 font-medium">
                  ロケ地を見る →
                </p>
              </CardContent>
            </Card>
          </Link>
          );
        })}

        {/* ハリー・ポッターは先に単独の特集があるので、ここからは送るだけにする。 */}
        <Link href="/sightseeing/harry-potter" className="block">
          <Card className="w-full min-w-0 h-full border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 shadow-none hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="space-y-2 px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-purple-600 dark:text-purple-300">
                Film Series · 2001–2011
              </p>
              <CardTitle className="text-base font-semibold">
                ハリー・ポッターのロケ地
              </CardTitle>
              <Badge
                variant="outline"
                className="w-fit border-purple-300 text-purple-700 dark:border-purple-400 dark:text-purple-100"
              >
                Harry Potter
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed px-4 pb-4">
              <p className="text-gray-700 dark:text-gray-200">
                9¾番線、レドンホール・マーケット、ミレニアム橋、スタジオツアーまで。こちらは専用の特集ページにまとめています。
              </p>
              <p className="text-right text-xs text-purple-600 dark:text-purple-300 font-medium">
                特集ページへ →
              </p>
            </CardContent>
          </Card>
        </Link>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-sky-500" />
          ロケ地を訪ねる前に
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            <strong>「外観だけ」のロケ地が多い。</strong>
            屋敷の内部はスタジオセットで撮られていることがほとんどです。現地で室内を探しても見つからない、というのは巡礼で最もよくある落胆なので、各ページの「見学の可否」を先に確認してください。
          </li>
          <li>
            <strong>公開日が限られる建物がある。</strong>
            ランカスター・ハウスのように通常は非公開の政府施設や、ハイクレア城のように年間60〜70日しか開かない邸宅もあります。旅程を組む前に公開日を調べ、必要なら真っ先に予約を取ってください。
          </li>
          <li>
            <strong>人が暮らし、働いている場所がある。</strong>
            ノース・ガワー・ストリートは住宅街、セント・バーツは現役の病院です。玄関先での長時間の撮影や、通路をふさいでの記念写真は避けましょう。
          </li>
        </ul>
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
