export const revalidate = 60 * 60;

import Link from "next/link";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Landmark,
  Ticket,
  Plane,
  FileText,
  Gift,
  Baby,
  Calendar,
  Receipt,
  Crown,
  Wand2,
  Clapperboard,
  Trophy,
  Ship,
  Route,
  BedDouble,
  TrainFront,
  Compass,
  Home as HomeIcon,
  Briefcase,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  BookOpen,
  Radio,
  Newspaper,
  TriangleAlert,
  Sparkles,
  Languages,
  Stethoscope,
  Wallet,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import HeroContent from "@/components/home/HeroContent";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import LiveStrip from "@/components/live/LiveStrip";
import SectionHeader from "@/components/home/SectionHeader";
import Reveal, { RevealGroup, RevealItem } from "@/components/home/Reveal";
import {
  fetchColumns,
  fetchBritishEnglishEntries,
  fetchModernBritainEntries,
  fetchUpcomingEvents,
  fetchHeroSlides,
} from "@/utils/actions/contents";
import { fetchLatestBrief } from "@/utils/actions/weekly";
import {
  formatWeekRange,
  getIssueFreshness,
  getKindMeta,
} from "@/lib/weekly";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/",
  title: `${SITE_NAME} | ロンドン観光・美術館・ミュージカル・イベント情報`,
  titleSuffix: false,
  description:
    "初めてのロンドン旅行でも安心。定番の観光スポット、美術館と必見作品、ウエストエンドのミュージカル、季節のイベント、ビザや現地で働く情報まで、日本語でまとめた総合ロンドンガイドです。",
});

// トップページは「観光 / Things to Do / Traveller Info / Resident Info / コラム」の
// 大区分で構成する。区分をまたぐ判断に迷わないよう、振り分けの基準は一つだけ:
//
//   観光       = 見る(場所そのもの)。ロンドン市内。
//   ThingsToDo = する(体験)。ロンドン市内。
//   Beyond London = ロンドン外の目的地。市内かどうかだけで決まるので、
//                   ロンドン外の「見る」も「する」もこちらに入る(将来追加)。
//   Traveller  = 旅行者の実務(ETA・日程・宿・交通)。
//   Resident   = 在住者の実務(ビザ・住まい・仕事)。
//   コラム     = 読み物と更新もの。
//
// セクションごとにアクセントカラーを分け、スクロール時に今どの区分かを判別しやすくする。
// ブランドカラーの赤は、ロゴ・主要CTAと最上位の「観光」区分だけで使う。
/**
 * トップページの「英国を読む」帯。色は各セクションの詳細ページ・ナビと揃える。
 * ハブ(/reading)と同じ4区分・同じ色で、どちらから来ても迷わないようにする。
 */
const READING_SECTIONS = [
  {
    href: "/column",
    eyebrow: "Column",
    label: "コラム",
    stripe: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-800",
  },
  {
    href: "/modern-britain",
    eyebrow: "Britain, Argued",
    label: "英国のいまを論じる",
    stripe: "bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  {
    href: "/history",
    eyebrow: "A History of Britain",
    label: "イギリスの歴史 全10章",
    stripe: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-500",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  {
    href: "/british-english",
    eyebrow: "British English",
    label: "イギリス英語",
    stripe: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-800",
  },
] as const;

