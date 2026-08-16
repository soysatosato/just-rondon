export const revalidate = 60 * 60;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  fetchAttractionDetails,
  fetchNearbyAttractions,
  fetchRandomAttractionsByCategory,
} from "@/utils/actions/attractions";
import { fetchMuseumIDandName } from "@/utils/actions/museums";
import { museumSlugForAttraction } from "@/lib/museum-attraction-pairs";
import CrossSectionLink from "@/components/shared/CrossSectionLink";
import { redirect } from "next/navigation";
import MarkdownBody from "@/components/jobs/MarkdownBody";
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
import AttractionLocation from "@/components/sightseeing/AttractionLocation";
import AttractionSpotRail from "@/components/sightseeing/AttractionSpotRail";
import {
  areaGuidePath,
  getAreaMeta,
} from "@/components/sightseeing/areas/areas";
import {
  visibleSections,
  isRedundantOverview,
  orderForReading,
  sectionAnchor,
} from "@/components/sightseeing/sections";
import { categoryChipMap } from "@/components/sightseeing/categories";

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

/**
 * 本文セクションの目次。
 *
 * セクションが3本以上あるときだけ出す。2本しかないページで目次を出しても
 * 下にスクロールすれば全部見えるので、場所を取るだけになる。
 */
function SectionToc({
  sections,
}: {
  sections: { id: number; title: string }[];
}) {
  if (sections.length < 3) return null;

  return (
    <nav
      aria-label="このページの内容"
      className="rounded-2xl border border-border bg-muted/40 p-5"
    >
      <p className="text-sm font-semibold text-muted-foreground">
        このページの内容
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {sections.map((sec) => (
          <li key={sec.id}>
            <a
              href={`#sec-${sec.id}`}
              className="text-sm text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
            >
              {sec.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
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
  // 残ったものは入力順ではなく「見どころ→歴史→その他」の読み物順に並べる。
  const bodySections = orderForReading(
    visibleSections(attraction.sections, {
      priceAdult: attraction.priceAdult,
      durationText: attraction.durationText,
      nearestStation: attraction.nearestStation,
      openingHours: attraction.openingHours,
    }).filter((sec) => !isRedundantOverview(sec, attraction.summary)),
  );

  // 同じ館が /museums 側にもある場合は、そちらの詳しい解説へ渡す。
  // 対応表に無ければ null のままで、リンクは出さない。
  const pairedMuseumSlug = museumSlugForAttraction(params.slug);
  const pairedMuseum = pairedMuseumSlug
    ? await fetchMuseumIDandName(pairedMuseumSlug)
    : null;

  return (
    <main className="mx-auto w-full max-w-5xl">
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
          <div className="relative aspect-[16/9] w-full overflow-hidden md:aspect-[3/1]">
            {/* RecommendLevel Overlay */}
            {attraction.recommendLevel ? (
              <div className="absolute bottom-4 right-4 z-10">
                <RecommendLevel level={attraction.recommendLevel} />
              </div>
            ) : null}

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
        <DialogContent className="max-h-[95vh] max-w-[95vw] border-none bg-black/80 p-0">
          <img
            src={attraction.image}
            alt={`${attraction.name}｜ロンドン観光スポット`}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </DialogContent>
      </Dialog>

      {/*
        ここから記事本体。以前は本文が地図・関連スポット・広告2つの後ろに
        あり、読者がこのページに来た理由(見どころ)が最下部に埋まっていた。
        読み物を先に出し、地図と回遊リンクは読み終えた後に置く。
      */}
      <article className="mx-auto max-w-3xl space-y-10 px-6 py-8">
        <header className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {attraction.name}
            {attraction.engName ? (
              <span className="ml-3 text-base font-light uppercase tracking-wider text-muted-foreground md:text-lg">
                {attraction.engName}
              </span>
            ) : null}
          </h1>

          {/* リード文にはそのスポット固有の tagline を使う。
              ここには以前「◯◯は、ロンドンを代表する{カテゴリ名}で、初心者から
              リピーターまで楽しめる場所です」というテンプレート文が入っていたが、
              135ページすべてで同じ文面になるうえ、読者が最初に読む位置で
              何も言っていなかった。カテゴリの説明はバッジの方に任せる。 */}
          {attraction.tagline && (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {attraction.tagline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <AttractionBadges attraction={attraction} />
            <CategoryLink category={attraction.category} />
            <AreaLink area={attraction.area} />
          </div>
        </header>

        {/* 訪問前に知りたいこと。埋まっている項目だけが出る。 */}
        <AttractionFactBar
          priceAdult={attraction.priceAdult}
          priceChild={attraction.priceChild}
          durationText={attraction.durationText}
          nearestStation={attraction.nearestStation}
          openingHours={attraction.openingHours}
          website={attraction.website}
        />

        {/* summary は導入文として本文の書体で出す。以前は丸いアイコン付きの
            白い箱に入れていたが、/overview.png が135ページすべてで同じ位置に
            出るだけで、読む助けにはなっていなかった。 */}
        {attraction.summary && (
          <p className="whitespace-pre-line border-l-4 border-neutral-300 pl-5 text-[17px] font-light leading-relaxed text-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
            {attraction.summary}
          </p>
        )}

        <SectionToc sections={bodySections} />

        {/* 本文。見どころが最初に来る。 */}
        <div className="space-y-12">
          {bodySections.map((sec) => (
            <section
              key={sec.id}
              id={sectionAnchor(sec)}
              className="scroll-mt-24 space-y-3"
            >
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {sec.title}
              </h2>
              {/* prose 系クラスはこのプロジェクトでは効かない
                  (@tailwindcss/typography が入っていない)。
                  見出し・箇条書き・表の見た目は MarkdownBody が持っている。 */}
              <MarkdownBody>{sec.description ?? ""}</MarkdownBody>
            </section>
          ))}
        </div>

        {/* 着いてからの歩き方。visitFlow が入っているスポットにだけ出る。 */}
        <AttractionVisitFlow
          steps={attraction.visitFlow}
          attractionName={attraction.name}
        />

        {/* 広告は本文を読み終えた位置に置く。以前は本文の前に2つあった。 */}
        <div className="flex justify-center">
          <AdSenseUnit slot={AD_SLOTS.inArticle} />
        </div>

        <AttractionLocation
          name={attraction.name}
          engName={attraction.engName}
          address={attraction.address}
          lat={attraction.lat}
          lng={attraction.lng}
          website={attraction.website}
        />

        {pairedMuseum && pairedMuseumSlug && (
          <CrossSectionLink
            href={`/museums/${pairedMuseumSlug}`}
            eyebrow="美術館・博物館ガイド"
            title={`${pairedMuseum.name}をじっくり見る`}
            description="注目作品、所要時間の目安、開館時間、館内の回り方は美術館ガイド側にまとめています。"
          />
        )}
      </article>

      {/* 回遊リンクは本文より広く使う。記事を読み終えた読者の次の一手。 */}
      <div className="mx-auto max-w-5xl space-y-12 px-6 pb-12">
        <AttractionSpotRail
          heading={`${attraction.name}の近くで一緒に回れるスポット`}
          description="徒歩圏内にある観光スポットです。同じ日にまとめて回ると効率よく歩けます。"
          spots={nearby.map((spot) => ({
            slug: spot.slug,
            name: spot.name,
            image: spot.image,
            distanceKm: spot.distanceKm,
            durationText: spot.durationText,
          }))}
        />

        <AttractionSpotRail
          heading="同じカテゴリーの観光スポット"
          spots={relatedWithoutNearby.map((spot) => ({
            slug: spot.slug,
            name: spot.name,
            image: spot.image,
          }))}
        />

        <div className="flex justify-center">
          <AdSenseUnit slot={AD_SLOTS.articleBottom} />
        </div>
      </div>
    </main>
  );
}
