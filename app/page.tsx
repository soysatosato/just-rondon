export const revalidate = 60 * 60;

import Link from "next/link";

import AdSenseLoader from "@/components/ads/AdSenseLoader";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import HeroIntro from "@/components/home/HeroIntro";
import HeroMosaic from "@/components/home/HeroMosaic";
import HomeClickTracker from "@/components/home/HomeClickTracker";
import PlanPromo from "@/components/home/PlanPromo";
import RailTabs from "@/components/home/RailTabs";
import SeasonFeatureBand, {
  isSeasonBandVisible,
} from "@/components/home/SeasonFeatureBand";
import SiteIndexGroup from "@/components/home/SiteIndexGroup";
import WeeklyCard from "@/components/home/WeeklyCard";
import LiveStrip from "@/components/live/LiveStrip";
import {
  fetchColumns,
  fetchBritishEnglishEntries,
  fetchModernBritainEntries,
} from "@/utils/actions/contents";
import {
  fetchHeroTiles,
  fetchHomeRails,
  fetchSiteCounts,
  type RailItem,
} from "@/utils/actions/home";
import { fetchCurrentBriefs } from "@/utils/actions/weekly";
import { MIN_WEEKLY, fetchWeeklyTopIds } from "@/utils/rankings";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";
import { READING_ACCENT } from "@/lib/reading-accent";
import { londonDate, publishedDateOf } from "@/lib/publish-schedule";
import { eventMonthPath } from "@/lib/events";
import { getMonthGuide } from "@/lib/london-months/content";
import { stripInlineMarkdown } from "@/lib/plain-text";
import { responsiveImage } from "@/lib/wikimedia-image";
import {
  LINK_SECTIONS,
  MENU_SECTIONS,
  sectionLinks,
} from "@/components/navbar/menu";

export const metadata = buildPageMetadata({
  path: "/",
  title: `${SITE_NAME} | ロンドン観光・美術館・ミュージカル・イベント情報`,
  titleSuffix: false,
  description:
    "初めてのロンドン旅行でも安心。定番の観光スポット、美術館と必見作品、ウエストエンドのミュージカル、季節のイベント、ビザや現地で働く情報まで、日本語でまとめた総合ロンドンガイドです。",
});

/*
 * トップページの構成。
 *
 * かつてはサイトの区分(観光 / Things to Do / Traveller / Resident / 読み物)を
 * そのまま縦に展開し、区分ごとにアイコン付きのカードを3〜8枚並べていた。
 * 区分の設計としては筋が通っていたが、ページとしては次の問題があった。
 *
 *   - 上部の大区分ハブ9枚と、その下の展開セクション5本が同じ内容を
 *     二度並べていた。目次の目次になっていた。
 *   - ヒーローから下に写真が1枚も無く、全カードが「アイコン+見出し+説明」の
 *     同じ形だった。「その先に何があるか」を説明はするが見せていない。
 *   - 結果、サイトマップを縦に読ませるページになり、11〜12画面あった。
 *
 * そこで、トップを「サイトマップ」から「フロントページ」に組み替えた。
 * 上から順に、実物(写真・記事・今週の項目)だけを出す。カテゴリ名の
 * 一覧は最下部の索引1つに集約し、途中では一切繰り返さない。
 *
 * 2026-10-19 の調査で、フロントページの中でも「日付のある情報」(今日の帯・
 * 今週号・今月)がスマホの縦の9%しかなく、毎日変わらない名所の写真が冒頭と
 * 中盤に2回、索引と5本の棚が59%を占めていると分かった。今週号は13項目あるのに
 * トップで読めるのは見出し文に入った3つだけで、クリスマス特集は札1枚だった。
 * そこで日付のあるものを上に寄せ、棚と索引を畳んだ。
 *
 *   1. 今日          LiveStrip。天気・運行・為替の要約。ヘッダーの直下
 *   2. ヒーロー      言い切りの見出し + 検索 + 近道 + その月の場所の写真
 *   3. 季節の特集    10〜1月はクリスマス特集(SeasonFeatureBand)
 *   4. 使う          旅程を組む / 今週のロンドン(項目つき)/ 今月のロンドン
 *   5. 英国を読む    自分たちが書いたものが主役。旧は10ブロック中の9番目だった
 *   6. 見る・する    写真の棚を区分の切り替えで2本に(RailTabs)
 *   7. 索引と書き方  全区分の索引(スマホは区分ごとに開閉)+ このサイトの書き方
 *
 * 4 の旅程をこの位置に置いているのは、このサイトで唯一の「読む」ではなく
 * 「する」ものだから。下に置くと、旅程を組めること自体に気づかれない。
 *
 * 色の使い分けは踏襲する(観光=赤、体験=琥珀、旅=空、在住=翠、読み物=菫)。
 * ただし色を載せるのは索引の細い罫と、記事の区分名だけにした。英字の小見出し
 * (TRIP PLANNER・SEE & DO など21個)は、すぐ下の日本語見出しの言い換えだったので外した。
 *
 * 計測のため、ブロックの入れ物に data-home-module を付けている。中のリンクが
 * 押されると HomeClickTracker が GA4 に送る。ブロックを足したら名前も付けること。
 */

