import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Event } from "@prisma/client";

import {
  fetchBriefsForMonth,
  fetchMonthEvents,
  fetchMonthIntroFallback,
  fetchWeeklyPicksForMonth,
} from "@/utils/actions/months";
import { absoluteImage, buildPageMetadata, SITE_URL } from "@/lib/seo";
import { OG_PHOTO_RATIOS, photoOgImage, photoVersion } from "@/lib/og";
import type { ContentPhoto } from "@/lib/content-photo";
import { londonDate } from "@/lib/publish-schedule";
import {
  EVENT_MONTH_NAMES,
  eventMonthPath,
  getSeasonMeta,
  parseEventMonth,
} from "@/lib/events";
import { getDisplayYear } from "@/lib/london-months/year";
import {
  CLIMATE_SOURCES,
  getLondonClimate,
  getTokyoClimate,
  tokyoEquivalentMonth,
} from "@/lib/london-months/climate";
import {
  getClockChange,
  getMonthSunDays,
  hoursBehindJapan,
} from "@/lib/london-months/sun";
import { BANK_HOLIDAY_SOURCE, getMonthDays } from "@/lib/london-months/holidays";
import { getMonthGuide } from "@/lib/london-months/content";
import { isWrittenMonth } from "@/lib/london-months/written-months";
import {
  allEventGuides,
  getEventGuide,
  guideForEventTitle,
  eventGuidePath,
} from "@/lib/annual-events";
import { buildEventGuideMetadata } from "@/lib/annual-events/seo";
import { months as travelTipsMonths } from "@/components/sightseeing/guides/travel-tips/content";
import { SIGHTSEEING_PUBLISHER } from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import EventDetailCard from "@/components/events/EventDetailCard";
import EventGuideView from "@/components/events/guide/EventGuideView";
import MonthSection from "@/components/events/month/MonthSection";
import MonthGlance from "@/components/events/month/MonthGlance";
import MonthClimate from "@/components/events/month/MonthClimate";
import MonthSun from "@/components/events/month/MonthSun";
import MonthHolidays from "@/components/events/month/MonthHolidays";
import MonthWeeklyPicks from "@/components/events/month/MonthWeeklyPicks";
import MonthNav from "@/components/events/month/MonthNav";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import PagePhoto from "@/components/shared/PagePhoto";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { cn } from "@/lib/utils";

/**
 * 「◯月のロンドン」。URL は年の無い月名(/events/november)。
 *
 * 旅行の時期を決める段階から出発前までの読者に、その月の天気・服装・
 * 日の出入り・祝日・イベントを1ページで渡す。「ロンドン 11月 服装」と
 * 「ロンドン 11月 イベント」を別々のページに割らず、ここに束ねる。
 *
 * 中身の出どころ:
 *   平年値      lib/london-months/climate.ts(Met Office / 気象庁、固定値)
 *   日の出入り  lib/london-months/sun.ts(計算)
 *   祝日        lib/london-months/holidays.ts(gov.uk + 計算)
 *   本文        lib/london-months/content/(書いた月だけ。年に依存しない)
 *   イベント    Event テーブル(年ごと)
 *   週次の掲載  WeeklyBriefItem(号を重ねるほど増える)
 *
 * どの年を出すかは getDisplayYear。過ぎた月は来年を出すので、10月に
 * 1月のページを開くと来年1月の日の出入りと祝日になる。
 *
 * 同じ階層に年中行事ガイド(/events/new-years-eve-fireworks)も載せる。
 * 月名でない slug は lib/annual-events のガイドとして引き、無ければ404。
 */

// 年の切り替えは月の変わり目、週次の掲載の「終わったものを外す」は日単位。
// どちらにも間に合うよう1時間で作り直す。
export const revalidate = 60 * 60;

const SOURCES = [
  ...CLIMATE_SOURCES,
  BANK_HOLIDAY_SOURCE,
  {
    label: "Met Office – ロンドンの天気予報",
    url: "https://www.metoffice.gov.uk/weather/forecast/gcpvj0v07",
  },
];

