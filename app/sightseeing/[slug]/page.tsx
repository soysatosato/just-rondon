import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import {
  fetchAttractionDetails,
  fetchRandomAttractionsByCategory,
} from "@/utils/actions/attractions";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Baby, Flame, Star, Tag, Ticket } from "lucide-react";

const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const attraction = await fetchAttractionDetails(params.slug);

  if (!attraction) {
    return {
      title: "ロンドン観光ガイド | ロンドん!",
      description: "ロンドン観光に役立つ情報をまとめて紹介します。",
    };
  }

  const title = `${attraction.name} | ${
    attraction.engName ?? "London Attraction"
  } の見どころ・行き方・所要時間｜ロンドン観光ガイド`;

  const description = attraction.summary
    ? `「${attraction.name}」の魅力や見どころ、アクセス情報を詳しく紹介。ロンドンの人気観光スポットの完全ガイド。`
    : "ロンドン観光に役立つスポット情報を紹介します。";

  const canonicalUrl = `https://www.just-rondon.com/attractions/${params.slug}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title,
      description,
      siteName: "ロンドん!",
      locale: "ja_JP",
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TouristAttraction",
        name: attraction.name,
        description: attraction.summary,
        address: attraction.address,
        geo: {
          "@type": "GeoCoordinates",
          latitude: attraction.lat,
          longitude: attraction.lng,
        },
        isAccessibleForFree: attraction.isFree,
      }),
    },
  };
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
      {category}
    </Link>
  );
}

const categoryLabelMap: Record<string, string> = {
  entertainment: "エンターテインメント・体験型アトラクション",
  tour: "観光ツアー・街歩き・ガイド付き体験",
  garden: "庭園・公園・自然を楽しめる名所",
  royal: "王室・宮殿・ロイヤルファミリーゆかりの名所",
  shop: "ショッピング・マーケット・買い物スポット",
  architecture: "建築・街並み・写真映えする見どころ",
  historic: "歴史・文化・世界遺産クラスの名所",
  seasonal: "期間限定イベント・季節限定の見どころ",
};

export default async function AttractionDetail({
  params,
}: {
  params: { slug: string };
}) {
  const attraction = await fetchAttractionDetails(params.slug);
  if (!attraction) redirect("/");

  const related = await fetchRandomAttractionsByCategory(
    attraction.category,
    params.slug,
    2
  );
  const categoryLabel =
    categoryLabelMap[attraction.category] ?? "観光・見どころ満載の人気スポット";

  return (
    <main className="w-full max-w-5xl mx-auto">
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

            <img
              src={attraction.image}
              alt={`${attraction.name}｜ロンドン観光スポット`}
              className="w-full h-full object-cover"
            />
          </div>
        </DialogTrigger>

        {/* 拡大表示 */}
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/80 border-none">
          <img
            src={attraction.image}
            alt={`${attraction.name}｜ロンドン観光スポット`}
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>

      {/* Title + Location */}
      <section className="px-6 py-6 space-y-3">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          <span>{attraction.name}</span>
          <span className="ml-4 text-base md:text-lg font-light text-muted-foreground md:ml-3 md:mb-0 leading-none uppercase tracking-wider">
            {attraction.engName}
          </span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {attraction.name} は、ロンドンを代表する
          {categoryLabel}
          で、初心者からリピーターまで楽しめる場所です。
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <AttractionBadges attraction={attraction} />
          <CategoryLink category={attraction.category} />
        </div>

        {attraction.tagline && (
          <p className="text-sm italic text-muted-foreground">
            {attraction.tagline}
          </p>
        )}
      </section>

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
                      attraction.engName
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
                          attraction.engName
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
            <img
              src="/overview.png"
              alt="Overview Icon"
              className="absolute inset-0 w-full h-full object-contain drop-shadow-md dark:bg-neutral-100"
              loading="lazy"
              decoding="async"
            />
          </div>

          {attraction.summary && (
            <p className="text-[18px] leading-relaxed text-neutral-800 dark:text-neutral-300  font-light whitespace-pre-line">
              {attraction.summary}
            </p>
          )}

          <div className="clear-both" />
        </div>
        {related.length > 0 && (
          <section className="px-6 py-12 max-w-5xl mx-auto space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
              同じカテゴリーの観光スポット
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((spot) => (
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

        <div className="space-y-12">
          {attraction.sections?.map((sec) => (
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