/**
 * 読み物カテゴリごとの表示定義。色は lib/reading-accent.ts から取る。
 *
 * 以前はここに色を直書きしていて、コラムを菫色で塗っていた。ハブ・詳細
 * ページ・OG カードのコラムは琥珀(菫は「英国を読む」全体の色)なので、
 * 同じコラムがトップでだけ別の色に見えていた。
 */
const READING_CATEGORY = {
  column: {
    base: "/column",
    label: "コラム",
    stripe: READING_ACCENT.column.bar,
    badge: READING_ACCENT.column.on,
    text: READING_ACCENT.column.text,
  },
  "modern-britain": {
    base: "/modern-britain",
    label: "英国のいま",
    stripe: READING_ACCENT["modern-britain"].bar,
    badge: READING_ACCENT["modern-britain"].on,
    text: READING_ACCENT["modern-britain"].text,
  },
  "british-english": {
    base: "/british-english",
    label: "イギリス英語",
    stripe: READING_ACCENT["british-english"].bar,
    badge: READING_ACCENT["british-english"].on,
    text: READING_ACCENT["british-english"].text,
  },
} as const;

type ReadingCategoryKey = keyof typeof READING_CATEGORY;

/**
 * 読み物4区分への導線。ハブ(/reading)と同じ並び。
 *
 * 以前は英字の小見出しつきのカードを4枚並べていて、スマホでは縦に積まれて
 * 約290pxあった。行き先はナビと索引にもあるので、1行の文字リンクにした。
 */
const READING_SECTIONS = [
  { href: "/column", label: "コラム" },
  { href: "/modern-britain", label: "英国のいまを論じる" },
  { href: "/history", label: "イギリスの歴史 全10章" },
  { href: "/british-english", label: "イギリス英語" },
] as const;

/**
 * 最下部のサイト索引。
 *
 * 旧トップにあった大区分ハブ(カード9枚)と、各セクション末尾の
 * 「◯◯ナビを見る →」ボタンを、ここ1箇所に統合したもの。
 * カードをやめたのは、導線の一覧はデザインではなく網羅性が仕事だから。
 *
 * 描き方は「1区分1行、リンクは折り返す札」。列に分けると区分ごとの本数の差が
 * そのまま列の高さの差になり、空白の列が並ぶ。札にすると横幅を使い切るので、
 * 本数が違っても行の高さは数段に収まる。スマホでは区分ごとに畳む(SiteIndexGroup)。
 *
 * 区分・リンク・ラベルはグローバルナビ(components/navbar/menu.ts)から作る。
 * 以前はここだけ手書きしていて、同じURLのラベルが21件食い違い、
 * 「ロンドンの外へ」は旅の準備の中、「今週のロンドン」は読み物の中と、
 * 置き場所までナビと違っていた。リンクを足すときは menu.ts に足す。
 */
