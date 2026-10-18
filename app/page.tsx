export const revalidate = 60 * 60;

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import AdSenseLoader from "@/components/ads/AdSenseLoader";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import HeroIntro from "@/components/home/HeroIntro";
import HeroMosaic from "@/components/home/HeroMosaic";
import PhotoRail from "@/components/home/PhotoRail";
import LiveStrip from "@/components/live/LiveStrip";
import PlanPromo from "@/components/home/PlanPromo";
import Reveal, { RevealGroup, RevealItem } from "@/components/home/Reveal";
import {
  fetchColumns,
  fetchBritishEnglishEntries,
  fetchModernBritainEntries,
  fetchHeroSlides,
} from "@/utils/actions/contents";
import { fetchHomeRails } from "@/utils/actions/home";
import { fetchCurrentBriefs } from "@/utils/actions/weekly";
import { formatWeekRange, getIssueFreshness, getKindMeta } from "@/lib/weekly";
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
 *   1. ヒーロー      名前つきの写真モザイク + このサイトが何かの1文 + 検索
 *   2. 今日          LiveStrip。天気・運行・為替の要約
 *   3. 使う          旅程を組む / 今週のロンドン。2枚並べて1帯にしている
 *   4. 英国を読む    自分たちが書いたものが主役。旧は10ブロック中の9番目だった
 *   5. 見る・する    DBの写真を横スクロールの棚に5列。旧の観光+体験の置き換え
 *   6. サイト索引    全区分のテキスト索引 + サイト概要
 *
 * 3 をこの位置に置いているのは、このサイトで唯一の「読む」ではなく
 * 「する」ものだから。下に置くと、旅程を組めること自体に気づかれない。
 * 旅程と今週号はどちらも「見出し+説明+ボタン」の同じ形なので、縦に
 * 2帯並べず横に2枚並べた。それぞれ中身の一覧(押せる名所タイル・今週号の
 * 項目リスト)を添えていたが、トップで中身まで見せると帯が長くなるだけで、
 * 押す先は結局1つしかない。一覧は行き先のページに任せる。
 *
 * 色の使い分けは踏襲する(観光=赤、体験=琥珀、旅=空、在住=翠、読み物=菫)。
 * ただし色を載せるのは索引の細い罫と棚の見出しだけにした。旧トップは
 * 8色を全部「角丸の箱に色付きアイコン」という同じ形に載せていたため、
 * 色を分けても差として効いていなかった。
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

