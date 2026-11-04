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
  fetchPopularAttractionsByCategory,
  fetchAttractionSlugs,
} from "@/utils/actions/attractions";
import { notFound } from "next/navigation";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
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
import AddToPlanButton from "@/components/attractions/plan/AddToPlanButton";
import StampButton from "@/components/stamps/StampButton";
import AttractionVisitFlow from "@/components/sightseeing/AttractionVisitFlow";
import AttractionColumnLinks from "@/components/sightseeing/AttractionColumnLinks";
import { visibleStories, type StoryLike } from "@/components/sightseeing/stories";
import AttractionTags from "@/components/sightseeing/AttractionTags";
import StoryFigure from "@/components/sightseeing/StoryFigure";
import SpotKeyFacts from "@/components/sightseeing/SpotKeyFacts";
import SpotBeforeYouGo from "@/components/sightseeing/SpotBeforeYouGo";
import SpotAccess from "@/components/sightseeing/SpotAccess";
import SpotNearby from "@/components/sightseeing/SpotNearby";
import GuideSectionNav, {
  type GuideNavSection,
} from "@/components/guides/GuideSectionNav";
import ViewTracker from "@/components/analytics/ViewTracker";
import GuardSchedule from "@/components/sightseeing/GuardSchedule";
import { GUARD_SLUG, fetchGuardSchedule } from "@/lib/guard/schedule";
import TimeRouteSection from "@/components/time-routes/TimeRouteSection";
import { TIME_ROUTE_ANCHOR, timeRouteForAttraction } from "@/lib/time-routes";
import ImageCredit from "@/components/shared/ImageCredit";
import SeasonBand from "@/components/christmas/SeasonBand";
import { spotKindProfile } from "@/lib/sightseeing/spot-kind";
import { practicalFor } from "@/lib/sightseeing/practical";
import SpotNoticeBanner from "@/components/sightseeing/SpotNoticeBanner";
import SpotGroupLinks from "@/components/sightseeing/SpotGroupLinks";

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
  // スポットの種類(lib/sightseeing/spot-kind.ts)で語尾と先頭の事実を変える。
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

/** 節の id。節ナビ・早わかりからのページ内リンクの行き先。 */
const SECTION = {
  highlights: "highlights",
  beforeYouGo: "before-you-go",
  tickets: "tickets",
  access: "access",
  history: "history",
  trivia: "trivia",
  nearby: "nearby",
} as const;

/**
 * 読み物の1節。見出しはそのスポット固有のもの(heading)があるときだけ出す。
 * 「歴史」「豆知識」のような既定の名前は、上の節の見出しが既に言っている。
 */
function StoryBlock({
  story,
  fallbackAlt,
}: {
  story: StoryLike;
  fallbackAlt: string;
}) {
  const heading = story.heading?.trim();
  return (
    <div className="space-y-3">
      {heading && (
        <h3 className="text-lg font-semibold tracking-tight md:text-xl">
          {heading}
        </h3>
      )}
      {/* prose 系クラスはこのプロジェクトでは効かない
          (@tailwindcss/typography が入っていない)。
          見出し・箇条書き・表の見た目は MarkdownBody が持っている。 */}
      <MarkdownBody>{story.body}</MarkdownBody>
      <StoryFigure story={story} heading={heading || fallbackAlt} />
    </div>
  );
}

