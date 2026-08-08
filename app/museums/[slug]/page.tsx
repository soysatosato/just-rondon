import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import ShareButton from "@/components/museums/ShareButton";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMuseumDetailsBySlug } from "@/utils/actions/museums";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { FiMapPin } from "react-icons/fi";

import MuseumHero from "@/components/museums/MuseumHero";
import MuseumAbout from "@/components/museums/MuseumAbout";
import MuseumInfo from "@/components/museums/MuseumInfo";
import MuseumExhibitions from "@/components/museums/MuseumExhibitions";
import MuseumHighlightedArtworks from "@/components/museums/MuseumHighlightedArtworks";
import { MuseumTrivia } from "@/components/museums/MuseumTrivia";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import ContactDialog from "@/components/form/ContactDialog";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { buildPageMetadata, fitTitle, truncateDescription } from "@/lib/seo";

const TITLE_SUFFIXES = [
  "の見どころ・所要時間・アクセス｜ロンドン美術館ガイド",
  "の見どころ・所要時間｜ロンドン美術館ガイド",
  "の見どころ・所要時間",
];
import {
  museumBreadcrumbJsonLd,
  museumJsonLd,
  museumPath,
} from "@/components/museums/jsonld";
// dynamic 関数を使ってコンポーネントを、遅延読み込み（Dynamic Import）する
const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className=" h-[400px] w-full" />,
});
// const DynamicBookingWrapper = dynamic(
//   () => import("@/components/bookings/BookingWrapper"),
//   { ssr: false, loading: () => <Skeleton className=" h-[200px] w-full" /> }
// );

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const museum = await fetchMuseumDetailsBySlug(params.slug);

  // if (!museum) {
  //   return {
  //     title: "美術館情報が見つかりません",
  //     description: "指定された美術館の情報が見つかりませんでした。",
  //   };
  // }

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
        "ロンドンの美術館の見どころ、アクセス、注目作品、開催中の企画展を紹介します。"
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
  if (!museum) redirect("/");

  return (
    <section>
      <JsonLd data={museumBreadcrumbJsonLd(museum)} />
      <JsonLd data={museumJsonLd(museum)} />
      <MuseumBreadCrumbs name="美術館ナビ" name2={museum.name} link2="" />
      <header className="flex flex-row justify-between items-center md:items-center mt-4 gap-y-1 md:gap-y-0">
        <h1 className="text-xs md:text-sm font-semibold uppercase tracking-widest bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent relative">
          {museum.blurb}
        </h1>
        <div className="flex ml-2 gap-x-3 mt-1 md:mt-0">
          <ShareButton museumId={museum.id} name={museum.name} />
        </div>
      </header>
      <MuseumHero museum={museum} />
      <MuseumAbout description={museum.description} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-6" />

      <MuseumHighlightedArtworks
        slug={museum.slug}
        artworks={museum.artworks}
      />
      <MuseumInfo museumInfo={museum.museumInfo} />
      {museum.exhibition.length > 0 && (
        <MuseumExhibitions exhibitions={museum.exhibition} />
      )}
      {(museum.slug === "british-museum" ||
        museum.slug === "national-gallery") && (
        <div className="my-6 ">
          <ContactDialog />
        </div>
      )}
      <MuseumTrivia trivia={museum.trivia} />
      <section className="lg:grid gap-x-12 mt-12">
        <div className="">
          <Separator className="my-4" />
          <Card>
            <CardContent className="space-y-1">
              <CardHeader>
                <div className="flex items-center gap-2 ">
                  <FiMapPin className="w-5 h-5 text-blue-500 dark:text-blue-300 flex-shrink-0" />
                  <CardDescription>{museum.address}</CardDescription>
                </div>
              </CardHeader>
              <DynamicMap lat={museum.lat} lng={museum.lng} />
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  );
}
