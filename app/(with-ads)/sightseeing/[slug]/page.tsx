export const revalidate = 60 * 60;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import {
  fetchAttractionDetails,
  fetchNearbyAttractions,
  fetchRandomAttractionsByCategory,
} from "@/utils/actions/attractions";
import { fetchMuseumIDandName } from "@/utils/actions/museums";
import { museumSlugForAttraction } from "@/lib/museum-attraction-pairs";
import CrossSectionLink from "@/components/shared/CrossSectionLink";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Baby, Flame, MapPin, Star, Tag, Ticket } from "lucide-react";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata, fitTitle, truncateDescription } from "@/lib/seo";
import {
  attractionBreadcrumbJsonLd,
  attractionJsonLd,
  attractionPath,
} from "@/components/sightseeing/jsonld";
import AttractionFactBar from "@/components/sightseeing/AttractionFactBar";
import AttractionVisitFlow from "@/components/sightseeing/AttractionVisitFlow";
import {
  areaGuidePath,
  getAreaMeta,
} from "@/components/sightseeing/areas/areas";
import {
  visibleSections,
  isRedundantOverview,
} from "@/components/sightseeing/sections";

const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

/**
 * engName はタイトルに入れない。h1 と JSON-LD で出しているうえ、
 * 日本語タイトルの限られた文字数を英名に使う理由がない。
 */
const TITLE_SUFFIXES = [
  "の見どころ・行き方・所要時間｜ロンドン観光ガイド",
  "の見どころ・所要時間｜ロンドン観光ガイド",
  "の見どころ・所要時間",
];

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const attraction = await fetchAttractionDetails(params.slug);

  if (!attraction) {
    return {
      title: "ロンドン観光ガイド | ジャスト・ロンドン",
      description: "ロンドン観光に役立つ情報をまとめて紹介します。",
      robots: { index: false, follow: true },
    };
  }

  const title = fitTitle(attraction.name, TITLE_SUFFIXES);

  // summary は135件すべてに入っている。ここでテンプレート文に差し替えると
  // 全スポットが同じスニペットになるので、必ず本文側を使う。
  const description = truncateDescription(
    attraction.summary ??
      attraction.tagline ??
      "ロンドン観光に役立つスポット情報を紹介します。"
  );

  // 構造化データは metadata.other ではなく body の <script> で出す(JsonLd コンポーネント)
  return buildPageMetadata({
    path: attractionPath(params.slug),
    title,
    description,
    titleSuffix: false,
    images: attraction.image ? [attraction.image] : undefined,
  });
}

