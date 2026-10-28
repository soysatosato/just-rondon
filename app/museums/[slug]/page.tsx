import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import ShareButton from "@/components/museums/ShareButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  fetchMuseumDetailsBySlug,
  fetchMuseumSlugs,
} from "@/utils/actions/museums";
import {
  fetchAttractionColumns,
  fetchAttractionDetails,
  fetchNearbyAttractions,
  fetchRandomAttractionsByCategory,
} from "@/utils/actions/attractions";
import { attractionSlugForMuseum } from "@/lib/museum-attraction-pairs";
import ViewTracker from "@/components/analytics/ViewTracker";
import StampButton from "@/components/stamps/StampButton";
import PageCommentSection from "@/components/comments/PageCommentSection";
import { loadPageComments } from "@/lib/comments";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { CommentTargetType } from "@prisma/client";

import MuseumHero from "@/components/museums/MuseumHero";
import MuseumAbout from "@/components/museums/MuseumAbout";
import MuseumInfo from "@/components/museums/MuseumInfo";
import MuseumExhibitions from "@/components/museums/MuseumExhibitions";
import MuseumHighlightSpots from "@/components/museums/MuseumHighlightSpots";
import MuseumVisitFlow from "@/components/museums/MuseumVisitFlow";
import MuseumHighlightedArtworks from "@/components/museums/MuseumHighlightedArtworks";
import MuseumStories from "@/components/museums/MuseumStories";
import { MuseumTrivia } from "@/components/museums/MuseumTrivia";
import AttractionTags from "@/components/sightseeing/AttractionTags";
import AttractionFactBar from "@/components/sightseeing/AttractionFactBar";
import AttractionVisitFlow from "@/components/sightseeing/AttractionVisitFlow";
import AttractionSpotRail from "@/components/sightseeing/AttractionSpotRail";
import AttractionColumnLinks from "@/components/sightseeing/AttractionColumnLinks";
import AddToPlanButton from "@/components/attractions/plan/AddToPlanButton";
import {
  visibleStories,
  withUniqueHeadings,
} from "@/components/sightseeing/stories";
import {
  attractionDescription,
  attractionTitle,
} from "@/components/sightseeing/meta";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { buildPageMetadata, fitTitle, truncateDescription } from "@/lib/seo";
import { stripInlineMarkdown } from "@/lib/plain-text";
import { museumJsonLd, museumPath } from "@/components/museums/jsonld";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { hasArtworkList } from "@/lib/museums/artwork-list";
import TimeRouteSection from "@/components/time-routes/TimeRouteSection";
import { timeRouteForMuseum } from "@/lib/time-routes";
import SeasonBand from "@/components/christmas/SeasonBand";
import { longTermClosureFor } from "@/lib/christmas/closures";
import { londonDate } from "@/lib/publish-schedule";

const TITLE_SUFFIXES = [
  "の見どころ・所要時間・アクセス｜ロンドン美術館ガイド",
  "の見どころ・所要時間｜ロンドン美術館ガイド",
  "の見どころ・所要時間",
];

const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

// 開館時間や展覧会は DB 側で直す。直したものが1時間以内に出るように。
export const revalidate = 60 * 60;

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
export async function generateStaticParams() {
  return fetchMuseumSlugs();
}

/**
 * 観光スポット(Attraction)にも行がある館の、その行。無ければ null。
 *
 * 大英博物館などの21館は、以前は /sightseeing と /museums に別々のページが
 * あった。2026-10 にこのページの1本にまとめ、観光側の URL はここへ転送している
 * (lib/museum-attraction-pairs.js)。観光側で書いた読み物・料金や所要時間の
 * 事実・旅行プランへの追加・周辺スポットは、Attraction の行からここに出す。
 */
async function pairedAttraction(museumSlug: string) {
  const slug = attractionSlugForMuseum(museumSlug);
  return slug ? fetchAttractionDetails(slug) : null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [museum, attraction] = await Promise.all([
    fetchMuseumDetailsBySlug(params.slug),
    pairedAttraction(params.slug),
  ]);

  // 観光側と対になる館は、観光側のページが使っていたタイトルと description を
  // そのまま引き継ぐ。検索に出ていたのはそちらの形(「大英博物館とは？所要時間
  // 2時間・見どころ・行き方」)で、URL を移すのと同時に題まで変えると、
  // 順位が動いたときに何が効いたのか分からなくなる。
  if (attraction) {
    return buildPageMetadata({
      path: museumPath(params.slug),
      title: attractionTitle(attraction),
      description: attractionDescription(attraction),
      titleSuffix: false,
      images: museum?.image ? [museum.image] : undefined,
    });
  }

  const timeRoute = timeRouteForMuseum(params.slug);
  // description は本文用のマークダウンで、太字の ** を含む館がある。
  // スニペットには記号のまま出てしまうので外す。
  const body = stripInlineMarkdown(
    museum?.description ??
      museum?.tagline ??
      "ロンドンの美術館の見どころ、アクセス、注目作品、開催中の企画展を紹介します。",
  );

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
    //
    // 時間別の回り方がある館は、「◯◯ 所要時間」への答えの1文を先頭に置く。
    // 答えと本文を繋げてから truncateDescription に渡すと、句点まで戻る
    // 切り方のせいで本文が丸ごと落ちることがあるので、本文だけを残りの字数に
    // 収めてから前置きする(components/sightseeing/meta.ts と同じ理由)。
    description: timeRoute
      ? `${timeRoute.answer}${truncateDescription(body, 120 - timeRoute.answer.length - 1)}`
      : truncateDescription(body),
    images: museum?.image ? [museum.image] : undefined,
  });
}