const SITE_INDEX = [
  ...MENU_SECTIONS.map((section) => ({
    label: section.label,
    stripe: section.accent.stripe,
    links: sectionLinks(section),
  })),
  // ナビで単独のリンクになっている「旅行プランを作る」「今週のロンドン」。
  // どの区分の札にも入らないので、トップの「使う」帯と同じ名前の行にまとめる。
  {
    label: "使う",
    stripe: "bg-indigo-500",
    links: LINK_SECTIONS.map(({ href, label }) => ({ href, label })),
  },
];

/**
 * 「今月」の帯に添える行事。月(ロンドン時間、1〜12)で出し分ける。
 * 会期・発売日は各ページが出典つきで持つので、ここはリンクだけ。
 * 行事のページを足したら、ここにも出す月を足す。
 *
 * クリスマス特集は、季節の特集の帯(SeasonFeatureBand)が出ている間は
 * ここから外す。同じ行き先が帯と札の両方に並ぶため。
 */
const CHRISTMAS_HUB = "/events/christmas";
const SEASONAL_LINKS: { months: number[]; href: string; label: string }[] = [
  { months: [10, 11], href: "/events/bonfire-night", label: "ボンファイア・ナイトの花火" },
  { months: [10, 11, 12, 1], href: CHRISTMAS_HUB, label: "ロンドンのクリスマス特集" },
  { months: [10, 11, 12], href: "/sightseeing/christmas-markets", label: "クリスマスマーケット" },
  { months: [11, 12], href: "/sightseeing/christmas-lights", label: "イルミネーション" },
  { months: [11, 12], href: "/sightseeing/hyde-park-winter-wonderland", label: "ウィンター・ワンダーランド" },
  { months: [11, 12], href: "/events/new-years-eve-fireworks", label: "年越し花火" },
  { months: [12, 1], href: "/events/new-years-day-parade", label: "元日のパレード" },
];

/** 写真の棚に1区分で出す枚数。 */
const RAIL_SIZE = 12;

/**
 * 棚を直近1週間の閲覧順に並べ替える(utils/rankings.ts)。
 *
 * 以前の並びはおすすめ度と名前の順で、いつ来ても同じ顔だった。閲覧の
 * 多いものを先に出すと、その時期に調べられているもの(チェルシー・フラワー・
 * ショーや衛兵交代式など)が前に来る。数えた件数が MIN_WEEKLY に届かない
 * 週は、元の並びのままにする。
 */
function byWeeklyViews(items: RailItem[], topIds: string[]): RailItem[] {
  const rank = new Map(topIds.map((id, index) => [id, index]));
  const ranked = items
    .filter((item) => item.id !== undefined && rank.has(item.id))
    .sort((a, b) => (rank.get(a.id!) ?? 0) - (rank.get(b.id!) ?? 0));
  if (ranked.length < MIN_WEEKLY) return items;
  const rankedSlugs = new Set(ranked.map((item) => item.slug));
  return [...ranked, ...items.filter((item) => !rankedSlugs.has(item.slug))];
}

