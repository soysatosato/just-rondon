import { Skeleton } from "@/components/ui/skeleton";
import {
  buildPageMetadata,
  displayWidth,
  fitTitle,
  truncateDescription,
} from "@/lib/seo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  fetchMusicalDetails,
  fetchMusicalIdandName,
  fetchMusicalPerformances,
  fetchMusicalSlugs,
} from "@/utils/actions/musicals";
import MusicalSchedule from "@/components/musicals/MusicalSchedule";
import MusicalSceneDescription from "@/components/musicals/MusicalSceneDescription";
import { parseAppeals, parseCharacters } from "@/components/musicals/story";
import {
  hasMusicalStory,
  musicalStoryPath,
} from "@/components/musicals/stories/stories";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatMinAge, formatRuntime } from "@/components/musicals/facts";
import MusicalInfo from "@/components/musicals/MusicalInfo";
import MusicalPracticalFacts from "@/components/musicals/MusicalPracticalFacts";
import MusicalFactBar from "@/components/musicals/MusicalFactBar";
import MusicalHero from "@/components/musicals/MusicalHero";
import { theatrePath } from "@/components/musicals/theatres/theatres";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import ViewTracker from "@/components/analytics/ViewTracker";
import StampButton from "@/components/stamps/StampButton";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Theater } from "lucide-react";
import { theaterEventJsonLd } from "@/components/musicals/jsonld";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

// dynamic 関数を使ってコンポーネントを、遅延読み込み（Dynamic Import）する
const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className=" h-[400px] w-full" />,
});
// const DynamicBookingWrapper = dynamic(
//   () => import("@/components/bookings/BookingWrapper"),
//   { ssr: false, loading: () => <Skeleton className=" h-[200px] w-full" /> }
// );

// 公演日程は scripts/sync-musical-performances.ts が DB に書き足す。
export const revalidate = 60 * 60;

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
export async function generateStaticParams() {
  return fetchMusicalSlugs();
}

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

  // ミュージカルは英題で検索されることも多いので engName は残す。
  // 観光スポットや美術館と違い、英題そのものが検索語になる。
  const fullName = `${musical.name}・${musical.engName}`;

  /*
    あらすじ専用ページ(/musicals/[slug]/story)を持つ作品は、作品ページの
    タイトルと description から「あらすじ」を外す。

    story ページは「あらすじ」の検索を作品ページから引き取るために
    2026-09-09 に立てたが、作品ページも「…｜あらすじ・見どころ・チケット」
    と名乗り、description も筋の要約のままだった。2026-07-28〜10-25 の
    Search Console では「レミゼラブル あらすじ/ネタバレ/内容/結末」の
    約1,500表示を作品ページが14〜33位で受け、story ページはほぼ出ていない
    (Google が同じ語に2ページを持て余して、弱い方の作品ページを出している)。
    作品ページは「ロンドンで観る」ための実用ページとして名乗り直す。
    実際に「レミゼラブル ロンドン」系の検索がこちらに来ている。
  */
  if (hasMusicalStory(params.slug)) {
    return buildPageMetadata({
      path: `/musicals/${params.slug}`,
      title: fitTitle(
        fullName,
        [
          "｜ロンドンの劇場・上演時間・チケット",
          "｜ロンドン公演の劇場とチケット",
          "｜ロンドン公演とチケット",
          "｜劇場とチケット",
        ],
        displayWidth,
      ),
      titleSuffix: false,
      description: practicalDescription(musical),
      type: "article",
    });
  }

  return buildPageMetadata({
    path: `/musicals/${params.slug}`,
    title: `${fullName}｜あらすじ・見どころ・チケット`,
    titleSuffix: false,
    // Musical.summary は必須カラムなのでフォールバックは要らない。
    description: truncateDescription(musical.summary),
    type: "article",
  });
}

/**
 * あらすじ専用ページを持つ作品の、作品ページ側の description。
 *
 * どこで・何時間・何歳からを先に書き、筋は story ページへ送る。数字は
 * 冒頭の MusicalFactBar と同じ DB の値と言い回し(facts.ts)を使う。
 * 未確認の項目は文ごと出さない。ページに無いもの(チケットの取り方の
 * 解説は /musicals/west-end-tickets 側)は書かない。
 */
