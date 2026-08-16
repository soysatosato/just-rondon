import { Skeleton } from "@/components/ui/skeleton";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  fetchMusicalDetails,
  fetchMusicalIdandName,
  fetchMusicalPerformances,
} from "@/utils/actions/musicals";
import MusicalSchedule from "@/components/musicals/MusicalSchedule";
import MusicalSceneDescription from "@/components/musicals/MusicalSceneDescription";
import { parseCharacters } from "@/components/musicals/story";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import MusicalInfo from "@/components/musicals/MusicalInfo";
import MusicalPracticalFacts from "@/components/musicals/MusicalPracticalFacts";
import MusicalHero from "@/components/musicals/MusicalHero";
import { theatrePath } from "@/components/musicals/theatres/theatres";
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

  const performances = await fetchMusicalPerformances(musical.id);

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

        {/* あらすじを実用情報より先に置く。読者はまず「観たいか」を決め、
            そのあとで「いつ観るか」を調べる。上演時間や日程を先に見せると、
            まだ興味を持っていない読者に予定の話を始めることになる。 */}
        <MusicalSceneDescription
          name={musical.name}
          description={musical.description}
          storyHook={musical.storyHook}
          characters={parseCharacters(musical.characters)}
          storyEnding={musical.storyEnding}
        />

        <MusicalInfo
          isOnShow={musical.isOnShow}
          lastVerifiedAt={musical.lastVerifiedAt}
          original={musical.original}
          recommendLevel={musical.recommendLevel}
        />

        <MusicalPracticalFacts
          name={musical.name}
          facts={{
            runtimeMinutes: musical.runtimeMinutes,
            intervalMinutes: musical.intervalMinutes,
            minAgeGuidance: musical.minAgeGuidance,
            englishForm: musical.englishForm,
            englishNote: musical.englishNote,
          }}
          factsVerifiedAt={musical.factsVerifiedAt}
        />

        <MusicalSchedule
          performances={performances}
          fetchedAt={performances[0]?.updatedAt ?? null}
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
                  {/* theatre は移行済みの作品だけが持つ。未紐付けの作品は
                      theatreName の文字列にフォールバックする。 */}
                  <CardTitle>
                    {musical.theatre?.name ?? musical.theatreName}
                  </CardTitle>
                  <CardDescription>
                    {musical.theatre?.address ?? musical.address}
                  </CardDescription>
                </div>
              </CardHeader>
              {musical.theatre && (
                <p className="px-6 text-sm text-muted-foreground">
                  座席の選び方や最寄り駅は
                  <Link
                    href={theatrePath(musical.theatre.slug)}
                    className="mx-1 text-primary underline hover:opacity-80"
                  >
                    {musical.theatre.name}の劇場ガイド
                  </Link>
                  にまとめています。
                </p>
              )}
              <DynamicMap
                lat={musical.theatre?.lat ?? musical.lat}
                lng={musical.theatre?.lng ?? musical.lng}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