/** 読み物カテゴリごとの表示定義。上の帯と同じ色を使う。 */
const READING_CATEGORY = {
  column: {
    base: "/column",
    label: "コラム",
    stripe: "bg-violet-500",
    badge: "bg-violet-600",
    text: "text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-800",
  },
  "modern-britain": {
    base: "/modern-britain",
    label: "英国のいま",
    stripe: "bg-indigo-500",
    badge: "bg-indigo-600",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  "british-english": {
    base: "/british-english",
    label: "イギリス英語",
    stripe: "bg-rose-500",
    badge: "bg-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-800",
  },
} as const;

type ReadingCategoryKey = keyof typeof READING_CATEGORY;

const ACCENTS = {
  red: {
    badge: "bg-red-600 hover:bg-red-600",
    iconBg: "bg-red-50 dark:bg-red-950/40",
    iconText: "text-red-600",
    hoverBorder: "hover:border-red-300 dark:hover:border-red-800",
  },
  amber: {
    badge: "bg-amber-600 hover:bg-amber-600",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconText: "text-amber-600",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  blue: {
    badge: "bg-sky-600 hover:bg-sky-600",
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconText: "text-sky-600",
    hoverBorder: "hover:border-sky-300 dark:hover:border-sky-800",
  },
  emerald: {
    badge: "bg-emerald-600 hover:bg-emerald-600",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconText: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
  },
  violet: {
    badge: "bg-violet-600 hover:bg-violet-600",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconText: "text-violet-600",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-800",
  },
  rose: {
    badge: "bg-rose-600 hover:bg-rose-600",
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconText: "text-rose-600",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-800",
  },
  // 「英国のいまを論じる」。読み物だがコラム(violet)と別枠なので色も分ける。
  indigo: {
    badge: "bg-indigo-600 hover:bg-indigo-600",
    iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
    iconText: "text-indigo-600",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  // Beyond London 用に確保。区分を追加するときはここを使う。
  teal: {
    badge: "bg-teal-600 hover:bg-teal-600",
    iconBg: "bg-teal-50 dark:bg-teal-950/40",
    iconText: "text-teal-600",
    hoverBorder: "hover:border-teal-300 dark:hover:border-teal-800",
  },
} as const;

export default async function Page() {
  const now = new Date();
  const [
    latestColumns,
    latestModernBritain,
    latestBritishEnglish,
    upcomingEvents,
    latestBrief,
    heroSlides,
  ] = await Promise.all([
    fetchColumns(),
    fetchModernBritainEntries(),
    fetchBritishEnglishEntries(),
    fetchUpcomingEvents(3, now),
    fetchLatestBrief(),
    fetchHeroSlides(),
  ]);
  // 読み物はカテゴリごとに3枚ずつ並べるのをやめ、横断の1リストにする。
  // 各カテゴリの新しい方から2本ずつ拾い、全体を新着順に並べ替える。
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
          hoverBorder: cat.hoverBorder,
          // イギリス英語は見出しより英単語のほうが引きが強い。
          heading:
            key === "british-english" && item.engTitle
              ? item.engTitle
              : item.title,
        };
      })
    )
    .sort((a, b) => b.item.createdAt.getTime() - a.item.createdAt.getTime());

  // 主役は画像のある最新記事。画像が無いと見出しを重ねる意匠が成立しない。
  const readingLead =
    readingEntries.find((entry) => entry.item.image) ?? readingEntries[0];
  const readingRest = readingEntries
    .filter((entry) => entry.href !== readingLead?.href)
    .slice(0, 4);

  // ヒーロー直下の警告バー。ストライキ等は数日で覆るので、今週号・来週号のときだけ出す。
  // 古い号の「注意」を出し続けると誤情報になる。
  const freshness = latestBrief
    ? getIssueFreshness(latestBrief.weekStart, now)
    : null;
  const topAlert =
    latestBrief && freshness && freshness.weeksAgo <= 0
      ? latestBrief.items.find(
          (item) =>
            getKindMeta(item.kind).group === "alert" && item.severity === "high"
        ) ?? null
      : null;

  // 今週号の帯に出す抜粋。号のタイトルだけでは「今週は何があるのか」が
  // 伝わらないので、実際の項目を数件見せる。支障(alert)を先に、
  // 催し(opportunity)を後に置く。ヒーロー直下に出している topAlert とは
  // 重複させない。
  const briefPreview = (() => {
    if (!latestBrief) return [];
    const rest = latestBrief.items.filter((item) => item.id !== topAlert?.id);
    const rank = (item: (typeof rest)[number]) => {
      const group = getKindMeta(item.kind).group;
      if (group === "alert") return 0;
      if (group === "opportunity") return 1;
      return 2;
    };
    return [...rest].sort((a, b) => rank(a) - rank(b)).slice(0, 4);
  })();

  return (
    <div className="bg-background">
      {/*
        ヒーロー。背景は観光スポットの写真をゆっくり流す。
        以前はブランドカラーのぼかし円で奥行きを出していたが、
        このサイトが何を扱っているかを一枚で伝えられるのは写真だけなので、
        装飾ではなく実際の掲載スポットの写真に置き換えた。
        前景の文字は写真前提で白に固定している(HeroContent 参照)。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden border-b">
        <HeroSlideshow slides={heroSlides} />

        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-16 sm:pt-24 sm:pb-24">
          <HeroContent />
        </div>
      </section>

      {/*
        今日のロンドンと、今週の注意。
        写真の上に重ねると、テーマ色で描かれたこの2つが読めなくなるうえ、
        ヒーローの主題(検索)から目を奪う。写真の外の無地の帯に下ろした。
      */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/*
            天気・運行状況・為替の要約。詳細は各ページのウィジェットが持ち、
            ここは「今日どうか」を一目で渡して送り出すだけに絞っている。
          */}
          <LiveStrip />

          {topAlert && (
            <Link href="/events" className="mx-auto mt-4 block max-w-2xl">
              <div className="flex items-start gap-3 rounded-xl border border-red-600/30 bg-red-50/80 px-4 py-3 text-left shadow-sm transition hover:border-red-600/60 dark:bg-red-950/30">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                    {freshness?.label}の注意
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug">
                    {topAlert.title}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* 今週のロンドン。読み物セクションの中に埋めていたが、
          週で入れ替わる唯一の情報なので、ヒーロー直後の独立した帯に出す。
          号のタイトルだけでなく実際の項目を数件見せて、
          「今週は何があるのか」をこの場で分からせる。 */}
      {latestBrief && (
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-sky-50/70 text-foreground dark:bg-sky-950/20">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
            <Reveal className="grid gap-6 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-5">
                <p className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-400">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {/* 今週号のときだけ点滅させる。過去号で光らせると、
                        古い情報を最新のものとして押し出すことになる。 */}
                    {!freshness?.isPast && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-75" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-600" />
                  </span>
                  {freshness?.isPast
                    ? "London Weekly ・ ロンドン週報"
                    : "This Week ・ 今週のロンドン"}
                </p>
                <h2 className="mt-2 break-words text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                  {latestBrief.title}
                </h2>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  {formatWeekRange(latestBrief.weekStart, latestBrief.weekEnd)}
                  {freshness?.isPast && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">
                      {freshness.label}の号
                    </span>
                  )}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {latestBrief.headline}
                </p>
                <Button asChild size="lg" className="mt-5 bg-sky-600 hover:bg-sky-700">
                  <Link href="/events">
                    {freshness?.isPast ? "最新号を読む" : "今週号を読む"} →
                  </Link>
                </Button>
              </div>

              {/* 中身を見せる。支障を先、催しを後に並べる。 */}
              {briefPreview.length > 0 && (
                <ul className="min-w-0 divide-y divide-border overflow-hidden rounded-xl border bg-card shadow-sm lg:col-span-7">
                  {briefPreview.map((item) => {
                    const meta = getKindMeta(item.kind);
                    const Icon = meta.icon;
                    return (
                      <li key={item.id} className="min-w-0">
                        <Link
                          href="/events"
                          className="group flex min-w-0 items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.iconWrapClass}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                              >
                                {meta.label}
                              </span>
                              {item.isFree && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  無料
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block line-clamp-2 text-sm font-semibold leading-snug">
                              {item.title}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* 大区分ハブ。このページの背骨で、以下のセクションはこの6枠の展開。 */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b bg-muted/40 text-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RevealItem>
              <CategoryCard
                href="#sightseeing"
                eyebrow="Sightseeing"
                title="観光"
                description="必見スポット、美術館、王室ゆかりの地。まずどこを見るか。"
                icon={MapPin}
                accent={ACCENTS.red}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="#things-to-do"
                eyebrow="Things to Do"
                title="体験する"
                description="ミュージカル、食、買い物、テーマ別の街歩き。何をするか。"
                icon={Sparkles}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="/beyond-london"
                eyebrow="Beyond London"
                title="ロンドンの外へ"
                description="日帰りで行ける7つの行き先。街の紹介より先に、行き方から。"
                icon={TrainFront}
                accent={ACCENTS.teal}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="#traveller"
                eyebrow="Traveller Info"
                title="旅の準備"
                description="ETA、モデルコース、宿泊エリア、地下鉄とバスの乗り方。"
                icon={Plane}
                accent={ACCENTS.blue}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="#resident"
                eyebrow="Resident Info"
                title="住む・働く"
                description="ビザ、部屋探し、労働問題。ロンドンで暮らす人の実務。"
                icon={HomeIcon}
                accent={ACCENTS.emerald}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="/reading"
                eyebrow="Reading Britain"
                title="英国を読む"
                description="コラム、時事論考、通史、イギリス英語。読み物はここから。"
                icon={BookOpen}
                accent={ACCENTS.violet}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="/modern-britain"
                eyebrow="Britain, Argued"
                title="英国のいまを論じる"
                description="最新の英国ニュースを、出典付きで掘り下げて論じる。"
                icon={Radio}
                accent={ACCENTS.indigo}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="/british-english"
                eyebrow="British English"
                title="イギリス英語"
                description="単語・言い回し・スラングを毎日1つ紹介。"
                icon={Languages}
                accent={ACCENTS.rose}
              />
            </RevealItem>
            <RevealItem>
              <CategoryCard
                href="/events"
                eyebrow="This Week"
                title="今週のロンドン"
                description="ストライキ、運休、臨時休館、その週だけの催し。毎週更新。"
                icon={Newspaper}
                accent={ACCENTS.blue}
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <div className="mt-2">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      {/* 観光 ── 見る(場所) */}
      <section
        id="sightseeing"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-background text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Reveal>
            <SectionHeader
              eyebrow="Sightseeing"
              title="ロンドンで見る"
              description="ビッグベンやバッキンガム宮殿といった定番から、世界有数のコレクションを無料で公開する美術館まで。初めての旅行で押さえておきたい場所を集めました。"
              accentClassName={ACCENTS.red.badge}
            />
          </Reveal>

          <RevealGroup className="grid gap-4 md:grid-cols-3">
            <RevealItem>
              <ExploreCard
                href="/sightseeing/must-see"
                title="見逃せないロンドン観光名所"
                description="ビッグベンからバッキンガム宮殿まで、初めての旅行者が押さえておきたい定番スポットを厳選。"
                icon={MapPin}
                accent={ACCENTS.red}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/museums/best-10-museums"
                title="絶対に行くべき美術館10選"
                description="大英博物館やテート・モダンなど、無料で入れる名門美術館を厳選して紹介。"
                icon={Landmark}
                accent={ACCENTS.red}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/sightseeing/royal-london"
                title="ロイヤル・ロンドン"
                description="宮殿、衛兵交代、戴冠式の舞台。王室にまつわる場所をたどるルート。"
                icon={Crown}
                accent={ACCENTS.red}
              />
            </RevealItem>
          </RevealGroup>

          <RevealGroup className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <RevealItem>
              <InfoPill href="/museums" title="美術館ナビ" icon={Landmark} />
              <InfoPill
                href="/sightseeing/all"
                title="観光スポット一覧"
                icon={MapPin}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/museums/best-museums-for-kids"
                title="キッズ向け美術館"
                icon={Baby}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/museums/banksy-artworks"
                title="街で見つかるバンクシー"
                icon={Wand2}
              />
            </RevealItem>
          </RevealGroup>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/sightseeing">ロンドン観光ナビを見る →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Things to Do ── する(体験) */}
      <section
        id="things-to-do"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-muted/40 text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Reveal>
            <SectionHeader
              eyebrow="Things to Do"
              title="ロンドンで体験する"
              description="ウエストエンドの観劇、パブでのイギリス料理、映画のロケ地めぐり。場所を訪れるだけでは終わらない、この街ならではの過ごし方。"
              accentClassName={ACCENTS.amber.badge}
            />
          </Reveal>

          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RevealItem>
              <ExploreCard
                href="/musicals"
                title="ウエストエンドのミュージカル"
                description="今上演中の人気作品と、チケットを安く取るための実践的な方法をまとめて。"
                icon={Ticket}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/restaurants"
                title="ロンドンのレストラン"
                description="フィッシュ&チップスからアフタヌーンティー、ラーメンや飲茶まで料理別に解説。"
                icon={UtensilsCrossed}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/brands"
                title="イギリスのブランド"
                description="バーバリーからドクターマーチンまで。成り立ちと、ロンドンでの買い方の両方から。"
                icon={Tag}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/souvenirs"
                title="ロンドンのお土産"
                description="紅茶、ビスケット、雑貨。どこで買えて何が喜ばれるかを実物ベースで紹介。"
                icon={ShoppingBag}
                accent={ACCENTS.amber}
              />
            </RevealItem>
          </RevealGroup>

          {upcomingEvents.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                これから開催されるイベント
              </h3>
              <RevealGroup className="grid gap-4 sm:grid-cols-3">
                {upcomingEvents.map((event) => {
                  const sameDay =
                    event.startDate.getTime() === event.endDate.getTime();
                  const dateLabel = sameDay
                    ? format(event.startDate, "M月d日")
                    : `${format(event.startDate, "M月d日")}〜${format(event.endDate, "M月d日")}`;

                  return (
                    <RevealItem key={event.id}>
                      <Link href="/events/calendar" className="block h-full">
                        <Card className="h-full bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="mb-1 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-semibold text-amber-600">
                                {dateLabel}
                              </span>
                              {event.isFree && (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-600/40 bg-emerald-600/10 text-[10px] text-emerald-700 dark:text-emerald-400"
                                >
                                  無料
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium leading-snug">
                              {event.title}
                            </p>
                            {event.venue && (
                              <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">
                                {event.venue}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>
          )}

          <RevealGroup className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <RevealItem>
              <InfoPill
                href="/sightseeing/harry-potter"
                title="ハリー・ポッターの世界"
                icon={Wand2}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/sightseeing/film-locations"
                title="映画・ドラマのロケ地巡り"
                icon={Clapperboard}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/sightseeing/stadium-tours"
                title="スタジアムツアー"
                icon={Trophy}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/sightseeing/thames-cruise"
                title="テムズ川クルーズ"
                icon={Ship}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/sightseeing/kids-free-activities"
                title="子どもと無料で楽しむ"
                icon={Baby}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/sightseeing/christmas-markets"
                title="クリスマスマーケット"
                icon={Gift}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/events/calendar"
                title="年間イベントカレンダー"
                icon={Calendar}
                accent={ACCENTS.amber}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/events"
                title="今週のロンドン"
                icon={Newspaper}
                accent={ACCENTS.amber}
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Traveller Info ── 旅行者の実務 */}
      <section
        id="traveller"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-background text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Reveal>
            <SectionHeader
              eyebrow="Traveller Info"
              title="ロンドン旅行の準備"
              description="出発前に済ませる手続きから、現地での移動と滞在まで。何日で何を回り、どこに泊まり、どう動くかを決めるための実務情報。"
              accentClassName={ACCENTS.blue.badge}
            />
          </Reveal>

          <RevealGroup className="grid gap-4 md:grid-cols-3">
            <RevealItem>
              <ExploreCard
                href="/sightseeing/eta-uk-visa-guide"
                title="ETA（電子渡航認証）"
                description="日本国籍でも観光の入国前に取得が必要。申請の手順、費用、取得にかかる日数まで。"
                icon={Plane}
                accent={ACCENTS.blue}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/sightseeing/itinerary"
                title="モデルコース（1〜5日）"
                description="滞在日数別に回る順番を具体化。雨の日プランや子連れアレンジも用意しています。"
                icon={Route}
                accent={ACCENTS.blue}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/sightseeing/hotels"
                title="宿泊エリアの選び方"
                description="同じ予算でも治安と移動時間が大きく変わる。エリアごとの性格を比較して選ぶ。"
                icon={BedDouble}
                accent={ACCENTS.blue}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/sightseeing/transport"
                title="交通ガイド"
                description="地下鉄、バス、Oyster とタッチ決済、空港からの移動。9つのテーマに分けて解説。"
                icon={TrainFront}
                accent={ACCENTS.blue}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/sightseeing/travel-tips"
                title="旅の実用情報"
                description="両替とカード、チップ、治安、コンセント、通信。現地で迷いやすい点をまとめて。"
                icon={Compass}
                accent={ACCENTS.blue}
              />
            </RevealItem>
            <RevealItem>
              <ExploreCard
                href="/events"
                title="今週のロンドン"
                description="ストライキや運休、臨時休館は旅程を直撃する。渡航前に最新号で確認を。"
                icon={Newspaper}
                accent={ACCENTS.blue}
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* Resident Info ── 在住者の実務 */}
      <section
        id="resident"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-muted/40 text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <Reveal>
            <SectionHeader
              eyebrow="Resident Info"
              title="ロンドンで住む・働く"
              description="観光では終わらない人のために。滞在資格をどう取るか、部屋をどう借りるか、口座をどう開くか、体調を崩したらどこに行くか。渡英直後から必要になる実務を整理しています。"
              accentClassName={ACCENTS.emerald.badge}
            />
          </Reveal>

          <RevealGroup className="grid gap-4 md:grid-cols-3">
            <RevealItem>
              <PillarCard
                href="/visa"
                title="英国ビザ"
                description="観光の ETA から、ワーホリ・就労・留学・家族ビザまで。目的と期間から自分のルートを見つける。"
                icon={FileText}
                accent={ACCENTS.emerald}
                links={[
                  { href: "/visa/youth-mobility-scheme", label: "YMS（ワーホリ）" },
                  { href: "/visa/skilled-worker", label: "Skilled Worker（就労）" },
                  { href: "/visa/student", label: "Student／Graduate" },
                  { href: "/visa/after-arrival", label: "渡英後の手続き" },
                ]}
              />
            </RevealItem>
            <RevealItem>
              <PillarCard
                href="/housing"
                title="住まい探し"
                description="2026年5月の法改正で AST も Section 21 も廃止。物件の探し方から敷金の取り戻し方まで。"
                icon={HomeIcon}
                accent={ACCENTS.emerald}
                links={[
                  {
                    href: "/housing/rightmove-zoopla-openrent",
                    label: "物件サイトの使い分け",
                  },
                  { href: "/housing/spareroom", label: "フラットシェアを探す" },
                  {
                    href: "/housing/deposits-and-fees",
                    label: "初期費用と違法な手数料",
                  },
                  { href: "/housing/moving-out", label: "退去とデポジット返還" },
                ]}
              />
            </RevealItem>
            <RevealItem>
              <PillarCard
                href="/jobs"
                title="働く・労働問題"
                description="最低賃金、労働契約、サービスチャージの未払い。英国の労働法を実務に落として解説。"
                icon={Briefcase}
                accent={ACCENTS.emerald}
                links={[
                  { href: "/jobs/minimum-wage", label: "最低賃金・給与明細" },
                  {
                    href: "/jobs/employment-contract",
                    label: "労働契約・就業規則",
                  },
                  {
                    href: "/jobs/service-charges",
                    label: "サービスチャージ完全ガイド",
                  },
                  {
                    href: "/jobs/service-charges/case-story",
                    label: "審判所申立ての実体験",
                  },
                ]}
              />
            </RevealItem>
          </RevealGroup>

          {/*
            医療とお金は、ビザ・住まい・仕事と同じ「渡英直後に必ず要る」層だが、
            上の3枠が制度の重さで先に来るため、2枚目の行として置く。
          */}
          <RevealGroup className="mt-4 grid gap-4 md:grid-cols-2">
            <RevealItem>
              <PillarCard
                href="/money"
                title="お金・銀行"
                description="口座開設が詰まる原因は住所証明。信用スコアではありません。開ける口座、日本からの送金、NIN の取り方まで。"
                icon={Wallet}
                accent={ACCENTS.emerald}
                links={[
                  {
                    href: "/money/opening-an-account",
                    label: "渡英直後に開ける口座",
                  },
                  { href: "/money/passing-the-checks", label: "審査の通し方" },
                  {
                    href: "/money/sending-money-from-japan",
                    label: "日本からの送金と手数料",
                  },
                  {
                    href: "/money/national-insurance-number",
                    label: "National Insurance number",
                  },
                ]}
              />
            </RevealItem>
            <RevealItem>
              <PillarCard
                href="/health"
                title="医療・NHS"
                description="GP 登録に身分証も住所証明も要りません。救急と我慢の間にある 111、処方箋料を頭打ちにする方法まで。"
                icon={Stethoscope}
                accent={ACCENTS.emerald}
                links={[
                  { href: "/health/gp-registration", label: "GP に登録する" },
                  {
                    href: "/health/when-you-are-ill",
                    label: "体調を崩したときの行き先",
                  },
                  {
                    href: "/health/ihs-and-entitlement",
                    label: "IHS とどこまで無料か",
                  },
                  {
                    href: "/health/prescription-costs",
                    label: "処方箋料を下げる",
                  },
                ]}
              />
            </RevealItem>
          </RevealGroup>

          <RevealGroup className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <RevealItem>
              <InfoPill
                href="/visa/uk-visa-guide"
                title="英国ビザ全ルート比較"
                icon={FileText}
                accent={ACCENTS.emerald}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/housing/where-to-live"
                title="住むエリアの選び方"
                icon={MapPin}
                accent={ACCENTS.emerald}
              />
            </RevealItem>
            <RevealItem>
              <InfoPill
                href="/jobs/service-charges/dashboard"
                title="サービスチャージ店舗別データベース"
                icon={Receipt}
                accent={ACCENTS.emerald}
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {/* 英国を読む ── 読み物。コラム・論考・イギリス英語をカテゴリごとの
          カード列に分けて縦に3回繰り返すと、同じ形が続いて的が絞れない。
          1本を主役に立て、残りをカテゴリ横断の1グリッドにまとめる。 */}
      <section
        id="column"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen scroll-mt-8 border-b bg-background text-foreground"
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-foreground/15 pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
                Reading Britain
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                英国を読む
              </h2>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                ガイドブックが終わるところから、イギリスは面白くなる。
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/reading">読み物トップへ →</Link>
            </Button>
          </div>

          {readingLead ? (
            <Reveal className="grid gap-6 lg:grid-cols-12">
              {/* 主役1本。画像に見出しを重ねて、カード列との差を出す。 */}
              <Link
                href={readingLead.href}
                className="group block lg:col-span-7"
              >
                <article
                  className={`h-full overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-lg ${readingLead.hoverBorder}`}
                >
                  {readingLead.item.image && (
                    <div className="relative h-52 w-full sm:h-64">
                      <img
                        src={readingLead.item.image}
                        alt={readingLead.item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${readingLead.badge}`}
                        >
                          {readingLead.label}
                        </span>
                        <h3 className="mt-2 break-words text-xl font-bold leading-snug tracking-tight text-white drop-shadow sm:text-2xl">
                          {readingLead.heading}
                        </h3>
                      </div>
                    </div>
                  )}
                  {readingLead.item.summary && (
                    <div className="p-5">
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {readingLead.item.summary}
                      </p>
                    </div>
                  )}
                </article>
              </Link>

              {/* 残りはカテゴリ混在で1つのリストに。色でどの区分かを示す。 */}
              <ul className="min-w-0 divide-y divide-border overflow-hidden rounded-xl border bg-card lg:col-span-5">
                {readingRest.map((entry) => (
                  <li key={entry.href} className="min-w-0">
                    <Link
                      href={entry.href}
                      className="group flex min-w-0 items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                    >
                      <span
                        className={`mt-1 h-8 w-1 shrink-0 rounded-full ${entry.stripe}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`text-[10px] font-bold ${entry.text}`}
                        >
                          {entry.label}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-sm font-semibold leading-snug">
                          {entry.heading}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : (
            <p className="text-sm text-muted-foreground">近日公開予定です。</p>
          )}

          {/* 4区分それぞれへの導線。カード列の代わりに横並びの帯にする。 */}
          <RevealGroup className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {READING_SECTIONS.map((sec) => (
              <RevealItem key={sec.href}>
                <Link href={sec.href} className="group block h-full">
                  <div
                    className={`flex h-full items-center gap-3 rounded-lg border bg-card px-4 py-3 transition ${sec.hoverBorder}`}
                  >
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

      {/* サイト概要。検索から来た読者向けの説明なので、導線を塞がないよう最下部に置く。 */}
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-muted/40 text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <h2 className="mb-3 text-base font-semibold">
            ロンドン観光をもっと楽しむためのガイド
          </h2>
          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
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
      </section>
    </div>
  );
}

type Accent = (typeof ACCENTS)[keyof typeof ACCENTS];

/** トップ直下の大区分カード。href はページ内アンカーか、区分そのもののハブページ。 */
function CategoryCard({
  href,
  eyebrow,
  title,
  description,
  icon: Icon,
  accent,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
}) {
  return (
    <Link href={href}>
      <Card
        className={`h-full border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${accent.hoverBorder}`}
      >
        <CardContent className="flex h-full flex-col p-5">
          <div className={`mb-3 inline-flex w-fit rounded-lg p-2 ${accent.iconBg}`}>
            <Icon className={`h-5 w-5 ${accent.iconText}`} />
          </div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${accent.iconText}`}
          >
            {eyebrow}
          </p>
          <p className="mt-1 text-lg font-semibold">{title}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * 子リンクを内包する太いカード。Resident Info の3本柱に使う。
 * カード全体をリンクにすると入れ子の a タグになるため、見出しと子を別々のリンクにしている。
 */
function PillarCard({
  href,
  title,
  description,
  icon: Icon,
  accent,
  links,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: Accent;
  links: { href: string; label: string }[];
}) {
  return (
    <Card
      className={`h-full border bg-card text-card-foreground shadow-sm transition hover:shadow-md ${accent.hoverBorder}`}
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className={`mb-3 inline-flex w-fit rounded-lg p-2 ${accent.iconBg}`}>
          <Icon className={`h-5 w-5 ${accent.iconText}`} />
        </div>
        <Link href={href} className="text-base font-semibold hover:underline">
          {title}
        </Link>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
        <ul className="mt-4 space-y-1.5 border-t pt-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-muted-foreground transition hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className={`mt-4 inline-block text-xs font-semibold ${accent.iconText} hover:underline`}
        >
          すべて見る →
        </Link>
      </CardContent>
    </Card>
  );
}

function InfoPill({
  title,
  href,
  icon: Icon,
  accent = ACCENTS.red,
}: {
  title: string;
  href: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Link href={href}>
      <button
        className={`flex w-full items-center gap-2 rounded-xl border bg-card px-4 py-3 text-left text-xs font-medium text-card-foreground shadow-sm transition hover:shadow-md ${accent.hoverBorder}`}
      >
        {Icon && <Icon className={`h-4 w-4 shrink-0 ${accent.iconText}`} />}
        <span>{title}</span>
      </button>
    </Link>
  );
}

function ExploreCard({
  title,
  href,
  description,
  icon: Icon,
  accent = ACCENTS.red,
}: {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
  accent?: Accent;
}) {
  return (
    <Link href={href}>
      <Card className="h-full bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex h-full flex-col justify-between p-4">
          <div>
            {Icon && (
              <div className={`mb-2 inline-flex rounded-lg p-2 ${accent.iconBg}`}>
                <Icon className={`h-4 w-4 ${accent.iconText}`} />
              </div>
            )}
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
