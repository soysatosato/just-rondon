export const revalidate = 60 * 60;

import type { Metadata } from "next";
import Image from "next/image";
import { isResizableImage } from "@/lib/wikimedia-image";
import { CommentTargetType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  fetchAttractionColumns,
  fetchAttractionDetails,
  fetchNearbyAttractions,
  fetchRandomAttractionsByCategory,
  fetchAttractionSlugs,
} from "@/utils/actions/attractions";
import { notFound } from "next/navigation";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Star } from "lucide-react";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import PageCommentSection from "@/components/comments/PageCommentSection";
import { loadPageComments } from "@/lib/comments";
import {
  attractionDescription,
  attractionTitle,
} from "@/components/sightseeing/meta";
import {
  attractionBreadcrumbJsonLd,
  attractionJsonLd,
  attractionPath,
} from "@/components/sightseeing/jsonld";
import AttractionFactBar from "@/components/sightseeing/AttractionFactBar";
import AddToPlanButton from "@/components/attractions/plan/AddToPlanButton";
import StampButton from "@/components/stamps/StampButton";
import AttractionVisitFlow from "@/components/sightseeing/AttractionVisitFlow";
import AttractionLocation from "@/components/sightseeing/AttractionLocation";
import AttractionSpotRail from "@/components/sightseeing/AttractionSpotRail";
import AttractionColumnLinks from "@/components/sightseeing/AttractionColumnLinks";
import {
  visibleStories,
  withUniqueHeadings,
  storyAnchor,
  type StoryLike,
} from "@/components/sightseeing/stories";
import { isTimeLimitedEvent } from "@/components/sightseeing/categories";
import AttractionTags from "@/components/sightseeing/AttractionTags";
import StoryFigure from "@/components/sightseeing/StoryFigure";
import ViewTracker from "@/components/analytics/ViewTracker";
import GuardSchedule from "@/components/sightseeing/GuardSchedule";
import { GUARD_SLUG, fetchGuardSchedule } from "@/lib/guard/schedule";
import TimeRouteSection from "@/components/time-routes/TimeRouteSection";
import { timeRouteForAttraction } from "@/lib/time-routes";
import ImageCredit from "@/components/shared/ImageCredit";
import SeasonBand from "@/components/christmas/SeasonBand";

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
export async function generateStaticParams() {
  return fetchAttractionSlugs();
}

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

  // engName はタイトルに入れない。h1 と JSON-LD で出しているうえ、
  // 日本語タイトルの限られた文字数を英名に使う理由がない。
  //
  // タイトル・description の組み立ては components/sightseeing/meta.ts に置いた。
  // 所要時間・料金・最寄駅という構造化済みの事実をスニペットへ寄せるためで、
  // 本文(summary)は書き換えずそのまま後ろに続ける。
  const title = attractionTitle(attraction);
  const description = attractionDescription(attraction);

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

/**
 * 本文セクションの目次。
 *
 * セクションが3本以上あるときだけ出す。2本しかないページで目次を出しても
 * 下にスクロールすれば全部見えるので、場所を取るだけになる。
 */
