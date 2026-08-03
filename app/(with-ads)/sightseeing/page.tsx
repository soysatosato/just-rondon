export const revalidate = 60 * 60;
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

import { CardCarousel } from "@/components/card/CardCarousel";

import {
  getHighlightAttractions,
  getMustSeeCategories,
  getSeasonalAttractions,
  getRoyalAttractions,
  getTours,
  getKidsAttractions,
  getFreeAttractions,
  getTodaysPicks,
} from "@/utils/sightseeing";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  faqPageJsonLd,
  sightseeingBreadcrumbJsonLd,
  sightseeingHubCollectionJsonLd,
} from "@/components/sightseeing/jsonld";
import { sightseeingFaqItems } from "@/components/sightseeing/faq";
import {
  travelGuidePath,
  travelGuides,
} from "@/components/sightseeing/guides/guides";

const PAGE_TITLE =
  "ロンドン観光ガイド | 定番スポット・宿泊・移動手段・モデルコース";
const PAGE_DESCRIPTION =
  "初めてのロンドン旅行に。ロンドン塔や大英博物館などの定番スポットに加え、どのエリアに泊まるか、地下鉄とタッチ決済の使い方、1〜5日のモデルコース、両替・治安・eSIMまで、旅の準備から現地の歩き方までまとめたロンドン観光ガイドです。";

export const metadata = buildPageMetadata({
  path: "/sightseeing",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン観光",
    "ロンドン 観光スポット",
    "ロンドン 旅行",
    "ロンドン モデルコース",
    "ロンドン ホテル エリア",
    "ロンドン 地下鉄",
    "オイスターカード",
    "ロンドン 旅行 準備",
    "ロンドン 定番",
    "ロンドン 子連れ",
    "ロンドン 無料",
    "ロンドン 見どころ",
  ],
});