function monthTitle(month: number) {
  return `${month}月のロンドン`;
}

/**
 * 月ページの写真を og:image と JSON-LD の image に渡す形にする。
 * 写真の比ごとの URL は lib/og.ts の photoOgImage(写真だけの画像)。
 */
function monthPhotoImage(
  slug: string,
  photo: ContentPhoto,
  ratio: (typeof OG_PHOTO_RATIOS)[number] = "16x9"
) {
  return photoOgImage(
    "events",
    { slug, alt: photo.alt, version: photoVersion(photo.url) },
    ratio
  );
}

/** 本文を書いていない月の description。数字で他の月と書き分ける。 */
function generatedDescription(month: number, year: number): string {
  const climate = getLondonClimate(month);
  const sun = getMonthSunDays(year, month);
  return `${month}月のロンドンは平年で最高${Math.round(climate.maxTemp)}℃・最低${Math.round(climate.minTemp)}℃、東京の${tokyoEquivalentMonth(month)}月並み。雨は月${Math.round(climate.rainDays)}日ほどで、日の入りは${sun[0].sunset}〜${sun[sun.length - 1].sunset}。服装の目安と祝日、その月のイベントをまとめました。`;
}

function EventGrid({
  events,
  iconWrapClass,
}: {
  events: Event[];
  iconWrapClass: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {events.map((event, idx) => {
        const guide = guideForEventTitle(event.title);
        return (
          <EventDetailCard
            key={event.id}
            event={event}
            index={idx}
            iconWrapClass={iconWrapClass}
            guideHref={guide ? eventGuidePath(guide) : undefined}
          />
        );
      })}
    </div>
  );
}