function practicalDescription(musical: {
  name: string;
  summary: string;
  theatreName: string | null;
  theatre: { name: string } | null;
  runtimeMinutes: number | null;
  intervalMinutes: number | null;
  minAgeGuidance: number | null;
  isOnShow: boolean;
}): string {
  const theatre = musical.theatre?.name ?? musical.theatreName;
  const runtime = formatRuntime(musical.runtimeMinutes, musical.intervalMinutes);
  const minAge = formatMinAge(musical.minAgeGuidance);

  const sentences: string[] = [];
  if (theatre) {
    sentences.push(
      musical.isOnShow
        ? `${musical.name}のロンドン公演は${theatre}で上演中。`
        : `${musical.name}のロンドン公演（${theatre}）は現在上演していません。`,
    );
  }
  const details = [runtime && `上演時間${runtime}`, minAge].filter(
    (d): d is string => Boolean(d),
  );
  if (details.length > 0) sentences.push(`${details.join("、")}。`);

  // 劇場も上演時間も未確認なら、言えることが無いので筋の要約に戻す。
  if (sentences.length === 0) return truncateDescription(musical.summary);

  sentences.push(
    musical.isOnShow
      ? "劇場と予約先、観る前に知っておきたい見どころをまとめ、あらすじは結末まで別ページで解説しています。"
      : "観る前に知っておきたい見どころをまとめ、あらすじは結末まで別ページで解説しています。",
  );
  return truncateDescription(sentences.join(""));
}

export default async function musicalDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const musical = await fetchMusicalDetails(params.slug);
  // 存在しない slug は 404 を返す。以前は redirect("/") でトップへ飛ばして
  // いたが、古いリンクから来た人は理由も分からずトップに着き、Google には
  // soft 404 と扱われる。美術館の詳細(app/museums/[slug])と同じ直し方。
  if (!musical) notFound();

  const performances = await fetchMusicalPerformances(musical.id);

  return (
    <div>
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/musicals",
          current: musical.name,
          currentHref: `/musicals/${musical.slug}`,
        })}
      />
      <JsonLd data={theaterEventJsonLd(musical, performances)} />
      <Breadcrumbs path="/musicals" current={musical.name} className="pt-4" />
      {/* 左右の余白は sm 以上だけ。外側の container が既に 16px を持っている。 */}
      <div className="max-w-5xl mx-auto py-8 sm:px-4 sm:py-12 space-y-10">
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
          isOnShow={musical.isOnShow}
        />

        {/*
          冒頭の要約。どこで・何時間・何歳から・英語・直近の公演を1行ずつ。
          説明と全日程は下の節に置いたままにする(MusicalFactBar.tsx 参照)。
        */}
        <MusicalFactBar
          theatreName={musical.theatre?.name ?? musical.theatreName}
          nearestStation={musical.theatre?.nearestStation ?? null}
          facts={{
            runtimeMinutes: musical.runtimeMinutes,
            intervalMinutes: musical.intervalMinutes,
            minAgeGuidance: musical.minAgeGuidance,
            englishForm: musical.englishForm,
            englishNote: musical.englishNote,
          }}
          nextPerformance={performances[0] ?? null}
          hasSchedule={performances.length > 0}
        />

        {/*
          観た作品を記録する。あらすじより前に置いているのは、観た人にとって
          このページが「結末の確認」ではなく「観た記録」を残す場所になるため。
          あらすじの後ろに置くと、結末のネタバレを越えないと押せない。
          箱ではなくボタンだけの inline にして、あらすじの前で場所を取らない。
        */}
        <StampButton
          variant="inline"
          type="musical"
          id={musical.id}
          name={musical.name}
          engName={musical.engName}
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
          appeals={parseAppeals(musical.appeals)}
          storyEnding={musical.storyEnding}
          storyHref={
            hasMusicalStory(musical.slug)
              ? musicalStoryPath(musical.slug)
              : undefined
          }
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

        <div id="theatre-info" className="scroll-mt-24 space-y-2">
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

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="musical" slug={musical.slug} />
    </div>
  );
}