export default async function Page() {
  const [
    highlightAttractions,
    mustSeeCategories,
    // seasonalAttractions,
    royalAttractions,
    tours,
    kidsAttractions,
    freeAttractions,
    todaysPicks,
  ] = await Promise.all([
    getHighlightAttractions(),
    getMustSeeCategories(),
    // getSeasonalAttractions(),
    getRoyalAttractions(),
    getTours(),
    getKidsAttractions(),
    getFreeAttractions(),
    getTodaysPicks(3),
  ]);

  return (
    <div className="min-h-screen">
      <JsonLd data={sightseeingBreadcrumbJsonLd()} />
      <JsonLd
        data={sightseeingHubCollectionJsonLd(travelGuides, {
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
        })}
      />
      <JsonLd
        data={faqPageJsonLd(sightseeingFaqItems, `${SITE_URL}/sightseeing`)}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-12">
        <section className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              London Sightseeing
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              ロンドンには、世界的に有名な観光スポットがぎゅっと詰まっています。
              王室ゆかりの宮殿や歴史ある教会、最先端の展望台や体験型ミュージアムまで、
              初めてのロンドンでも、リピーターでも楽しめる見どころが目白押しです。
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              ここでは、日本からの旅行者にも人気の「絶対に外せないスポット」を中心に、
              テーマ別にロンドンの見どころを整理して紹介します。
              多くの施設は事前予約制や日時指定チケット制なので、
              渡航前にオフィシャルサイトで最新情報を確認しておくと安心です。
            </p>
          </div>
          <div className="mt-4 justify-center flex">
            <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
          </div>
          {/* メインの4カード（ここはそのまま） */}
          <div className="grid gap-4 sm:grid-cols-2">
            {highlightAttractions.map((item: any, idx: any) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-32 w-full sm:h-40">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <p className="text-xs font-medium text-emerald-600">
                      {item.subtitle}
                    </p>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ロンドン観光の概要テキスト（そのまま） */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">ロンドン観光の始め方</h2>
          <p className="max-w-4xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            ロンドンの魅力は「歴史」と「今」が同時に存在していることです。
            タワー・オブ・ロンドンで中世の雰囲気を味わいつつ、
            ロンドン・アイからは近未来的なシティのビル群を見渡せます。
            ウェストミンスター寺院では英国の王室行事の舞台を見学し、
            バッキンガム宮殿では衛兵交代式を見守る——
            1日のうちに何世紀分もの時間旅行ができてしまうのがロンドンです。
          </p>
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            「何から回ればいいか分からない」という人は、
            まずは「必見スポット」と「シティパス」の情報を押さえ、
            1〜2日分のシンプルなモデルコースを作るのがおすすめです。
          </p>

          <div className="flex flex-wrap justify-end gap-4 mt-2">
            <Link
              href="/sightseeing/itinerary"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              1〜5日のモデルコースを見る →
            </Link>
            <Link
              href="/sightseeing/all"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              ロンドン観光スポット一覧を見る →
            </Link>
          </div>
        </section>

        {/* 旅の準備（宿泊・移動・モデルコース・実用情報のガイドへの導線） */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Travel Essentials
            </p>
            <h2 className="mt-2 text-xl font-semibold">旅の準備</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              どこに泊まるか、どう移動するか、何日で何を回るか。
              観光スポットを選ぶ前に決めておきたいことを、テーマ別のガイドにまとめました。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {travelGuides.map((guide) => (
              <Link key={guide.slug} href={travelGuidePath(guide.slug)}>
                <Card className="h-full border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition hover:border-emerald-400 hover:shadow-md dark:hover:border-emerald-500">
                  <CardHeader className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600">
                      {guide.eyebrow}
                    </p>
                    <CardTitle className="text-base">{guide.label}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-2">
                      {guide.blurb}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Today’s Picks（grid → carousel） */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Today’s Picks</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              本日のおすすめスポットをランダムにセレクト。
            </p>
          </div>

          <CardCarousel>
            {todaysPicks.map((item: any, idx: any) => (
              <div
                key={idx}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition">
                    <div className="relative h-32 w-full sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardHeader className="space-y-1">
                      <p className="text-xs font-semibold text-emerald-600">
                        Today’s Pick
                      </p>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* 必見スポットカテゴリ（ここはgridのまま維持） */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">ロンドン必見スポット</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              バッキンガム宮殿やビッグ・ベン、ロンドン・アイなど、
              「ロンドンらしさ」を感じる名所をテーマ別にチェックしましょう。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mustSeeCategories.map((item: any, idx: any) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-32 w-full sm:h-40">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <Card className="border-dashed border-slate-300 bg-slate-50 dark:bg-slate-700">
            <CardContent className="space-y-2 py-4 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold">
                Sightseeing pass（観光パス）をうまく使おう
              </p>
              <p>
                ロンドン・パスや他のシティパスを利用すると、
                人気アトラクションの入場料が最大50%程度節約できることもあります。
                自分の行きたい場所と比較しながら、もっともお得なパスを選びましょう。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* <section className="space-y-6">
          <h2 className="text-xl font-semibold">季節イベント</h2>

          <CardCarousel>
            {seasonalAttractions.map((item: any, idx: any) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%]">
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-32 w-full sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardContent className="space-y-1 py-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section> */}

        {/* 王室ゆかり（grid → carousel） */}
        <section className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">王室ゆかりのスポット</h3>

            <CardCarousel>
              {royalAttractions.map((item: any, idx: any) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_25%]"
                >
                  <Link href={`/sightseeing/${item.slug}`}>
                    <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                      <div className="relative h-32 w-full sm:h-40">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                      </div>
                      <CardContent className="space-y-1 py-2">
                        <p className="text-xs font-semibold">{item.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </CardCarousel>
          </div>
        </section>

        {/* ツアー（grid → carousel） */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">見逃せないロンドンツアー</h2>

          <CardCarousel>
            {tours.map((item: any, idx: any) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%]">
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-32 w-full sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardContent className="space-y-1 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        {item.badge && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                      {item.price && (
                        <p className="text-[11px] font-medium text-slate-900 dark:text-slate-100">
                          From {item.price}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* 家族向け（grid → carousel） */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">家族で楽しめるロンドン</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              子どもと一緒のロンドン旅行なら、体験型ミュージアムやアトラクションが充実したエリアを中心にホテルを選ぶと移動が楽になります。
              エリアごとの向き不向きは
              <Link
                href="/sightseeing/hotels"
                className="mx-1 font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                宿泊エリア別ホテル選び
              </Link>
              にまとめています。
            </p>
          </div>

          <CardCarousel>
            {kidsAttractions.map((item: any, idx: any) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%]">
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-32 w-full sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardContent className="space-y-1 py-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            無料で楽しめるロンドンの施設
          </h2>
          <p className="max-w-4xl text-sm text-slate-600 dark:text-slate-300">
            ロンドンには、国立博物館や美術館だけでなく、
            公園、マーケット、歴史的建造物、展望スポットなど、
            入場無料で楽しめる施設や見どころが数多くあります
            （一部エリアや特別展示は有料の場合あり）。
            予算を抑えながらも、ロンドンらしい文化や街の雰囲気を存分に味わえるのが魅力です。
          </p>

          <CardCarousel>
            {freeAttractions.map((item, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                {/* getFreeAttractions() が返すのは Attraction。
                    /museums/[slug] は Museum テーブルを引くので繋がらない。 */}
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-32 w-full sm:h-40">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed line-clamp-2">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* FAQ（Card一覧 → Accordion） */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">ロンドン観光 FAQ</h2>

          <Accordion type="single" collapsible className="space-y-3">
            {sightseeingFaqItems.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-none"
              >
                <Card className="border-none shadow-sm">
                  <AccordionTrigger className="px-6 py-4">
                    <span className="text-sm font-semibold">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer.map((line: any, i: any) => (
                        <div key={i} className="flex gap-1">
                          <span className="shrink-0">・</span>
                          <div className="prose prose-slate max-w-none">
                            <ReactMarkdown>{line}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  );
}