export default async function Page() {
  const now = new Date();
  const today = londonDate(now);
  const month = Number(today.slice(5, 7));

  const [
    latestColumns,
    latestModernBritain,
    latestBritishEnglish,
    { brief: latestBrief },
    heroTiles,
    rails,
    counts,
    weeklyAttractions,
    weeklyMuseums,
    weeklyMusicals,
  ] = await Promise.all([
    fetchColumns(),
    fetchModernBritainEntries(),
    fetchBritishEnglishEntries(),
    // /events と同じ号を選ぶ。号は2週ほど先まで公開しているので、最新号を
    // 出すとリンク先(/events は今週号)と別の週が並んでしまう。
    fetchCurrentBriefs(),
    fetchHeroTiles(month),
    fetchHomeRails(),
    fetchSiteCounts(),
    fetchWeeklyTopIds("attraction", RAIL_SIZE),
    fetchWeeklyTopIds("museum", RAIL_SIZE),
    fetchWeeklyTopIds("musical", RAIL_SIZE),
  ]);

  // ヒーローに出した名所は棚から外す。以前は同じ名所が冒頭と棚に同じ順で出ていた。
  const heroSlugs = new Set(heroTiles.map((tile) => tile.slug));
  const sights = byWeeklyViews(
    rails.attractions.filter((item) => !heroSlugs.has(item.slug)),
    weeklyAttractions,
  ).slice(0, RAIL_SIZE);
  const museums = byWeeklyViews(rails.museums, weeklyMuseums);
  const musicals = byWeeklyViews(rails.musicals, weeklyMusicals);

  const showSeasonBand = isSeasonBandVisible(today);

  // 今月の帯。本文を書いた月(lib/london-months)か、行事のある時期にだけ出す。
  const monthGuide = getMonthGuide(month);
  const seasonal = SEASONAL_LINKS.filter(
    (link) =>
      link.months.includes(month) &&
      !(showSeasonBand && link.href === CHRISTMAS_HUB),
  );
  const thisMonth =
    monthGuide || seasonal.length > 0
      ? {
          month,
          guide: monthGuide,
          guideHref: eventMonthPath(month),
          links: seasonal,
        }
      : null;

  // 読み物は各カテゴリの新しい方から2本ずつ拾い、全体を新着順に並べ替える。
  // 1カテゴリが連投してもトップが偏らないよう、取り込みは2本までに絞る。
  // 同じ連載は1本だけにする。連載を毎日1回ずつ出すと、5枠のうち2枠が
  // 同じ連載の第3回と第4回になっていた。
  const seenSeries = new Set<string>();
  const readingEntries = (
    [
      ["column", latestColumns],
      ["modern-britain", latestModernBritain],
      ["british-english", latestBritishEnglish],
    ] as const
  )
    .flatMap(([key, items]) => {
      const picked = [];
      for (const item of items) {
        if (picked.length === 2) break;
        if (item.seriesName) {
          if (seenSeries.has(item.seriesName)) continue;
          seenSeries.add(item.seriesName);
        }
        picked.push(item);
      }
      return picked.map((item) => {
        const cat = READING_CATEGORY[key as ReadingCategoryKey];
        // イギリス英語は英単語を見出しにし、日本語の見出しを添える。英単語だけ
        // (「easy peelers」)では何の話か分からず、日本語の見出し(「鹿児島生まれの
        // みかんは…」)のほうに引きがあった。
        const isEnglishWord = key === "british-english" && Boolean(item.engTitle);
        return {
          item,
          href: `${cat.base}/${item.slug}`,
          label: cat.label,
          seriesLabel: item.seriesName ? `連載「${item.seriesName}」` : null,
          stripe: cat.stripe,
          badge: cat.badge,
          text: cat.text,
          heading: isEnglishWord ? (item.engTitle as string) : item.title,
          subheading: isEnglishWord ? item.title : null,
        };
      });
    })
    .sort(
      (a, b) =>
        publishedDateOf(b.item).getTime() - publishedDateOf(a.item).getTime(),
    );

  // 主役は画像のある最新記事。画像が無いと見出しを重ねる意匠が成立しない。
  const readingLead =
    readingEntries.find((entry) => entry.item.image) ?? readingEntries[0];
  const readingRest = readingEntries
    .filter((entry) => entry.href !== readingLead?.href)
    .slice(0, 4);

  return (
    <div className="bg-background">
      {/*
        1. 今日。天気・運行状況・為替の要約。「今日どうか」を一目で渡して送り出す。
        以前はヒーローの下にあり、スマホでは1画面目(844px)に入らなかった。
      */}
      <section
        data-home-module="live"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-muted/40 text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <LiveStrip />
        </div>
      </section>

      {/*
        2. ヒーロー。
        写真を文字の下敷きにするのをやめ、左に文言・右に名前つきの写真タイルを
        置く二分割にした。暗幕が要らないので写真が沈まず、写っている場所に
        そのまま入れる。判断の経緯は HeroMosaic.tsx を参照。
        写真はその月に行く理由がある場所(fetchHeroTiles)。
      */}
      <section
        data-home-module="hero"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-background text-foreground"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-16">
          <div className="lg:col-span-5">
            <HeroIntro />
          </div>
          {/* スマホでは写真を低めにして、その下の季節の特集と今週号を
              1〜2画面目に近づける。 */}
          <div className="h-[220px] sm:h-[420px] lg:col-span-7 lg:h-[500px]">
            <HeroMosaic items={heroTiles} />
          </div>
        </div>
      </section>

      {/* 3. 季節の特集。10〜1月はクリスマス特集。シーズン外は何も出さない。 */}
      {showSeasonBand && (
        <section
          data-home-module="season"
          className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-background text-foreground"
        >
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-14">
            <SeasonFeatureBand today={today} />
          </div>
        </section>
      )}

      {/*
        4. 使う: 旅程を組む / 今週のロンドン。
        このサイトで唯一「読む」ではなく「する」ものと、唯一毎週変わるもの。
        2枚を横に並べる。今週号が無い週は旅程だけを全幅で出す。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-background text-foreground">
        <div
          className={`mx-auto max-w-6xl px-4 pb-12 sm:pb-16 ${
            showSeasonBand ? "pt-6 sm:pt-8" : "pt-12 sm:pt-16"
          }`}
        >
          <div
            className={`grid gap-6 ${latestBrief ? "lg:grid-cols-2 lg:gap-8" : ""}`}
          >
            <div data-home-module="plan" className="h-full">
              <PlanPromo />
            </div>
            {latestBrief && (
              <div data-home-module="weekly" className="h-full">
                <WeeklyCard brief={latestBrief} now={now} />
              </div>
            )}
          </div>

          {/*
            今月。「◯月のロンドン」(天気・服装・祝日・催し)と、その時期の
            行事への入口。今週号は来週には古くなるが、旅の計画は数週間先の
            ことが多いので、月の単位でも案内する。本文のある月と行事のある
            時期にだけ出る(thisMonth を参照)。
          */}
          {thisMonth && (
            <div
              data-home-module="month"
              className="mt-6 flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  今月のロンドン
                </p>
                {thisMonth.guide ? (
                  <>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">
                      <Link
                        href={thisMonth.guideHref}
                        className="underline-offset-4 hover:underline"
                      >
                        {thisMonth.month}月のロンドン
                      </Link>
                    </h2>
                    {/* 導入は月ごとの短い teaser。以前は2〜3文の lead を2行で
                        切っていて、「東京の1…」のように数字の途中で終わっていた。 */}
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {thisMonth.guide.teaser}
                    </p>
                  </>
                ) : (
                  <h2 className="mt-1 text-xl font-bold tracking-tight">
                    {thisMonth.month}月の行事
                  </h2>
                )}
              </div>
              {thisMonth.links.length > 0 && (
                <ul className="flex shrink-0 flex-wrap gap-2 lg:max-w-md lg:justify-end">
                  {thisMonth.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-foreground/40"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {/*
        5. 英国を読む。
        旧トップでは10ブロック中の9番目にあり、ほぼ誰にも届いていなかった。
        自分たちが書いたものがこのサイトの本体なので、名所の棚より先に置く。
      */}
      <section
        id="reading"
        data-home-module="reading"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-muted/30 text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="border-b border-foreground/15 pb-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              英国を読む
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              コラム、時事論考、イギリス英語と、通史10章。イギリスの歴史と言葉を読むページです。
            </p>
          </div>

          {readingLead ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
              {/* 主役1本。写真を大きく取り、見出しは写真の下に置く。
                  写真に重ねると長い日本語見出しが2〜3行になって写真を潰す。 */}
              <Link
                href={readingLead.href}
                className="group block lg:col-span-7"
              >
                <article>
                  {readingLead.item.image && (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                      <img
                        {...responsiveImage(
                          readingLead.item.image,
                          "(min-width: 1024px) 640px, 100vw",
                          960,
                        )}
                        alt={readingLead.item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <p className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${readingLead.badge}`}
                    >
                      {readingLead.label}
                    </span>
                    {readingLead.seriesLabel && (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {readingLead.seriesLabel}
                      </span>
                    )}
                  </p>
                  <h3 className="mt-2.5 break-words text-xl font-bold leading-snug tracking-tight decoration-1 underline-offset-4 group-hover:underline sm:text-2xl">
                    {readingLead.heading}
                  </h3>
                  {readingLead.subheading && (
                    <p className="mt-1.5 text-base font-semibold leading-snug">
                      {readingLead.subheading}
                    </p>
                  )}
                  {readingLead.item.summary && (
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {stripInlineMarkdown(readingLead.item.summary)}
                    </p>
                  )}
                </article>
              </Link>

              {/* 残りはカテゴリ混在の1リスト。色でどの区分かを示す。
                  サムネイルを付けたのは、文字だけの行が主役の写真の
                  真横に並ぶと、同じセクションの中で急に密度が落ちるため。 */}
              <ul className="min-w-0 divide-y divide-border lg:col-span-5">
                {readingRest.map((entry) => (
                  <li key={entry.href} className="min-w-0 first:-mt-3">
                    <Link
                      href={entry.href}
                      className="group flex min-w-0 items-start gap-3.5 py-4"
                    >
                      {entry.item.image ? (
                        <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          <img
                            {...responsiveImage(entry.item.image, "80px")}
                            alt=""
                            aria-hidden
                            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                      ) : (
                        <span
                          className={`mt-1 h-14 w-1 shrink-0 rounded-full ${entry.stripe}`}
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={`text-xs font-bold ${entry.text}`}>
                          {entry.label}
                          {entry.seriesLabel && (
                            <span className="font-semibold text-muted-foreground">
                              {" "}· {entry.seriesLabel}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-sm font-semibold leading-snug decoration-1 underline-offset-2 group-hover:underline">
                          {entry.heading}
                        </span>
                        {entry.subheading && (
                          <span className="mt-0.5 block line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {entry.subheading}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              近日公開予定です。
            </p>
          )}

          {/* 読み物4区分と読み物のトップ。連載ごとに読者が違うので、
              ここだけは索引を待たずに出す。 */}
          <nav aria-label="読み物の区分" className="mt-8 border-t border-foreground/10 pt-5">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              {READING_SECTIONS.map((sec) => (
                <li key={sec.href}>
                  <Link
                    href={sec.href}
                    className="inline-block py-1 underline decoration-border underline-offset-4 transition hover:decoration-current"
                  >
                    {sec.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/reading"
                  className="inline-block py-1 underline decoration-border underline-offset-4 transition hover:decoration-current"
                >
                  読み物トップへ →
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <div className="my-2">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      {/*
        6. 見る・する。
        旧トップの「観光」「体験する」2セクション(カード計20枚超・約5画面)の
        置き換え。DBにある写真と固有名詞を横スクロールの棚で見せる。
        以前は棚を5本縦に積んでいて、スマホで3.2画面あった。区分の切り替えで
        2本にまとめ(RailTabs)、並びは直近1週間の閲覧順にした。
      */}
      <section
        id="explore"
        data-home-module="rails"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b border-t bg-background text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="max-w-2xl border-b border-foreground/15 pb-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ロンドンで見る・する
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              定番の名所と無料で入れる美術館、ウエストエンドの舞台、
              パブの一皿、持ち帰る土産。それぞれ詳細ページに、行き方・料金・
              買える場所まで書いています。
            </p>
          </div>

          <div className="mt-10 space-y-12 sm:space-y-14">
            <RailTabs
              title="名所と美術館、舞台"
              tabs={[
                {
                  key: "sights",
                  label: "名所",
                  description:
                    "初めての旅行で押さえておきたい定番。混雑する時間と回る順番も添えています。",
                  href: "/sightseeing/must-see",
                  moreLabel: "名所をすべて見る",
                  items: sights,
                },
                {
                  key: "museums",
                  label: "美術館",
                  description:
                    "大英博物館もナショナル・ギャラリーも常設展は無料。何を見るべきかを作品単位で。",
                  href: "/museums/best-10-museums",
                  moreLabel: "美術館ナビへ",
                  items: museums,
                },
                {
                  key: "musicals",
                  label: "ミュージカル",
                  description:
                    "あらすじ、上演時間、劇場の座席、当日券の取り方まで。英語が不安でも観られる演目も。",
                  href: "/musicals",
                  moreLabel: "ミュージカル一覧へ",
                  items: musicals,
                },
              ]}
            />
            <RailTabs
              title="食べるものと、お土産"
              tabs={[
                {
                  key: "eat",
                  label: "食べる",
                  description:
                    "まずいと言われがちな料理を、評判の店の名前つきで。頼み方のコツも。",
                  href: "/restaurants",
                  moreLabel: "レストランガイドへ",
                  items: rails.dishes,
                },
                {
                  key: "souvenirs",
                  label: "お土産",
                  description:
                    "「紅茶」ではなく銘柄と商品名で。どこで買えるか、機内持ち込みか預けかまで書いています。",
                  href: "/souvenirs",
                  moreLabel: "お土産をすべて見る",
                  items: rails.souvenirs,
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/*
        7. サイト索引 + このサイトの書き方。
        旧トップは同じ導線をヒーロー直下のハブ(カード9枚)と各セクション末尾の
        ボタンで二度出していた。ここ1箇所に集約し、途中では繰り返さない。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-muted/40 text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div data-home-module="index">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              このサイトにあるもの
            </h2>
            <div className="mt-6 border-t border-border/70 sm:mt-8">
              {SITE_INDEX.map((group) => (
                <SiteIndexGroup
                  key={group.label}
                  label={group.label}
                  stripe={group.stripe}
                  links={group.links}
                />
              ))}
            </div>
          </div>

          {/*
            このサイトの書き方。以前ここにあった「ロンドン観光をもっと楽しむための
            ガイド」は冒頭の説明の言い換えで、何も足していなかった。代わりに、
            実際にしていること(調べた日を出す、改定を月ごとに追う)を、
            その範囲で書く。すべての料金に確認日が付いているわけではないので、
            そうとは書かない。誤りの連絡はお問い合わせのリンクに任せ、
            「確かめて直します」のような約束は /about の編集方針1か所に置く。
            掲載数はDBから数える。
          */}
          <div data-home-module="policy" className="mt-14 max-w-3xl border-t pt-8">
            <h2 className="text-xl font-bold tracking-tight">
              このサイトの書き方
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/60">
              <li>
                運休・催し・年末年始の営業は公式の発表で確かめ、いつ調べたかを添えています(今週のロンドン、クリスマス特集など)。
              </li>
              <li>
                運賃・入場料・最低賃金などの改定は「今月変わったロンドン」に月ごとにまとめ、サイト内の数字もそのとき直しています。
              </li>
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "観光スポット", value: counts.attractions, unit: "か所" },
                { label: "美術館・博物館", value: counts.museums, unit: "館" },
                { label: "ミュージカル", value: counts.musicals, unit: "作品" },
                { label: "読み物", value: counts.reading, unit: "本" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-background px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-0.5 text-xl font-bold">
                    {stat.value}
                    <span className="ml-0.5 text-sm font-semibold">{stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <Link
                href="/about#editorial"
                className="underline decoration-border underline-offset-4 hover:decoration-current"
              >
                編集方針(サイト概要)
              </Link>
              <Link
                href="/contact"
                className="underline decoration-border underline-offset-4 hover:decoration-current"
              >
                誤りを知らせる(お問い合わせ)
              </Link>
            </p>
          </div>
        </div>
      </section>

      <HomeClickTracker />
      {/* トップは (with-ads) の外にあるので、AdSense の読み込みはここで行う。 */}
      <AdSenseLoader />
    </div>
  );
}