/*
  ページの組み立て(2026-11 の見直し)

  1. 写真・名前・ひとことの説明(summary)・早わかり。
     「◯◯とは」「◯◯ 営業時間」「◯◯ どこ」の答えが最初の2画面に入る。
  2. 節ナビ(スクロールしても上に残る)。
  3. 所要時間と回り方 → 見どころ → 行く前に知っておきたいこと →
     行き方と地図 → 歴史と背景 → 豆知識 → 周辺。
     以前は歴史の読み物が先で、予約の要否・地図・行き方は最下部にあった。
     行く前にしか手を打てないこと(予約、休みの曜日、行き方)を、
     読み物より前に置く。
  4. 欄名と見出しはスポットの種類(lib/sightseeing/spot-kind.ts)で変える。
     チケット・入口・当日の決まりは lib/sightseeing/practical に公式で
     確かめたスポットだけ出る。

  料金・行き方・開館時間・所要時間は AttractionStory に書かない
  (Attraction の列が持つ。prisma/schema.prisma の AttractionStory の注記)。
*/
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

  const profile = spotKindProfile(attraction);
  const practical = practicalFor(attraction.slug);

  // 近隣スポットは徒歩導線、同じ区分は興味の近さ。役割が違うので両方出す。
  // コラムは ContentAttraction に登録されたものだけ。無ければ枠ごと出ない。
  // 衛兵交代式のページだけ、公式カレンダーから今日から7日分の実施予定を読む。
  const [nearby, columns, guardSchedule] = await Promise.all([
    fetchNearbyAttractions(
      { lat: attraction.lat, lng: attraction.lng },
      params.slug,
      4,
    ),
    fetchAttractionColumns(attraction.id),
    params.slug === GUARD_SLUG ? fetchGuardSchedule() : null,
  ]);
  // 近隣の枠に出したものを「ほかの◯◯」で繰り返さない。
  const related = await fetchPopularAttractionsByCategory(
    attraction.category,
    [params.slug, ...nearby.map((spot) => spot.slug)],
    6,
  );

  /*
    読み物を役目ごとに分ける。kind の並び(見どころ→歴史→固有の話→豆知識→
    訪問のヒント)は stories.ts の visibleStories が決める。
    歩き方(visitFlow)があるページでは highlight を伏せる判定も stories.ts 側。
  */
  const stories = visibleStories(attraction.stories, {
    visitFlowSteps: attraction.visitFlow.length,
  });
  const highlightStories = stories.filter((s) => s.kind === "highlight");
  const historyStories = stories.filter(
    (s) => s.kind === "history" || s.kind === "context",
  );
  const triviaStories = stories.filter((s) => s.kind === "trivia");
  const practicalStories = stories.filter((s) => s.kind === "practical");

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

  const hasHighlights =
    attraction.visitFlow.length > 0 || highlightStories.length > 0;
  const hasBeforeYouGo =
    !!practical?.tickets ||
    (practical?.onSite?.length ?? 0) > 0 ||
    practicalStories.length > 0;
  const hasAccess =
    (!!attraction.address && attraction.address.trim() !== "-") ||
    !!attraction.nearestStation ||
    (practical?.access?.length ?? 0) > 0;
  const hasNearby = nearby.length > 0 || related.length > 0 || !!attraction.area;

  // 節ナビ。ラベルは横一列に収まるよう短く。
  const navSections: GuideNavSection[] = [
    ...(timeRoute ? [{ id: TIME_ROUTE_ANCHOR, navLabel: "所要時間" }] : []),
    ...(hasHighlights ? [{ id: SECTION.highlights, navLabel: "見どころ" }] : []),
    ...(hasBeforeYouGo
      ? [{ id: SECTION.beforeYouGo, navLabel: "行く前に" }]
      : []),
    ...(hasAccess ? [{ id: SECTION.access, navLabel: "行き方" }] : []),
    ...(historyStories.length > 0
      ? [{ id: SECTION.history, navLabel: "歴史" }]
      : []),
    ...(triviaStories.length > 0
      ? [{ id: SECTION.trivia, navLabel: "豆知識" }]
      : []),
    ...(hasNearby ? [{ id: SECTION.nearby, navLabel: "周辺" }] : []),
  ];

  const highlightsHeading = `${attraction.name}の${profile.highlightsNoun}`;

  return (
    <div data-page-main className="mx-auto w-full max-w-5xl">
      <JsonLd data={attractionBreadcrumbJsonLd(attraction)} />
      <JsonLd data={attractionJsonLd(attraction)} />

      <div className="mb-4 pt-4">
        <Breadcrumbs path="/sightseeing" current={attraction.name} />
      </div>

      {/*
        写真。押すと拡大する。以前は右下に「おすすめ度」の星を重ねていたが、
        何を基準にした点数かをどこにも書いておらず(1〜5のどれも根拠が
        示せない)、「おすすめ度1」のページを開いた読者には、来た場所を
        自分で下げて見せることになっていた。並べ替えには今も使っている。
      */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`${attraction.name}の写真を拡大`}
            className="relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:rounded-2xl md:aspect-[21/9]"
          >
            {/* このページのLCP要素。priority を付けないと最後に読み込まれる */}
            <Image
              src={attraction.image}
              unoptimized={!isResizableImage(attraction.image)}
              alt={`${attraction.name}（${attraction.engName ?? "ロンドン"}）の写真`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </button>
        </DialogTrigger>

        {/* 拡大表示 */}
        <DialogContent
          aria-describedby={undefined}
          className="max-h-[95vh] max-w-[95vw] border-none bg-black/80 p-0"
        >
          <DialogTitle className="sr-only">{attraction.name}の写真</DialogTitle>
          <img
            src={attraction.image}
            alt={`${attraction.name}（${attraction.engName ?? "ロンドン"}）の写真`}
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

      {/* 左右の余白はスマホでは付けない。外側の container が既に 16px を
          持っていて、ここで px-6 を足すと本文の幅が 310px まで細る。 */}
      <article className="mx-auto max-w-3xl space-y-10 py-6 sm:px-6">
        <header className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {attraction.name}
            {attraction.engName ? (
              <span className="mt-1 block text-sm font-normal tracking-wide text-muted-foreground md:text-base">
                {attraction.engName}
              </span>
            ) : null}
          </h1>

          {attraction.tagline && (
            <p className="text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
              {attraction.tagline}
            </p>
          )}

          <AttractionTags attraction={attraction} />

          {/*
            「◯◯とは」への答え。以前は早わかり・旅程ボタン・クリスマスの帯の
            下にあり、スマホでは約2画面下だった。名前のすぐ下に置く。
          */}
          {attraction.summary && (
            <p className="whitespace-pre-line text-[17px] leading-relaxed text-neutral-800 dark:text-neutral-200">
              {attraction.summary}
            </p>
          )}
        </header>

        {/*
          衛兵交代式の実施予定。検索してきた人の問いは「何時に、どの日に
          やるか」なので、早わかりより先に置く。
        */}
        {/*
          閉館の予定・移転・休止(lib/sightseeing/notices.ts)。「いま行けるか」は
          早わかりの欄より前で言い切る。
        */}
        <SpotNoticeBanner slug={attraction.slug} />

        {guardSchedule && <GuardSchedule result={guardSchedule} />}

        <div className="space-y-4">
          <SpotKeyFacts
            profile={profile}
            priceAdult={attraction.priceAdult}
            priceChild={attraction.priceChild}
            durationText={attraction.durationText}
            nearestStation={attraction.nearestStation}
            openingHours={attraction.openingHours}
            closedWeekdays={attraction.closedWeekdays}
            closedDaysCheckedAt={attraction.closedDaysCheckedAt}
            closedNote={attraction.closedNote}
            tickets={practical?.tickets ?? null}
            website={attraction.website}
            accessAnchor={hasAccess ? SECTION.access : undefined}
            ticketsAnchor={practical?.tickets ? SECTION.tickets : undefined}
          />

          {/*
            行くと決めた人の次の一手(旅行プランに追加)と、もう行った人の一手
            (スタンプ)を1つの行に並べる。機能はそれぞれ独立している。
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
        </div>

        {/*
          この場所のクリスマス。冬だけのリンクや催し、年末年始の休館を
          知らせる。10月からシーズンの終わりまでだけ出る。
        */}
        <SeasonBand spot={attraction.slug} />

        {/* 同じ建物・会場を別ページで案内している組(バービカンの3ページなど)。 */}
        <SpotGroupLinks slug={attraction.slug} />

        {/*
          節が3つ以上あるときだけ。2つなら下へスクロールすれば済む。
          article の直下に置くこと。sticky は親要素の中でしか貼り付かないので、
          div で包むとナビの高さぶんしか追従しない。
        */}
        {navSections.length >= 3 && <GuideSectionNav sections={navSections} />}

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

        {/* 見どころ。歩き方(visitFlow)があればそれが見どころを担い、
            無いスポットだけ読み物の見どころ(highlight)を出す。 */}
        {attraction.visitFlow.length > 0 ? (
          <AttractionVisitFlow
            id={SECTION.highlights}
            steps={attraction.visitFlow}
            attractionName={attraction.name}
            heading={highlightsHeading}
            lead={profile.highlightsLead}
          />
        ) : highlightStories.length > 0 ? (
          <section id={SECTION.highlights} className="scroll-mt-24 space-y-6">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {highlightsHeading}
            </h2>
            {highlightStories.map((story) => (
              <StoryBlock
                key={story.id}
                story={story}
                fallbackAlt={highlightsHeading}
              />
            ))}
          </section>
        ) : null}

        <SpotBeforeYouGo
          id={SECTION.beforeYouGo}
          ticketsId={SECTION.tickets}
          practical={practical}
          stories={practicalStories}
        />

        <SpotAccess
          id={SECTION.access}
          name={attraction.name}
          engName={attraction.engName}
          address={attraction.address}
          lat={attraction.lat}
          lng={attraction.lng}
          nearestStation={attraction.nearestStation}
          routes={practical?.access ?? []}
          routesCheckedAt={practical?.checkedAt}
          routesSources={practical?.sources}
          website={attraction.website}
          fromLondon={profile.outOfTown}
        />

        <div className="flex justify-center">
          <AdSenseUnit slot={AD_SLOTS.inArticle} />
        </div>

        {historyStories.length > 0 && (
          <section id={SECTION.history} className="scroll-mt-24 space-y-8">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {attraction.name}の歴史と背景
            </h2>
            {historyStories.map((story) => (
              <StoryBlock
                key={story.id}
                story={story}
                fallbackAlt={`${attraction.name}の歴史`}
              />
            ))}
          </section>
        )}

        {triviaStories.length > 0 && (
          <section id={SECTION.trivia} className="scroll-mt-24 space-y-6">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              豆知識
            </h2>
            {triviaStories.map((story) => (
              <StoryBlock
                key={story.id}
                story={story}
                fallbackAlt={`${attraction.name}の豆知識`}
              />
            ))}
          </section>
        )}

        <SpotNearby
          id={SECTION.nearby}
          name={attraction.name}
          nearby={nearby.map((spot) => ({
            slug: spot.slug,
            name: spot.name,
            image: spot.image,
            distanceKm: spot.distanceKm,
            durationText: spot.durationText,
          }))}
          area={attraction.area}
          isMarket={profile.kind === "market"}
          category={attraction.category}
          related={related}
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

      <div className="mx-auto max-w-5xl pb-12 sm:px-6">
        <div className="flex justify-center">
          <AdSenseUnit slot={AD_SLOTS.articleBottom} />
        </div>
      </div>

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="attraction" slug={attraction.slug} />
    </div>
  );
}
