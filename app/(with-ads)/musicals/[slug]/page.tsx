import { Skeleton } from "@/components/ui/skeleton";
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

  return {
    title: `${musical?.name}・${musical?.engName}｜ロンドン観光・ミュージカルガイド`,
    description: `${musical?.name}|${musical?.engName}・ミュージカルの見どころ、アクセス、あらすじ、歌などを紹介。ロンドン観光で絶対に訪れたいミュージカルの情報・これだけは観るべき必見作品をわかりやすくガイドします。`,
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/musicals/${params.slug}`,
      title: `${musical?.name}・${musical?.engName}｜ロンドン観光・ミュージカルガイド`,
      description: `${musical?.name}|${musical?.engName}・ミュージカルの見どころ、アクセス、あらすじ、歌などを紹介。`,
      siteName: "ジャスト・ロンドン",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/musicals/${params.slug}`,
    },
  };
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(musicalBreadcrumbJsonLd(musical)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(theaterEventJsonLd(musical)),
        }}
      />
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

        <MusicalInfo
          isOnShow={musical.isOnShow}
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