function SectionToc({
  entries,
}: {
  entries: { story: StoryLike; heading: string }[];
}) {
  if (entries.length < 3) return null;

  return (
    <nav
      aria-label="このページの内容"
      className="rounded-2xl border border-border bg-muted/40 p-5"
    >
      <p className="text-sm font-semibold text-muted-foreground">
        このページの内容
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {entries.map(({ story, heading }) => (
          <li key={story.id}>
            <a
              href={`#${storyAnchor(story)}`}
              className="text-sm text-link underline-offset-2 hover:underline dark:text-blue-400"
            >
              {heading}
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
  // 存在しない slug は 404 を返す。以前は redirect("/") でトップへ飛ばして
  // いたが、古いリンクから来た人は理由も分からずトップに着き、Google には
  // soft 404 と扱われる。美術館の詳細(app/museums/[slug])と同じ直し方。
  if (!attraction) notFound();

  // 近隣スポットは徒歩導線、同カテゴリーは興味の近さ。役割が違うので両方出す。
  // コラムは ContentAttraction に登録されたものだけ。無ければ枠ごと出ない。
  // 衛兵交代式のページだけ、公式カレンダーから今日から7日分の実施予定を読む。
  const [nearby, related, columns, guardSchedule] = await Promise.all([
    fetchNearbyAttractions(
      { lat: attraction.lat, lng: attraction.lng },
      params.slug,
      4,
    ),
    fetchRandomAttractionsByCategory(attraction.category, params.slug, 2),
    fetchAttractionColumns(attraction.id),
    params.slug === GUARD_SLUG ? fetchGuardSchedule() : null,
  ]);

  // 近隣枠に出したスポットを同カテゴリー枠で繰り返さない。
  const nearbySlugs = new Set(nearby.map((spot) => spot.slug));
  const relatedWithoutNearby = related.filter(
    (spot) => !nearbySlugs.has(spot.slug),
  );

  /*
    読み物を kind の順(見どころ→歴史→固有の話→豆知識→訪問のヒント)に並べる。

    料金・アクセス・開館時間・所要時間は AttractionStory に入れていない。
    ファクトバーが持つので、本文で二重に書く必要がない
    (移行時の扱いは scripts/migrate-sections-to-stories.ts を参照)。
    歩き方があるページでは highlight を伏せる判定も stories.ts 側にある。
  */
  // 同じ既定ラベルが並んだときに番号を振る(stories.ts 参照)。
  const bodyStories = withUniqueHeadings(
    visibleStories(attraction.stories, {
      visitFlowSteps: attraction.visitFlow.length,
    }),
  );

  // 美術館と対になる館(大英博物館など)はここに来ない。ページの本体は
  // /museums 側で、観光側の URL は next.config.mjs で転送している
  // (lib/museum-attraction-pairs.js)。
  const timeRoute = timeRouteForAttraction(params.slug);

  // コメントは投稿された時点で表示したいので、ここだけはリクエスト時に読む。
  // 投稿APIと管理ページの返信から revalidatePath で更新される。targetKey は id(uuid)。
  const comments = await loadPageComments(
    CommentTargetType.ATTRACTION,
    attraction.id,
  );

  return (
    <div data-page-main className="mx-auto w-full max-w-5xl">
      <JsonLd data={attractionBreadcrumbJsonLd(attraction)} />
      <JsonLd data={attractionJsonLd(attraction)} />

      <div className="mb-4 pt-4">
        <Breadcrumbs path="/sightseeing" current={attraction.name} />
      </div>

      {/* Hero image full width */}
      <Dialog>
        {/*
          押すと拡大する写真。以前は div を押させていたので、キーボードでは
          開けず、読み上げでも押せるものだと分からなかった。button にして
          名前を付けている。おすすめ度はボタンの外に重ねる(中に入れると
          ボタンの名前に隠れて読まれない)。押しても下のボタンに届くよう、
          重ねた側はクリックを透過させる。
        */}
        <div className="relative">
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`${attraction.name}の写真を拡大`}
              className="relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:aspect-[3/1]"
            >
              {/* このページのLCP要素。priority を付けないと最後に読み込まれる */}
              <Image
                src={attraction.image}
                unoptimized={!isResizableImage(attraction.image)}
                alt={`${attraction.name}｜ロンドン観光スポット`}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority
              />
            </button>
          </DialogTrigger>
          {attraction.recommendLevel ? (
            <div className="pointer-events-none absolute bottom-4 right-4 z-10">
              <RecommendLevel level={attraction.recommendLevel} />
            </div>
          ) : null}
        </div>

        {/* 拡大表示 */}
        <DialogContent
          aria-describedby={undefined}
          className="max-h-[95vh] max-w-[95vw] border-none bg-black/80 p-0"
        >
          <DialogTitle className="sr-only">{attraction.name}の写真</DialogTitle>
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
      {/* Commons の CC BY / BY-SA は作者とライセンスの表示が利用の条件。 */}
      <ImageCredit
        source={attraction.imageSource}
        credit={attraction.imageCredit}
        link={attraction.imageLink}
        className="mt-1.5 px-2 text-right"
      />

      {/*
        ここから記事本体。以前は本文が地図・関連スポット・広告2つの後ろに
        あり、読者がこのページに来た理由(見どころ)が最下部に埋まっていた。
        読み物を先に出し、地図と回遊リンクは読み終えた後に置く。
      */}
      {/* 左右の余白はスマホでは付けない。外側の container が既に 16px を
          持っていて、ここで px-6 を足すと左右40pxずつになり、本文の幅が
          310px まで細っていた。 */}
      <article className="mx-auto max-w-3xl space-y-10 py-8 sm:px-6">
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

          <AttractionTags attraction={attraction} />
        </header>

        {/*
          衛兵交代式の実施予定。検索してきた人の問いは「何時に、どの日に
          やるか」なので、料金や所要時間より先に置く。
        */}
        {guardSchedule && <GuardSchedule result={guardSchedule} />}

        {/* 訪問前に知りたいこと。埋まっている項目だけが出る。 */}
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
          isEvent={isTimeLimitedEvent(attraction)}
        />

        {/*
          行くと決めた人の次の一手(旅行プランに追加)と、もう行った人の一手
          (スタンプ)を1つの行に並べる。

          ファクトバー(料金・所要時間)のすぐ下に置いているのは、行くかどうかが
          ここで決まるため。2つを隣に置くのは、読者は同じ場所に「行く予定」と
          「行った」の両方を探しに来るので、片方を離すと探して見つからないほうが
          必ず出るため。機能はそれぞれ独立していて、並べているだけ。

          スタンプは以前、判の枠つきの箱(約190px)で出していた。本文より先に
          スタンプ帳の説明が来るので、ボタンだけの inline にした。
        */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
          <AddToPlanButton
            slug={attraction.slug}
            name={attraction.name}
            variant="detail"
          />
          <StampButton
            variant="inline"
            type="attraction"
            id={attraction.id}
            name={attraction.name}
            engName={attraction.engName ?? attraction.name}
            category={attraction.category || null}
          />
        </div>

        {/*
          この場所のクリスマス。冬だけのリンクや催し、年末年始の休館を、
          行くかどうかを決める位置(ファクトバーの下)で知らせる。会期は
          クリスマス特集と同じデータ(lib/christmas)から出し、10月から
          シーズンの終わりまでだけ出る。該当の無い場所では何も描かない。
        */}
        <SeasonBand spot={attraction.slug} />

        {/* summary は導入文として本文の書体で出す。以前は丸いアイコン付きの
            白い箱に入れていたが、/overview.png が135ページすべてで同じ位置に
            出るだけで、読む助けにはなっていなかった。 */}
        {attraction.summary && (
          <p className="whitespace-pre-line border-l-4 border-neutral-300 pl-5 text-[17px] leading-relaxed text-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
            {attraction.summary}
          </p>
        )}

        {/*
          「◯◯ 所要時間」で来た人への答え。持ち時間ごとの順路。
          ここに出るのは美術館のページが無い場所(セント・ポール、ロンドン塔
          など)。美術館・博物館の順路は /museums 側のページにある。
        */}
        {timeRoute && (
          <TimeRouteSection
            guide={timeRoute}
            placeName={attraction.name}
            variant="sightseeing"
          />
        )}

        <SectionToc entries={bodyStories} />

        {/*
          着いてからの歩き方。visitFlow が入っているスポットにだけ出る。

          本文より前に置く。歩き方があるページでは highlight を伏せている
          (stories.ts)ので、ここがそのページの「何を見るか」を担う。
          残った本文は歴史や豆知識で、読む順としては後ろでよい。
        */}
        <AttractionVisitFlow
          steps={attraction.visitFlow}
          attractionName={attraction.name}
        />

        <div className="space-y-12">
          {bodyStories.map(({ story, heading }) => (
            <section
              key={story.id}
              id={storyAnchor(story)}
              className="scroll-mt-24 space-y-3"
            >
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {heading}
              </h2>
              {/* prose 系クラスはこのプロジェクトでは効かない
                  (@tailwindcss/typography が入っていない)。
                  見出し・箇条書き・表の見た目は MarkdownBody が持っている。 */}
              <MarkdownBody>{story.body}</MarkdownBody>

              <StoryFigure story={story} heading={heading} />
            </section>
          ))}
        </div>

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

        {/* 「もっと深く読む」ための導線。 */}
        <AttractionColumnLinks
          attractionName={attraction.name}
          columns={columns}
        />

        <PageCommentSection
          targetType={CommentTargetType.ATTRACTION}
          targetKey={attraction.id}
          prompt={`${attraction.name}を訪れた感想や、これから行く人に役立つコツがあれば教えてください。`}
          heading="みんなの口コミ"
          placeholder="訪れた感想やコツを教えてください"
          initialComments={comments}
        />
      </article>

      {/* 回遊リンクは本文より広く使う。記事を読み終えた読者の次の一手。 */}
      <div className="mx-auto max-w-5xl space-y-12 pb-12 sm:px-6">
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

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="attraction" slug={attraction.slug} />
    </div>
  );
}
