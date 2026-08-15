import { Skeleton } from "@/components/ui/skeleton";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  fetchMusicalDetails,
  fetchMusicalIdandName,
} from "@/utils/actions/musicals";
import MusicalSceneDescription from "@/components/musicals/MusicalSceneDescription";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import MusicalInfo from "@/components/musicals/MusicalInfo";
import MusicalHero from "@/components/musicals/MusicalHero";
import MusicalBreadCrumbs from "@/components/musicals/BreadCrumbs";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Theater } from "lucide-react";
import {
  musicalBreadcrumbJsonLd,
  theaterEventJsonLd,
} from "@/components/musicals/jsonld";

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
  const musical = await fetchMusicalIdandName(params.slug);

  if (!musical) {
    return {
      title: "ミュージカル情報が見つかりません | ジャスト・ロンドン",
      description: "指定されたミュージカルの情報が見つかりませんでした。",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    path: `/musicals/${params.slug}`,
    // ミュージカルは英題で検索されることも多いので engName は残す。
    // 観光スポットや美術館と違い、英題そのものが検索語になる。
    title: `${musical.name}・${musical.engName}｜あらすじ・見どころ・チケット`,
    titleSuffix: false,
    // Musical.summary は必須カラムなのでフォールバックは要らない。
    description: truncateDescription(musical.summary),
    type: "article",
  });
}

export default async function musicalDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const musical = await fetchMusicalDetails(params.slug);
  if (!musical) redirect("/");

  return (
    <div>
      <JsonLd data={musicalBreadcrumbJsonLd(musical)} />
      <JsonLd data={theaterEventJsonLd(musical)} />
      <MusicalBreadCrumbs
        name={
          musical.name.length > 7
            ? musical.name.slice(0, 7) + "..."
            : musical.name
        }
      />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        <MusicalHero
          name={musical.name}
          engName={musical.engName}
          tagline={musical.tagline}
          image={musical.image}
          slug={musical.slug}
          website={musical.website}
          highlights={musical.highlights}
          blurb={musical.blurb}
          mustSee={musical.mustSee}
          recommendLevel={musical.recommendLevel}
          theatreName={musical.theatreName}
          songsCount={musical.songs.length}
        />

        <AdSenseUnit slot={AD_SLOTS.inArticle} />

        <MusicalInfo
          isOnShow={musical.isOnShow}
          lastVerifiedAt={musical.lastVerifiedAt}
          original={musical.original}
          recommendLevel={musical.recommendLevel}
        />

        <MusicalSceneDescription
          name={musical.name}
          description={musical.description}
        />

        <div id="theatre-info" className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            劇場情報
          </h2>
          <Card className="rounded-2xl border-border shadow-sm">
            <CardContent className="space-y-1">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Theater className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle>{musical.theatreName}</CardTitle>
                  <CardDescription>{musical.address}</CardDescription>
                </div>
              </CardHeader>
              <DynamicMap lat={musical.lat} lng={musical.lng} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