export default async function MuseumDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const [museum, attraction] = await Promise.all([
    fetchMuseumDetailsBySlug(params.slug),
    pairedAttraction(params.slug),
  ]);
  // 以前は redirect("/") でトップへ飛ばしていた。存在しない slug は
  // 404 を返さないと、消えたページが延々 200 を返し続けることになる。
  if (!museum) notFound();

  const timeRoute = timeRouteForMuseum(params.slug);

  // 改修などで長期休館中なら、冒頭の「本日」に開館時間ではなく休館を出す。
  // 開館時間の表(DB)は曜日ごとの平常時の時間しか持てないため。
  // 1時間ごとに描き直すので、日付の判定はここ(サーバー)でしてよい。
  const closure = longTermClosureFor(
    { museum: params.slug, spot: attraction?.slug },
    londonDate(new Date()),
  );

  // 近隣スポットは徒歩導線、同カテゴリーは興味の近さ。役割が違うので両方出す。
  // コラムは ContentAttraction に登録されたものだけ。どれも観光側の行から引く。
  const [nearby, related, columns] = attraction
    ? await Promise.all([
        fetchNearbyAttractions(
          { lat: attraction.lat, lng: attraction.lng },
          attraction.slug,
          4,
        ),
        fetchRandomAttractionsByCategory(
          attraction.category,
          attraction.slug,
          2,
        ),
        fetchAttractionColumns(attraction.id),
      ])
    : [[], [], []];
  const nearbySlugs = new Set(nearby.map((spot) => spot.slug));
  const relatedWithoutNearby = related.filter(
    (spot) => !nearbySlugs.has(spot.slug),
  );

  /*
    館内の歩き方は1つだけ出す。美術館側に書いたもの(どの入口から入り、
    どの順に回るか)を優先し、無い館だけ観光側の「着いてからの歩き方」を出す。
    両方出すと、同じ作品を2つの節で続けて説明することになる。
  */
  const useAttractionVisitFlow =
    museum.visitFlow.length === 0 && (attraction?.visitFlow.length ?? 0) > 0;

  /*
    観光側の読み物。見どころ(highlight)は美術館側の見どころと歩き方が
    受け持つので伏せる(stories.ts)。見出しの無い豆知識は箇条書きの寄せ集め
    なので、美術館側の豆知識の節に「ほかにも」として続け、同じ名前の節が
    2つ並ばないようにする。見出しのある豆知識は1本の読み物として残す。
  */
  const stories = attraction
    ? withUniqueHeadings(
        visibleStories(attraction.stories, {
          visitFlowSteps:
            museum.visitFlow.length +
            museum.highlightSpots.length +
            (useAttractionVisitFlow ? attraction.visitFlow.length : 0),
        }),
      )
    : [];
  const isLooseTrivia = (kind: string, heading: string | null) =>
    kind === "trivia" && !heading?.trim();
  const storySections = stories.filter(
    ({ story }) => !isLooseTrivia(story.kind, story.heading),
  );
  const moreTrivia =
    stories
      .filter(({ story }) => isLooseTrivia(story.kind, story.heading))
      .map(({ story }) => story.body.trim())
      .join("\n\n") || null;

  // コメントは投稿された時点で表示したいので、ここだけはリクエスト時に読む。
  // 投稿APIと管理ページの返信から revalidatePath で更新される。targetKey は id(uuid)。
  const comments = await loadPageComments(
    CommentTargetType.MUSEUM,
    museum.id,
  );

  return (
    // 左右の余白は sm 以上だけ。外側の container が既に 16px を持っている。
    <div className="mx-auto max-w-5xl pb-12 sm:px-4">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/museums",
          current: museum.name,
          currentHref: museumPath(museum.slug),
        })}
      />
      <JsonLd data={museumJsonLd(museum)} />

      <div className="pt-4">
        <Breadcrumbs path="/museums" current={museum.name} />
      </div>

      <MuseumHero
        museum={museum}
        longClosure={
          closure?.closedFrom
            ? { from: closure.closedFrom, note: closure.notes?.[0] ?? null }
            : null
        }
        facts={
          attraction
            ? { price: attraction.priceAdult, duration: attraction.durationText }
            : null
        }
      />

      {/* blurb は詩的な一文。以前はこれを h1 にしていたため、
          館名の h1 と二重になっていた。リード文として置く。 */}
      {museum.blurb && (
        <div className="mt-6 flex items-start justify-between gap-4">
          <p className="border-l-2 border-indigo-500 pl-4 text-sm leading-relaxed text-muted-foreground">
            {museum.blurb}
          </p>
          <div className="shrink-0">
            <ShareButton museumId={museum.id} name={museum.name} />
          </div>
        </div>
      )}

      {/*
        観光スポットと対になる館では、観光側のページの冒頭にあったもの
        (定番・無料・ロンドンパスの印、料金・所要時間・最寄駅・休館日の
        ファクトバー)をここに出す。値は Attraction の列で、旅行プランが
        計算に使うのと同じもの。
      */}
      {attraction && (
        <div className="mt-6 space-y-4">
          <AttractionTags attraction={attraction} />
          <AttractionFactBar
            priceAdult={attraction.priceAdult}
            priceChild={attraction.priceChild}
            durationText={attraction.durationText}
            nearestStation={attraction.nearestStation}
            openingHours={attraction.openingHours}
            closedWeekdays={attraction.closedWeekdays}
            closedDaysCheckedAt={attraction.closedDaysCheckedAt}
            closedNote={attraction.closedNote}
            website={attraction.website}
          />
        </div>
      )}

      {/*
        行くと決めた人の次の一手(旅行プランに追加)と、入った館を記録する
        スタンプを1つの行に並べる。本文を読み始める前の位置に置いているのは、
        既に行った人がこのページを開く動機の多くが「記録すること」だから。
        旅行プランは Attraction を単位にしているので、対になる館にだけ出る。
        箱ではなくボタンだけの inline にして、本文の前で場所を取らない。
      */}
      <div className="mt-6 flex flex-wrap items-start gap-x-4 gap-y-3">
        {attraction && (
          <AddToPlanButton
            slug={attraction.slug}
            name={attraction.name}
            variant="detail"
          />
        )}
        <StampButton
          variant="inline"
          type="museum"
          id={museum.id}
          name={museum.name}
          engName={museum.engName ?? museum.name}
        />
      </div>

      {/*
        この館のクリスマス(年末年始の休館と、近くの冬の催し)。会期は
        クリスマス特集と同じデータ(lib/christmas)から出し、10月から
        シーズンの終わりまでだけ出る。該当の無い館では何も描かない。
        lib/christmas は観光側の slug で書いた項目もあるので両方渡す。
      */}
      <SeasonBand
        museum={museum.slug}
        spot={attraction?.slug}
        className="mt-6"
      />

      <MuseumAbout description={museum.description} />

      {/*
        「◯◯ 所要時間」で来た人への答え。行く日が決まって時間配分を
        決めたい読者が最初に探すものなので、見どころより前に置く。
      */}
      {timeRoute && (
        <TimeRouteSection
          guide={timeRoute}
          placeName={museum.name}
          variant="museum"
        />
      )}

      <MuseumHighlightSpots
        highlights={museum.highlightSpots}
        museumName={museum.name}
      />

      {/* 見どころ(何を見るか)のすぐ後に、館内の動線(どう回るか)を置く。
          読者が「行く」と決めた直後に読む順番になる。 */}
      {useAttractionVisitFlow && attraction ? (
        <div className="mx-auto max-w-4xl px-4 py-10">
          <AttractionVisitFlow
            steps={attraction.visitFlow}
            attractionName={museum.name}
          />
        </div>
      ) : (
        <MuseumVisitFlow steps={museum.visitFlow} museumName={museum.name} />
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-6" />

      {/* カードに出すのは3行で切れる抜粋だけ。description は作品ページ用の
          マークダウン本文で、そのまま渡すと ** が記号のまま見えるうえ、
          全文が HTML と RSC payload の両方に載る。 */}
      <MuseumHighlightedArtworks
        slug={museum.slug}
        showListLink={hasArtworkList(museum._count.artworks)}
        artworks={museum.artworks.map((artwork) => ({
          ...artwork,
          description:
            artwork.description &&
            truncateDescription(stripInlineMarkdown(artwork.description), 200),
        }))}
      />

      <MuseumStories stories={storySections} />

      <MuseumTrivia trivia={museum.trivia} more={moreTrivia} />

      <MuseumInfo museumInfo={museum.museumInfo} omitFacts={!!attraction} />

      <MuseumExhibitions exhibitions={museum.exhibition} />

      {/* 地図 */}
      <section className="py-10 sm:px-4">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-sky-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
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

      {/* 「もっと深く読む」ための導線。観光側の行に登録されたコラム。 */}
      {columns.length > 0 && (
        <div className="mx-4 mb-6">
          <AttractionColumnLinks
            attractionName={museum.name}
            columns={columns}
          />
        </div>
      )}

      <div className="mx-4">
        <PageCommentSection
          targetType={CommentTargetType.MUSEUM}
          targetKey={museum.id}
          prompt={`${museum.name}を訪れた感想や、次に行く人へのアドバイスがあれば教えてください。`}
          heading="みんなの口コミ"
          placeholder="見どころの感想やアドバイスを教えてください"
          initialComments={comments}
        />
      </div>

      {/* 回遊リンク。読み終えた読者の次の一手。 */}
      {nearby.length + relatedWithoutNearby.length > 0 && (
        <div className="mx-4 space-y-12 py-10">
          <AttractionSpotRail
            heading={`${museum.name}の近くで一緒に回れるスポット`}
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