function RecommendLevel({ level }: { level: number }) {
  return (
    <div
      className="inline-flex items-center gap-3 rounded-full 
      bg-neutral-100 px-4 py-2 
      dark:bg-neutral-900/80 dark:ring-1 dark:ring-neutral-800
    "
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < level
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-300 dark:text-neutral-600"
            }`}
          />
        ))}
      </div>

      <div
        className="flex items-center gap-1 text-xs 
        text-neutral-600 dark:text-neutral-400
      "
      >
        <span>おすすめ度</span>
        <span className="font-medium">{level}</span>
      </div>
    </div>
  );
}

function AttractionBadges({ attraction }: { attraction: any }) {
  return (
    <div className="flex flex-wrap gap-2">
      {attraction.mustSee && (
        <Badge
          className="flex items-center gap-1 
          bg-red-500 text-white 
          dark:bg-red-600
        "
        >
          <Flame className="h-3 w-3" />
          MUST SEE
        </Badge>
      )}

      {attraction.isForKids && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 
            dark:bg-neutral-800 dark:text-neutral-200
          "
        >
          <Baby className="h-3 w-3" />
          子ども向け
        </Badge>
      )}

      {attraction.isFree && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 
            dark:bg-neutral-800 dark:text-neutral-200
          "
        >
          <Ticket className="h-3 w-3" />
          無料
        </Badge>
      )}
    </div>
  );
}

/**
 * category は DB 上 "historic" のような英字スラッグなので、そのまま出すと
 * 読者には意味が伝わらない。リンク先(フィルタ)はスラッグのまま、
 * 表示だけ日本語の短いラベルに置き換える。
 */
const categoryChipMap: Record<string, string> = {
  entertainment: "エンタメ・体験",
  tour: "ツアー・街歩き",
  garden: "庭園・公園",
  royal: "王室・宮殿",
  shop: "ショッピング",
  architecture: "建築・街並み",
  historic: "歴史・文化",
  seasonal: "季節限定",
  museum: "美術館・博物館",
};

function CategoryLink({ category }: { category: string }) {
  return (
    <Link
      href={`/sightseeing/all?category=${encodeURIComponent(category)}`}
      className="inline-flex items-center gap-1 rounded-full border
        px-3 py-1 text-xs
        text-neutral-600 border-neutral-300
        transition
        hover:bg-neutral-100
        dark:text-neutral-300 dark:border-neutral-700
        dark:hover:bg-neutral-800
      "
    >
      <Tag className="h-3 w-3" />
      {categoryChipMap[category] ?? category}
    </Link>
  );
}

/**
 * このスポットが属する街区へのリンク。
 *
 * area が null のスポット(郊外、ツアー商品など)では何も出さない。
 * エリアガイドを持たない街区に飛ばすと行き止まりになるので、
 * areas.ts に定義のある slug のときだけリンクする。
 */
function AreaLink({ area }: { area: string | null }) {
  if (!area) return null;

  const meta = getAreaMeta(area);
  if (!meta) return null;

  return (
    <Link
      href={areaGuidePath(meta.slug)}
      className="inline-flex items-center gap-1 rounded-full border
        px-3 py-1 text-xs
        text-emerald-700 border-emerald-300
        transition
        hover:bg-emerald-50
        dark:text-emerald-400 dark:border-emerald-800
        dark:hover:bg-emerald-950/40
      "
    >
      <MapPin className="h-3 w-3" />
      {meta.label}を歩く
    </Link>
  );
}

export default async function AttractionDetail({
  params,
}: {
  params: { slug: string };
}) {
  const attraction = await fetchAttractionDetails(params.slug);
  if (!attraction) redirect("/");

  // 近隣スポットは徒歩導線、同カテゴリーは興味の近さ。役割が違うので両方出す。
  const [nearby, related] = await Promise.all([
    fetchNearbyAttractions(
      { lat: attraction.lat, lng: attraction.lng },
      params.slug,
      4,
    ),
    fetchRandomAttractionsByCategory(attraction.category, params.slug, 2),
  ]);

  // 近隣枠に出したスポットを同カテゴリー枠で繰り返さない。
  const nearbySlugs = new Set(nearby.map((spot) => spot.slug));
  const relatedWithoutNearby = related.filter(
    (spot) => !nearbySlugs.has(spot.slug),
  );
  // 料金・アクセス・開館時間はファクトバーへ移したので本文からは伏せる。
  // ただし伏せるのはファクトバーに値が入っているときだけ(sections.ts 参照)。
  // 冒頭の summary と中身が重複する「概要」セクションもここで落とす。
  const bodySections = visibleSections(attraction.sections, {
    priceAdult: attraction.priceAdult,
    durationText: attraction.durationText,
    nearestStation: attraction.nearestStation,
    openingHours: attraction.openingHours,
  }).filter((sec) => !isRedundantOverview(sec, attraction.summary));

  // 同じ館が /museums 側にもある場合は、そちらの詳しい解説へ渡す。
  // 対応表に無ければ null のままで、リンクは出さない。
  const pairedMuseumSlug = museumSlugForAttraction(params.slug);
  const pairedMuseum = pairedMuseumSlug
    ? await fetchMuseumIDandName(pairedMuseumSlug)
    : null;

  return (
    <main className="w-full max-w-5xl mx-auto">
      <JsonLd data={attractionBreadcrumbJsonLd(attraction)} />
      <JsonLd data={attractionJsonLd(attraction)} />
      <div className="mb-4">
        <BreadCrumbs
          name="観光ガイド"
          link="sightseeing"
          name2={
            attraction.name.length > 7
              ? attraction.name.slice(0, 7) + "..."
              : attraction.name
          }
        />
      </div>
      {/* Hero image full width */}
      <Dialog>
        {/* 通常表示（クリックで開く） */}
        <DialogTrigger asChild>
          <div className="relative w-full aspect-[3/1] overflow-hidden">
            {/* RecommendLevel Overlay */}
            {attraction.recommendLevel && (
              <div className="absolute bottom-4 right-4 z-10">
                <RecommendLevel level={attraction.recommendLevel} />
              </div>
            )}

            {/* このページのLCP要素。priority を付けないと最後に読み込まれる */}
            <Image
              src={attraction.image}
              alt={`${attraction.name}｜ロンドン観光スポット`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        </DialogTrigger>

        {/* 拡大表示 */}
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/80 border-none">
          <img
            src={attraction.image}
            alt={`${attraction.name}｜ロンドン観光スポット`}
            className="w-full h-full object-contain"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </DialogContent>
      </Dialog>

      {/* Title + Location */}
      <section className="px-6 py-6 space-y-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          <span>{attraction.name}</span>
          <span className="ml-4 text-base md:text-lg font-light text-muted-foreground md:ml-3 md:mb-0 leading-none uppercase tracking-wider">
            {attraction.engName}
          </span>
        </h1>

        {/* リード文にはそのスポット固有の tagline を使う。
            ここには以前「◯◯は、ロンドンを代表する{カテゴリ名}で、初心者から
            リピーターまで楽しめる場所です」というテンプレート文が入っていたが、
            135ページすべてで同じ文面になるうえ、読者が最初に読む位置で
            何も言っていなかった。カテゴリの説明はバッジの方に任せる。 */}
        {attraction.tagline && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {attraction.tagline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <AttractionBadges attraction={attraction} />
          <CategoryLink category={attraction.category} />
          <AreaLink area={attraction.area} />
        </div>

        {/* 訪問前に知りたいこと。埋まっている項目だけが出る。 */}
        <AttractionFactBar
          priceAdult={attraction.priceAdult}
          priceChild={attraction.priceChild}
          durationText={attraction.durationText}
          nearestStation={attraction.nearestStation}
          openingHours={attraction.openingHours}
        />
      </section>
      <div className="mt-4 justify-center flex">
        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-4" />
      </div>

      <Tabs
        defaultValue="overview"
        className="bg-gray-50 dark:bg-gray-800 rounded-xl border mx-6 p-4 space-y-4"
      >
        <TabsList>
          {/* Render Overview tab only if address or website exists */}
          {(attraction.address !== "-" || attraction.website) && (
            <TabsTrigger value="overview">Overview</TabsTrigger>
          )}
          {/* Render Map tab only if address exists */}
          {attraction.address !== "-" && (
            <TabsTrigger value="location">Map</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Content */}
        {(attraction.address !== "-" || attraction.website) && (
          <TabsContent value="overview">
            <div className="space-y-4 text-gray-800 dark:text-gray-100 text-sm">
              <div>
                <p className="font-semibold">場所</p>
                {attraction.address &&
                attraction.address !== "-" &&
                attraction.engName ? (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      attraction.engName,
                    )}&query_place_id=${attraction.lat},${attraction.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-300 hover:underline"
                  >
                    {attraction.address}
                  </Link>
                ) : (
                  <span>--</span>
                )}
              </div>

              <div>
                <p className="font-semibold">公式サイト</p>
                {attraction.website ? (
                  <Link
                    href={attraction.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-300  hover:underline"
                  >
                    {attraction.website}
                  </Link>
                ) : (
                  <span>--</span>
                )}
              </div>
            </div>
          </TabsContent>
        )}

        {/* Map Content */}
        {attraction.address !== "-" && (
          <TabsContent value="location">
            <div className="my-8 space-y-2">
              <Card>
                <CardContent className="space-y-1">
                  <DynamicMap lat={attraction.lat} lng={attraction.lng} />
                  <div className="mt-2 text-xs md:text-sm">
                    {attraction.engName && (
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          attraction.engName,
                        )}&query_place_id=${attraction.lat},${attraction.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {attraction.address}
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* About section */}
      <section className="px-6 py-12 max-w-3xl mx-auto space-y-10">
        <div className="p-10 rounded-3xl shadow-md bg-white dark:bg-gray-800">
          <div className="relative float-left mr-6 mb-4 w-28 h-28">
            {/* 元画像は1.5MB。next/image に通して112pxのAVIF/WebPを配信する */}
            <Image
              src="/overview.png"
              alt="Overview Icon"
              width={112}
              height={112}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-md dark:bg-neutral-100"
              loading="lazy"
            />
          </div>

          {attraction.summary && (
            <p className="text-[18px] leading-relaxed text-neutral-800 dark:text-neutral-300  font-light whitespace-pre-line">
              {attraction.summary}
            </p>
          )}

          <div className="clear-both" />
        </div>

        {/* 着いてからの歩き方。visitFlow が入っているスポットにだけ出る。 */}
        <AttractionVisitFlow
          steps={attraction.visitFlow}
          attractionName={attraction.name}
        />

        {pairedMuseum && pairedMuseumSlug && (
          <CrossSectionLink
            href={`/museums/${pairedMuseumSlug}`}
            eyebrow="美術館・博物館ガイド"
            title={`${pairedMuseum.name}をじっくり見る`}
            description="注目作品、所要時間の目安、開館時間、館内の回り方は美術館ガイド側にまとめています。"
          />
        )}

        {nearby.length > 0 && (
          <section className="px-6 py-12 max-w-5xl mx-auto space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
              {attraction.name}の近くで一緒に回れるスポット
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              徒歩圏内にある観光スポットです。同じ日にまとめて回ると効率よく歩けます。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nearby.map((spot) => (
                <Link
                  key={spot.slug}
                  href={`/sightseeing/${spot.slug}`}
                  className="block group"
                >
                  <div className="rounded-lg overflow-hidden shadow hover:shadow-md transition">
                    <img
                      src={spot.image}
                      alt={`${spot.name}｜ロンドン観光スポット`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium group-hover:underline">
                    {spot.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    徒歩圏 約{spot.distanceKm.toFixed(1)}km
                    {spot.durationText ? `・所要 ${spot.durationText}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedWithoutNearby.length > 0 && (
          <section className="px-6 py-12 max-w-5xl mx-auto space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
              同じカテゴリーの観光スポット
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedWithoutNearby.map((spot) => (
                <Link
                  key={spot.slug}
                  href={`/sightseeing/${spot.slug}`}
                  className="block group"
                >
                  <div className="rounded-lg overflow-hidden shadow hover:shadow-md transition">
                    <img
                      src={spot.image}
                      alt={`${spot.name}｜ロンドン観光スポット`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium group-hover:underline">
                    {spot.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="mt-4 justify-center flex">
          <AdSenseUnit slot={AD_SLOTS.articleBottom} className="my-4" />
        </div>
        <div className="space-y-12">
          {bodySections.map((sec) => (
            <section
              key={sec.id}
              className="space-y-4 pb-4 border-l-4 border-neutral-300 pl-5 hover:border-neutral-500 transition-colors"
            >
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-neutral-400 inline-block"></span>
                {sec.title}
              </h2>

              <div className="prose prose-neutral max-w-none text-sm leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="mb-6 last:mb-0" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-xl font-semibold mt-8 mb-4"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc list-outside mb-6 last:mb-0"
                        {...props}
                      />
                    ),
                  }}
                >
                  {sec.description}
                </ReactMarkdown>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
