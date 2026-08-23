import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import ShareButton from "@/components/museums/ShareButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchMuseumDetailsBySlug } from "@/utils/actions/museums";
import { fetchAttractionName } from "@/utils/actions/attractions";
import { attractionSlugForMuseum } from "@/lib/museum-attraction-pairs";
import CrossSectionLink from "@/components/shared/CrossSectionLink";
import ViewTracker from "@/components/analytics/ViewTracker";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

import MuseumHero from "@/components/museums/MuseumHero";
import MuseumAbout from "@/components/museums/MuseumAbout";
import MuseumInfo from "@/components/museums/MuseumInfo";
import MuseumExhibitions from "@/components/museums/MuseumExhibitions";
import MuseumHighlightSpots from "@/components/museums/MuseumHighlightSpots";
import MuseumHighlightedArtworks from "@/components/museums/MuseumHighlightedArtworks";
import { MuseumTrivia } from "@/components/museums/MuseumTrivia";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { buildPageMetadata, fitTitle, truncateDescription } from "@/lib/seo";
import {
  museumBreadcrumbJsonLd,
  museumJsonLd,
  museumPath,
} from "@/components/museums/jsonld";

const TITLE_SUFFIXES = [
  "の見どころ・所要時間・アクセス｜ロンドン美術館ガイド",
  "の見どころ・所要時間｜ロンドン美術館ガイド",
  "の見どころ・所要時間",
];

const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const museum = await fetchMuseumDetailsBySlug(params.slug);

  return buildPageMetadata({
    path: museumPath(params.slug),
    // 「◯◯ 見どころ」「◯◯ 所要時間」で流入しているので、その2語を
    // タイトルの読める範囲に入れる。engName は h1 と JSON-LD にあるため、
    // 日本語タイトルの限られた文字数を英名に使わない。
    title: fitTitle(museum?.name ?? "ロンドンの美術館", TITLE_SUFFIXES),
    titleSuffix: false,
    // 館ごとに違う説明を出す。テンプレート文に名前だけ差し込むと
    // 全館が同じスニペットになり、順位が付いてもクリックされない。
    //
    // summary ではなく description を使う。summary は
    // 「・ルネサンス絵画 ・オランダ絵画」という箇条書きで、
    // スニペットに出すと文章として読めない。description は全47件が散文。
    description: truncateDescription(
      museum?.description ??
        museum?.tagline ??
        "ロンドンの美術館の見どころ、アクセス、注目作品、開催中の企画展を紹介します。",
    ),
    images: museum?.image ? [museum.image] : undefined,
  });
}

export default async function MuseumDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const museum = await fetchMuseumDetailsBySlug(params.slug);
  // 以前は redirect("/") でトップへ飛ばしていた。存在しない slug は
  // 404 を返さないと、消えたページが延々 200 を返し続けることになる。
  if (!museum) notFound();

  // 同じ館が /sightseeing 側にもある場合は、そちらの観光目線のページへ渡す。
  const pairedAttractionSlug = attractionSlugForMuseum(params.slug);
  const pairedAttraction = pairedAttractionSlug
    ? await fetchAttractionName(pairedAttractionSlug)
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      <JsonLd data={museumBreadcrumbJsonLd(museum)} />
      <JsonLd data={museumJsonLd(museum)} />

      <div className="pt-4">
        <MuseumBreadCrumbs name="美術館ナビ" name2={museum.name} link2="" />
      </div>

      <MuseumHero museum={museum} />

      {/* blurb は詩的な一文。以前はこれを h1 にしていたため、
          館名の h1 と二重になっていた。リード文として置く。 */}
      {museum.blurb && (
        <div className="mt-6 flex items-start justify-between gap-4">
          <p className="border-l-2 border-indigo-500 pl-4 text-sm italic leading-relaxed text-muted-foreground">
            {museum.blurb}
          </p>
          <div className="shrink-0">
            <ShareButton museumId={museum.id} name={museum.name} />
          </div>
        </div>
      )}

      <MuseumAbout description={museum.description} />

      <MuseumHighlightSpots
        highlights={museum.highlightSpots}
        museumName={museum.name}
      />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-6" />

      <MuseumHighlightedArtworks
        slug={museum.slug}
        artworks={museum.artworks}
      />

      <MuseumInfo museumInfo={museum.museumInfo} />

      <MuseumExhibitions exhibitions={museum.exhibition} />

      <MuseumTrivia trivia={museum.trivia} />

      {/* 地図 */}
      <section className="px-4 py-10">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Access
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight">場所</h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {museum.address}
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <DynamicMap lat={museum.lat} lng={museum.lng} />
        </div>
      </section>

      {pairedAttraction && pairedAttractionSlug && (
        <div className="mx-4 mb-6">
          <CrossSectionLink
            href={`/sightseeing/${pairedAttractionSlug}`}
            eyebrow="ロンドン観光ガイド"
            title={`${museum.name}を観光ルートに組み込む`}
            description="周辺スポットとの回り方や、同じエリアで一緒に回れる見どころは観光ガイド側で紹介しています。"
          />
        </div>
      )}

      <section className="mx-4 rounded-2xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-bold tracking-tight">
          ほかの美術館も見る
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          ロンドンには無料で入れる館が多くあります。近くの館と組み合わせて回るのがおすすめです。
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/museums/all-museums">美術館の一覧へ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/museums">美術館ガイドのトップへ</Link>
          </Button>
        </div>
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.articleBottom} />
      </div>

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="museum" slug={museum.slug} />
    </div>
  );
}