/** 読み物4区分への導線。ハブ(/reading)と同じ並び・同じ色にする。 */
const READING_SECTIONS = [
  {
    href: "/column",
    eyebrow: "Column",
    label: "コラム",
    stripe: READING_ACCENT.column.bar,
    text: READING_ACCENT.column.text,
  },
  {
    href: "/modern-britain",
    eyebrow: "Britain, Argued",
    label: "英国のいまを論じる",
    stripe: READING_ACCENT["modern-britain"].bar,
    text: READING_ACCENT["modern-britain"].text,
  },
  {
    href: "/history",
    eyebrow: "A History of Britain",
    label: "イギリスの歴史 全10章",
    stripe: READING_ACCENT.history.bar,
    text: READING_ACCENT.history.text,
  },
  {
    href: "/british-english",
    eyebrow: "British English",
    label: "イギリス英語",
    stripe: READING_ACCENT["british-english"].bar,
    text: READING_ACCENT["british-english"].text,
  },
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
 * 本数が違っても行の高さは数段に収まる。
 *
 * 区分・リンク・ラベルはグローバルナビ(components/navbar/menu.ts)から作る。
 * 以前はここだけ手書きしていて、同じURLのラベルが21件食い違い、
 * 「ロンドンの外へ」は旅の準備の中、「今週のロンドン」は読み物の中と、
 * 置き場所までナビと違っていた。リンクを足すときは menu.ts に足す。
 */
const SITE_INDEX = [
  ...MENU_SECTIONS.map((section) => ({
    eng: section.eyebrow,
    label: section.label,
    stripe: section.accent.stripe,
    links: sectionLinks(section),
  })),
  // ナビで単独のリンクになっている「旅行プランを作る」「今週のロンドン」。
  // どの区分の札にも入らないので、トップの「使う」帯と同じ名前の行にまとめる。
  {
    eng: "Use",
    label: "使う",
    stripe: "bg-indigo-500",
    links: LINK_SECTIONS.map(({ href, label }) => ({ href, label })),
  },
];

/**
 * 「今月」の帯に添える行事。月(ロンドン時間、1〜12)で出し分ける。
 * 会期・発売日は各ページが出典つきで持つので、ここはリンクだけ。
 * 行事のページを足したら、ここにも出す月を足す。
 */
const SEASONAL_LINKS: { months: number[]; href: string; label: string }[] = [
  { months: [10, 11], href: "/events/bonfire-night", label: "ボンファイア・ナイトの花火" },
  { months: [10, 11, 12], href: "/sightseeing/christmas-markets", label: "クリスマスマーケット" },
  { months: [11, 12], href: "/sightseeing/hyde-park-winter-wonderland", label: "ウィンター・ワンダーランド" },
  { months: [11, 12], href: "/events/new-years-eve-fireworks", label: "年越し花火" },
  { months: [12, 1], href: "/events/new-years-day-parade", label: "元日のパレード" },
];

export default async function Page() {
  const now = new Date();
  const [
    latestColumns,
    latestModernBritain,
    latestBritishEnglish,
    { brief: latestBrief },
    heroSlides,
    rails,
  ] = await Promise.all([
    fetchColumns(),
    fetchModernBritainEntries(),
    fetchBritishEnglishEntries(),
    // /events と同じ号を選ぶ。号は2週ほど先まで公開しているので、最新号を
    // 出すとリンク先(/events は今週号)と別の週が並んでしまう。
    fetchCurrentBriefs(),
    fetchHeroSlides(6),
    fetchHomeRails(),
  ]);

  // ヒーローのモザイクに渡す形に均す。棚(PhotoRail)と同じ RailItem に
  // 揃えておくと、タイルとカードで別々の props を持たずに済む。
  const heroTiles = heroSlides.map((slide) => ({
    slug: slide.slug,
    href: `/sightseeing/${slide.slug}`,
    name: slide.name,
    engName: slide.engName,
    image: slide.image,
    blurb: slide.tagline,
  }));

  // 今月の帯。本文を書いた月(lib/london-months)か、行事のある時期にだけ出す。
  const month = Number(londonDate(now).slice(5, 7));
  const monthGuide = getMonthGuide(month);
  const seasonal = SEASONAL_LINKS.filter((link) => link.months.includes(month));
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
  const readingEntries = (
    [
      ["column", latestColumns],
      ["modern-britain", latestModernBritain],
      ["british-english", latestBritishEnglish],
    ] as const
  )
    .flatMap(([key, items]) =>
      items.slice(0, 2).map((item) => {
        const cat = READING_CATEGORY[key as ReadingCategoryKey];
        return {
          item,
          href: `${cat.base}/${item.slug}`,
          label: cat.label,
          stripe: cat.stripe,
          badge: cat.badge,
          text: cat.text,
          // イギリス英語は見出しより英単語のほうが引きが強い。
          heading:
            key === "british-english" && item.engTitle
              ? item.engTitle
              : item.title,
        };
      })
    )
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

  // ストライキ等は数日で覆るので、今週号・来週号のときだけ「注意」を出す。
  // 古い号の注意を出し続けると誤情報になる。
  const freshness = latestBrief
    ? getIssueFreshness(latestBrief.weekStart, now)
    : null;
  // 今週号が無い週は過去号か先の週の号が来る。どちらも「今週」とは名乗らない。
  const isThisWeek = freshness?.weeksAgo === 0;
  const topAlert =
    latestBrief && freshness && freshness.weeksAgo <= 0
      ? latestBrief.items.find(
          (item) =>
            getKindMeta(item.kind).group === "alert" && item.severity === "high"
        ) ?? null
      : null;

  return (
    <div className="bg-background">
      {/*
        1. ヒーロー。
        写真を文字の下敷きにするのをやめ、左に文言・右に名前つきの写真タイルを
        置く二分割にした。暗幕が要らないので写真が沈まず、写っている場所に
        そのまま入れる。判断の経緯は HeroMosaic.tsx を参照。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-background text-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-16">
          <div className="lg:col-span-5">
            <HeroIntro />
          </div>
          {/* スマホでは写真を低めにして、検索と近道の下に続く
              「今日」の帯(天気・運行・為替)を1画面目に近づける。 */}
          <div className="h-[220px] sm:h-[420px] lg:col-span-7 lg:h-[500px]">
            <HeroMosaic items={heroTiles} />
          </div>
        </div>
      </section>

      {/* 天気・運行状況・為替の要約。「今日どうか」を一目で渡して送り出すだけ。 */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-muted/40 text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <LiveStrip />
        </div>
      </section>

      {/*
        3. 使う: 旅程を組む / 今週のロンドン。
        このサイトで唯一「読む」ではなく「する」ものと、唯一毎週変わるもの。
        どちらも「見出し+説明+ボタン」の同じ形なので、縦に2帯に分けず
        横に2枚並べている。今週号が無い週は旅程だけを全幅で出す。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <Reveal
            className={`grid gap-6 ${latestBrief ? "lg:grid-cols-2 lg:gap-8" : ""}`}
          >
            <PlanPromo />

            {latestBrief && (
              <div className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-400">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {/* 今週号のときだけ点滅させる。過去号で光らせると、
                        古い情報を最新のものとして押し出すことになる。 */}
                    {!freshness?.isPast && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-600" />
                  </span>
                  {isThisWeek
                    ? "This Week ・ 今週のロンドン"
                    : "London Weekly ・ ロンドン週報"}
                </p>
                <h2 className="mt-3 break-words text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                  {latestBrief.title}
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  {formatWeekRange(latestBrief.weekStart, latestBrief.weekEnd)}
                  {freshness && !isThisWeek && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">
                      {freshness.label}の号
                    </span>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {latestBrief.headline}
                </p>

                {/* 号の項目一覧はトップから外したが、深刻な支障だけは1行残す。
                    ストライキや長期運休は、記事を開かせる前に伝わらないと
                    意味がない。今週号・来週号のときしか出ない(topAlert)。 */}
                {topAlert && (
                  <Link
                    href="/events"
                    className="mt-5 flex min-w-0 items-start gap-3 rounded-xl bg-red-50/80 p-3.5 transition-colors hover:bg-red-100/70 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/10">
                      <TriangleAlert className="h-4 w-4 text-red-600" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                        {freshness?.label}の注意
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-sm font-semibold leading-snug">
                        {topAlert.title}
                      </span>
                    </span>
                  </Link>
                )}

                <div className="mt-6 pt-2 sm:mt-auto">
                  <Button
                    asChild
                    size="lg"
                    className="bg-sky-700 text-white hover:bg-sky-800"
                  >
                    <Link href="/events">
                      {isThisWeek
                        ? "今週号を読む"
                        : freshness?.isPast
                          ? "最新号を読む"
                          : `${freshness?.label}の号を読む`}{" "}
                      →
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </Reveal>

          {/*
            今月。「◯月のロンドン」(天気・服装・祝日・催し)と、その時期の
            行事への入口。今週号は来週には古くなるが、旅の計画は数週間先の
            ことが多いので、月の単位でも案内する。本文のある月と行事のある
            時期にだけ出る(thisMonth を参照)。
          */}
          {thisMonth && (
            <Reveal className="mt-6">
              <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
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
                      <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {thisMonth.guide.lead}
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
            </Reveal>
          )}
        </div>
      </section>

      {/*
        4. 英国を読む。
        旧トップでは10ブロック中の9番目にあり、ほぼ誰にも届いていなかった。
        自分たちが書いたものがこのサイトの本体なので、名所の棚より先に置く。
      */}
      <section
        id="reading"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-muted/30 text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-foreground/15 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">
                Reading Britain
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                英国を読む
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                ガイドブックが終わるところから、イギリスは面白くなる。
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/reading">読み物トップへ →</Link>
            </Button>
          </div>

          {readingLead ? (
            <Reveal className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
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
                        {...responsiveImage(readingLead.item.image, "(min-width: 1024px) 640px, 100vw")}
                        alt={readingLead.item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <p className="mt-4 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${readingLead.badge}`}
                    >
                      {readingLead.label}
                    </span>
                  </p>
                  <h3 className="mt-2.5 break-words text-xl font-bold leading-snug tracking-tight decoration-1 underline-offset-4 group-hover:underline sm:text-2xl">
                    {readingLead.heading}
                  </h3>
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
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-sm font-semibold leading-snug decoration-1 underline-offset-2 group-hover:underline">
                          {entry.heading}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              近日公開予定です。
            </p>
          )}

          {/* 読み物4区分。ここだけは索引を待たずに出す。
              連載ごとに読者が違い、トップまで戻らせたくないため。 */}
          <RevealGroup className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {READING_SECTIONS.map((sec) => (
              <RevealItem key={sec.href}>
                <Link href={sec.href} className="group block h-full">
                  <div className="flex h-full items-center gap-3 rounded-lg border bg-card px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md">
                    <span
                      className={`h-8 w-1 shrink-0 rounded-full ${sec.stripe}`}
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-[10px] font-bold uppercase tracking-[0.15em] ${sec.text}`}
                      >
                        {sec.eyebrow}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-semibold">
                        {sec.label}
                      </span>
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <div className="my-2">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      {/*
        5. 見る・する。
        旧トップの「観光」「体験する」2セクション(カード計20枚超・約5画面)の
        置き換え。アイコン付きカードで category を説明する代わりに、
        DBにある写真と固有名詞を横スクロールの棚で見せる。
        件数は3枚から各10枚以上に増え、縦は半分以下になった。
      */}
      <section
        id="explore"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b border-t bg-background text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="max-w-2xl border-b border-foreground/15 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-600 dark:text-red-400">
              See &amp; Do
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              ロンドンで見る・する
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              定番の名所と無料で入れる美術館、ウエストエンドの舞台、
              パブの一皿、持ち帰る土産。それぞれ詳細ページに、行き方・料金・
              買える場所まで書いています。
            </p>
          </div>

          <RevealGroup className="mt-10 space-y-12 sm:space-y-14" stagger={0.1}>
            <RevealItem>
              <PhotoRail
                eyebrow="Must-See"
                title="見逃せない名所"
                description="初めての旅行で押さえておきたい定番。混雑する時間と回る順番も添えています。"
                href="/sightseeing/must-see"
                moreLabel="名所をすべて見る"
                items={rails.attractions}
                accentClassName="bg-red-500"
              />
            </RevealItem>
            <RevealItem>
              <PhotoRail
                eyebrow="Museums"
                title="無料で入れる名門美術館"
                description="大英博物館もナショナル・ギャラリーも常設展は無料。何を見るべきかを作品単位で。"
                href="/museums/best-10-museums"
                moreLabel="美術館ナビへ"
                items={rails.museums}
                accentClassName="bg-red-500"
              />
            </RevealItem>
            <RevealItem>
              <PhotoRail
                eyebrow="West End"
                title="ウエストエンドのミュージカル"
                description="あらすじ、上演時間、劇場の座席、当日券の取り方まで。英語が不安でも観られる演目も。"
                href="/musicals"
                moreLabel="ミュージカル一覧へ"
                items={rails.musicals}
                accentClassName="bg-amber-500"
              />
            </RevealItem>
            <RevealItem>
              <PhotoRail
                eyebrow="Eat"
                title="イギリスで食べる"
                description="まずいと言われがちな料理を、実際にうまい店の名前つきで。頼み方のコツも。"
                href="/restaurants"
                moreLabel="レストランガイドへ"
                items={rails.dishes}
                accentClassName="bg-amber-500"
              />
            </RevealItem>
            <RevealItem>
              <PhotoRail
                eyebrow="Souvenirs"
                title="買って帰る"
                description="「紅茶」ではなく銘柄と商品名で。どこで買えるか、機内持ち込みか預けかまで書いています。"
                href="/souvenirs"
                moreLabel="お土産をすべて見る"
                items={rails.souvenirs}
                accentClassName="bg-amber-500"
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/*
        6. サイト索引 + 概要。
        旧トップは同じ導線をヒーロー直下のハブ(カード9枚)と各セクション末尾の
        ボタンで二度出していた。ここ1箇所に集約し、途中では繰り返さない。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-muted/40 text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Index
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            このサイトにあるもの
          </h2>

          <div className="mt-8 border-t border-border/70">
            {SITE_INDEX.map((group) => (
              <div
                key={group.eng}
                className="grid gap-x-8 gap-y-3 border-b border-border/70 py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:py-6"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <span
                      className={`h-3 w-0.5 shrink-0 rounded-full ${group.stripe}`}
                    />
                    {group.eng}
                  </p>
                  <p className="mt-1.5 text-sm font-bold">{group.label}</p>
                </div>
                <ul className="flex flex-wrap content-start gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block rounded-full border border-border bg-background px-3 py-1.5 text-xs leading-none text-muted-foreground transition hover:border-foreground/30 hover:bg-card hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 検索から来た読者向けの説明。導線を塞がないよう索引の後に置く。 */}
          <div className="mt-14 max-w-3xl border-t pt-8">
            <h2 className="text-base font-semibold">
              ロンドン観光をもっと楽しむためのガイド
            </h2>
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                ジャスト・ロンドンは、ロンドンを訪れる日本人旅行者のための観光ガイドサイトです。
                定番の観光スポットから、美術館、ミュージカル、季節ごとのイベントまで、
                初めての方にも分かりやすく情報をまとめています。
              </p>
              <p>
                地下鉄やバスなどの移動手段、無料で楽しめる観光地、
                子ども連れや一人旅におすすめのスポットなど、
                旅行計画に役立つ実用的な情報も充実しています。
                あわせて、ビザ・住まい探し・労働問題など、
                ロンドンで暮らし働く人のための実務情報も扱っています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* トップは (with-ads) の外にあるので、AdSense の読み込みはここで行う。 */}
      <AdSenseLoader />
    </div>
  );
}
