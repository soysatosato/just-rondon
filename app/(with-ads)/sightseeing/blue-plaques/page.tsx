import Link from "next/link";
import { MapPin, Landmark, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  bluePlaquesHubJsonLd,
  plaqueAreaPath,
  sightseeingBreadcrumbJsonLd,
  BLUE_PLAQUES_BASE,
} from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { plaqueAreas } from "./data";

export const metadata = buildPageMetadata({
  path: BLUE_PLAQUES_BASE,
  title:
    "ロンドン ブループラーク巡りガイド | 作家・音楽家・政治家ゆかりの地をエリア別にたどる | ジャスト・ロンドン",
  titleSuffix: false,
  description:
    "English Heritage の公式ブループラークをエリア別に紹介。マリルボン、チェルシー、ウェストミンスターに眠る作家・音楽家・政治家・科学者ゆかりの建物を、最寄り駅・見学の可否つきで紹介します。",
  keywords: [
    "ロンドン ブループラーク",
    "Blue Plaque London",
    "ブループラーク 巡り",
    "ロンドン 著名人 ゆかりの地",
    "English Heritage プラーク",
    "聖地巡礼 ロンドン",
  ],
});

export default function BluePlaquesHubPage() {
  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={bluePlaquesHubJsonLd(plaqueAreas)} />
      <JsonLd
        data={sightseeingBreadcrumbJsonLd([
          { name: "ブループラーク巡り", path: BLUE_PLAQUES_BASE },
        ])}
      />

      <header className="mb-8">
        <p className="text-sm font-medium tracking-wide text-sky-600 dark:text-sky-300 mb-2">
          Blue Plaque Tour in London
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          ロンドン ブループラーク巡りガイド
        </h1>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>
            ロンドンの街を歩いていると、建物の壁に埋め込まれた青い円形のプレートを見かけることがあります。これはEnglish
            Heritageが運用する「ブループラーク」制度で、その建物にかつて誰が住み、何を成し遂げたかを記しています。
          </p>
          <p>
            このガイドではエリアごとに、実際に訪ねられるプラークだけを取り上げます。建物の多くは私有の住宅のため、外観の見学が中心になります。
          </p>
        </div>
      </header>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-full">
        {plaqueAreas.map((area) => {
          const coverPlaque = area.plaques.find(
            (p) => p.image && p.imageSource !== "instagram",
          );

          return (
            <Link key={area.slug} href={plaqueAreaPath(area.slug)} className="block">
              <Card className="w-full min-w-0 h-full overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                {coverPlaque?.image && (
                  <div className="relative aspect-[16/9] w-full">
                    <img
                      src={coverPlaque.image}
                      alt={area.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                )}
                <CardHeader className="space-y-2 px-4 py-3">
                  <p className="text-xs font-medium tracking-wide text-sky-600 dark:text-sky-300">
                    {area.eyebrow}
                  </p>
                  <CardTitle className="text-base font-semibold">
                    {area.title}のブループラーク
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="w-fit border-sky-300 text-sky-700 dark:border-sky-400 dark:text-sky-100"
                  >
                    {area.engTitle}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 text-sm leading-relaxed px-4 pb-4">
                  <p className="text-gray-700 dark:text-gray-200">{area.summary}</p>

                  <div className="flex items-start gap-2">
                    <Route className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-200">
                      {area.routeHint}
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 dark:text-gray-200">
                      掲載プラーク {area.plaques.length} 件
                    </p>
                  </div>

                  <p className="text-right text-xs text-sky-600 dark:text-sky-300 font-medium">
                    プラークを見る →
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Landmark className="h-5 w-5 text-sky-500" />
          プラークを巡る前に
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            <strong>ほとんどが私有の住宅です。</strong>
            公開されている博物館やホテルは一部にとどまり、大半は現在も人が暮らす建物です。プレートの見学・撮影にとどめ、敷地への立ち入りは控えてください。
          </li>
          <li>
            <strong>ブループラークにも本家と類似スキームがあります。</strong>
            このガイドで扱うのはEnglish
            Heritageの公式スキームのみです。自治体などが独自に設置する類似のプレートは対象外にしています。
          </li>
          <li>
            <strong>徒歩での散策が基本です。</strong>
            各エリアともに地下鉄駅数駅分の範囲に収まっているので、地図アプリを片手に歩いて回るのがおすすめです。
          </li>
        </ul>
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