/** 本文を書いていない月の、天気の節の1段落。 */
function generatedWeather(month: number): string {
  const climate = getLondonClimate(month);
  return `平年値は最高${Math.round(climate.maxTemp)}℃・最低${Math.round(climate.minTemp)}℃で、東京の${tokyoEquivalentMonth(month)}月ごろの気温です。1mm以上の雨が降るのは月${Math.round(climate.rainDays)}日ほど、日照は月${Math.round(climate.sunshineHours)}時間です。`;
}

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
// 月名12本と年中行事ガイド。どちらもコードの中に一覧がある。
export function generateStaticParams() {
  return [
    ...EVENT_MONTH_NAMES.map((slug) => ({ slug })),
    ...allEventGuides().map(({ slug }) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const month = parseEventMonth(params.slug);
  if (month === null) {
    const guide = getEventGuide(params.slug);
    if (guide) return buildEventGuideMetadata(guide, londonDate(new Date()));
    return {
      title: "ロンドンイベントカレンダー | ジャスト・ロンドン",
      robots: { index: false, follow: true },
    };
  }

  const year = getDisplayYear(month);
  const guide = getMonthGuide(month);

  return buildPageMetadata({
    path: eventMonthPath(month),
    title: `${monthTitle(month)}｜天気・服装・イベントと祝日`,
    description: guide?.description ?? generatedDescription(month, year),
    keywords: [
      `ロンドン ${month}月`,
      `ロンドン ${month}月 服装`,
      `ロンドン ${month}月 天気`,
      `ロンドン ${month}月 気温`,
      `ロンドン ${month}月 イベント`,
    ],
    type: "article",
    // 写真のある月は写真だけの画像を共有画像にする(Discover の画像の条件)。
    // 無い月はサイトの既定の画像のまま。
    ...(guide?.photo
      ? { images: [monthPhotoImage(params.slug, guide.photo)] }
      : {}),
    // 本文を書くまでは平年値と去年の催しの表しか無いので、検索に出さない。
    // 理由と、sitemap・広告との連動は lib/london-months/written-months.js。
    noindex: !isWrittenMonth(month),
  });
}

export default async function MonthPage({
  params,
}: {
  params: { slug: string };
}) {
  const month = parseEventMonth(params.slug);
  if (month === null) {
    const guide = getEventGuide(params.slug);
    if (!guide) return notFound();
    return <EventGuideView guide={guide} today={londonDate(new Date())} />;
  }

  const year = getDisplayYear(month);
  const today = londonDate(new Date());
  const guide = getMonthGuide(month);
  const travelTips = travelTipsMonths.find((m) => m.month === month);

  const climate = getLondonClimate(month);
  const tokyoMonth = tokyoEquivalentMonth(month);
  const sunDays = getMonthSunDays(year, month);
  const clockChange = getClockChange(year, month);

  const [
    { events, fallback },
    { days, bankHolidaysAvailable },
    picks,
    briefs,
    fallbackIntro,
  ] = await Promise.all([
    fetchMonthEvents(year, month),
    getMonthDays(year, month),
    fetchWeeklyPicksForMonth(year, month, today),
    fetchBriefsForMonth(month),
    guide ? Promise.resolve(null) : fetchMonthIntroFallback(params.slug),
  ]);

  const hasWeekly =
    picks.exhibitions.length + picks.events.length + briefs.length > 0;

  const sections = [
    { id: "weather", navLabel: "天気" },
    { id: "wear", navLabel: "服装" },
    { id: "sun", navLabel: "日の出入り" },
    { id: "holidays", navLabel: "祝日" },
    ...(guide ? [{ id: "tips", navLabel: "旅のコツ" }] : []),
    { id: "events", navLabel: "イベント" },
    ...(hasWeekly ? [{ id: "weekly", navLabel: "展覧会・催し" }] : []),
  ];
  const n = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  const title = monthTitle(month);
  const path = eventMonthPath(month);
  const meta = getSeasonMeta(month);
  const Icon = meta.icon;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}${path}#article`,
    headline: `${title}｜天気・服装・イベントと祝日`,
    description: guide?.description ?? generatedDescription(month, year),
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${path}`,
    // ページ冒頭と同じ写真を、文字なしの 16:9・4:3・1:1 で渡す。
    ...(guide?.photo
      ? {
          image: OG_PHOTO_RATIOS.map((ratio) =>
            absoluteImage(monthPhotoImage(params.slug, guide.photo!, ratio).url)
          ),
        }
      : {}),
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };

  return (
    <div data-page-main className="mx-auto max-w-3xl sm:px-4 pt-4 pb-8 text-neutral-900 dark:text-neutral-100 sm:pb-10">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/events/calendar",
          current: title,
          currentHref: path,
        })}
      />
      <JsonLd data={articleJsonLd} />

      <Breadcrumbs path="/events/calendar" current={title} className="mb-6" />

      <header>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              meta.iconWrapClass
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              天気・服装・日の出入り・祝日・イベント
            </p>
          </div>
        </div>

        <p className="mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {year}年{month}月の日付で表示しています
        </p>

        {guide ? (
          <p className="mt-5 text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {guide.lead}
          </p>
        ) : (
          fallbackIntro && (
            <MarkdownBody className="mt-2 !text-base text-neutral-700 dark:text-neutral-300">
              {fallbackIntro}
            </MarkdownBody>
          )
        )}

        {guide?.photo && (
          <PagePhoto
            url={guide.photo.url}
            alt={guide.photo.alt}
            credit={guide.photo.credit}
            link={guide.photo.link}
            className="mt-6"
          />
        )}

        <div className="mt-6">
          <MonthGlance
            month={month}
            climate={climate}
            tokyoMonth={tokyoMonth}
            sunDays={sunDays}
            clockChange={clockChange}
            hoursBehind={hoursBehindJapan(year, month, 1)}
            bankHolidays={days.filter((d) => d.kind === "bank")}
          />
        </div>
      </header>

      <div className="mt-10">
        <GuideSectionNav sections={sections} />

        <MonthSection n={n("weather")} id="weather" title="天気と気温">
          <MonthClimate
            month={month}
            climate={climate}
            tokyoSameMonth={getTokyoClimate(month)}
            tokyoMonth={tokyoMonth}
            tokyoEquivalent={getTokyoClimate(tokyoMonth)}
          />
          <div className="mt-5 space-y-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {(guide?.weather ?? [generatedWeather(month)]).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </MonthSection>

        <MonthSection n={n("wear")} id="wear" title="服装">
          {guide ? (
            <>
              <p className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 text-sm font-medium leading-relaxed text-neutral-900 dark:bg-emerald-950/30 dark:text-neutral-100">
                {guide.wear.summary}
              </p>
              <dl className="mt-4 space-y-3">
                {guide.wear.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <dt className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
                <p className="text-xs font-bold tracking-wide text-neutral-600 dark:text-neutral-400">
                  日本から持っていくもの
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-neutral-700 marker:text-neutral-400 dark:text-neutral-300">
                  {guide.wear.pack.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            travelTips && (
              <p className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 text-sm font-medium leading-relaxed text-neutral-900 dark:bg-emerald-950/30 dark:text-neutral-100">
                {travelTips.wear}
              </p>
            )
          )}
          <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
            ほかの月との比べ方や、季節を問わない服装の基本は
            <Link
              href="/sightseeing/travel-tips#weather"
              className="mx-1 text-link underline underline-offset-2 dark:text-blue-400"
            >
              旅の実用情報
            </Link>
            にまとめています。
          </p>
        </MonthSection>

        <MonthSection n={n("sun")} id="sun" title="日の出・日の入りと時差">
          <MonthSun
            year={year}
            month={month}
            sunDays={sunDays}
            clockChange={clockChange}
          />
        </MonthSection>

        <MonthSection n={n("holidays")} id="holidays" title="祝日と、店・交通に影響する日">
          <MonthHolidays days={days} bankHolidaysAvailable={bankHolidaysAvailable} />
        </MonthSection>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {guide && (
          <MonthSection n={n("tips")} id="tips" title="旅の組み立て方">
            <ul className="space-y-3">
              {guide.tips.map((tip) => (
                <li
                  key={tip.title}
                  className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
                >
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {tip.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {tip.body}
                  </p>
                </li>
              ))}
            </ul>
          </MonthSection>
        )}

        <MonthSection n={n("events")} id="events" title={`${month}月のイベント`}>
          {events.length > 0 && (
            <>
              {fallback && (
                <p className="mb-4 text-sm text-neutral-700 dark:text-neutral-300">
                  前の月から{year}年{month}月に続いているもの:
                </p>
              )}
              <EventGrid events={events} iconWrapClass={meta.iconWrapClass} />
            </>
          )}
          {fallback && (
            <div className={events.length > 0 ? "mt-8" : undefined}>
              <p className="mb-4 rounded-lg border border-amber-600/30 bg-amber-600/5 p-3.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {year}年{month}月に始まる行事の日程は、まだ登録していません。下は
                {fallback.year}
                年の日程です。定番の行事は毎年ほぼ同じ時期に開かれますが、日付は公式サイトで確かめてください。
              </p>
              <EventGrid
                events={fallback.events}
                iconWrapClass={meta.iconWrapClass}
              />
            </div>
          )}
          {events.length === 0 && !fallback && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              この月のイベントはまだ登録していません。
            </p>
          )}
        </MonthSection>

        {hasWeekly && (
          <MonthSection n={n("weekly")} id="weekly" title="週次ダイジェストで紹介した展覧会・催し">
            <MonthWeeklyPicks
              month={month}
              exhibitions={picks.exhibitions}
              events={picks.events}
              briefs={briefs}
            />
          </MonthSection>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          あわせて読む
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ...(guide?.links ?? []),
            { href: "/events", label: "今週のロンドン(週次ダイジェスト)" },
            { href: "/events/calendar", label: "年間イベントカレンダー" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-900 transition hover:border-emerald-400 dark:border-neutral-700 dark:text-neutral-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MonthNav month={month} />

      <section className="mt-12 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          参考・公式情報
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {SOURCES.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          気温・雨・日照は1991〜2020年の平年値で、その年の天気ではありません。日の出・日の入りは天文計算による目安です。イベントの日程や施設の営業は変わることがあるため、出かける前に各公式サイトで確かめてください。
        </p>
      </section>
    </div>
  );
}
