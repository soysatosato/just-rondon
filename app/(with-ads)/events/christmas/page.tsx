import type { Metadata } from "next";
import Link from "next/link";
import { CalendarHeart, Footprints, Sparkles, Store, Sunset } from "lucide-react";

import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import { hubOgImage } from "@/lib/og-hubs";
import {
  SEASON_CHECKED,
  addDays,
  formatDay,
  formatFullDate,
  formatRange,
  resolveItems,
  seasonAxis,
  seasonPulse,
  seasonYear,
  statusOn,
  thisWeek,
  type ResolvedItem,
  type SeasonSource,
} from "@/lib/christmas";
import { closedOn, venueClosures } from "@/lib/christmas/closures";
import { SPECIAL_DAYS, type SpecialDay } from "@/lib/christmas/days";
import {
  LIGHTS_ROUTES,
  routeDistanceKm,
  routeWalkMinutes,
} from "@/lib/christmas/routes";
import { getMonthDays } from "@/lib/london-months/holidays";
import { getDusk } from "@/lib/london-months/sun";
import { getEventGuide, pickEdition } from "@/lib/annual-events";
import { SIGHTSEEING_PUBLISHER } from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import ChristmasHero from "@/components/christmas/ChristmasHero";
import ChristmasSeriesNav from "@/components/christmas/ChristmasSeriesNav";
import XmasSection from "@/components/christmas/XmasSection";
import StayPlanner from "@/components/christmas/StayPlanner";
import BookingList, { type BookingRow } from "@/components/christmas/BookingList";
import SeasonCalendar from "@/components/christmas/SeasonCalendar";
import AdventDays, { type AdventTile } from "@/components/christmas/AdventDays";
import RinkTable from "@/components/christmas/RinkTable";
import FreeList from "@/components/christmas/FreeList";
import StatusChip from "@/components/christmas/StatusChip";

/**
 * ロンドンのクリスマス特集のハブ(/events/christmas)。
 *
 * 企画の芯は「ロンドンのクリスマスは、どこへ行くかより、いつ行くかで決まる」。
 * 灯りは11月上旬から順に点き、マーケットは12月下旬に終わる所も1月上旬まで
 * 続く所もあり、24〜26日は街がほぼ止まる。日本からの旅行は年末年始の休みに
 * 重なりやすく、読者の問いは「自分の日程で、何がまだ残っているか」になる
 * (2025年秋の検索では「いつまで」が「いつから」の7倍あった)。なので
 * ページの中心は、滞在日を入れると開いているものが出る道具(StayPlanner)にした。
 *
 * 会期は lib/christmas が持つ。主催者の公式発表を確かめたものだけで、
 * 予想の日程は入れない。見出しと本文には年を入れず、年が出るのは会期の欄だけ。
 * どのシーズンを出すかは今日の日付で決まる(1月は前の年のシーズン)。
 *
 * 1時間ごとに作り直す。「今日」の線と状態の札が日付で変わるため。
 */
export const revalidate = 60 * 60;

const PATH = "/events/christmas";
const TITLE = "ロンドンのクリスマス";

export async function generateMetadata(): Promise<Metadata> {
  const year = seasonYear(londonDate(new Date()));
  return buildPageMetadata({
    path: PATH,
    title: `ロンドンのクリスマス${year}｜イルミネーション点灯日・マーケット・12月25日の過ごし方`,
    description:
      "ロンドンのクリスマスを日付で引ける特集。灯りの点灯日、マーケットとリンクの会期、予約が要る催し、12月24日〜1月1日の交通と休館を、公式発表を確かめてまとめました。滞在日を入れると、開いている所が分かります。",
    keywords: [
      "ロンドン クリスマス",
      `ロンドン クリスマス ${year}`,
      "ロンドン イルミネーション",
      "ロンドン 12月25日",
      "ロンドン 年末年始",
      "ロンドン クリスマスマーケット いつまで",
      "ロンドン スケートリンク",
    ],
    images: [hubOgImage("christmas")],
    type: "article",
  });
}

/** 12月24日〜1月1日の日めくり。ふつうの日はまとめて1枚にする。 */
function buildAdventTiles(
  year: number,
  items: ResolvedItem[],
  bankHolidays: { date: string; title: string; substitute: boolean }[],
): AdventTile[] {
  const tiles: AdventTile[] = [];
  let plain: string[] = [];

  const flushPlain = () => {
    if (plain.length === 0) return;
    const first = plain[0];
    const last = plain[plain.length - 1];
    const [, , d1] = first.split("-").map(Number);
    const [, , d2] = last.split("-").map(Number);
    tiles.push({
      key: first,
      dayLabel: plain.length === 1 ? String(d1) : `${d1}〜${d2}`,
      dateLabel:
        plain.length === 1 ? formatDay(first) : `${formatDay(first)}〜${formatDay(last)}`,
      tone: "plain",
      headline: "ふだんどおりに近い",
      transport: [],
      life: [{ text: "美術館・博物館は開き、交通もほぼ平日どおり。年末なので、休みや短縮営業の店はある。" }],
      closed: [],
      happenings: [],
      links: [],
    });
    plain = [];
  };

  for (let i = 0; i <= 8; i++) {
    const date = addDays(`${year}-12-24`, i);
    const special: SpecialDay | undefined = SPECIAL_DAYS.find(
      (d) => d.monthDay === date.slice(5),
    );
    const bank = bankHolidays.find((b) => b.date === date);
    // 改修などの長期休館は毎日同じ館が並ぶだけなので、札には出さない。
    const closed = closedOn(date, { longTerm: false }).map((c) => c.name);
    const isSunday = new Date(`${date}T12:00:00Z`).getUTCDay() === 0;
    const happenings = items
      .filter(
        (item) =>
          item.kind === "event" &&
          item.edition?.start &&
          item.edition.end &&
          item.edition.start <= date &&
          item.edition.end >= date &&
          item.edition.start >= addDays(item.edition.end, -2),
      )
      .map((item) => `${item.title}${item.edition?.hours ? `(${item.edition.hours})` : ""}`);

    if (special) {
      flushPlain();
      tiles.push({
        key: date,
        dayLabel: String(Number(date.slice(8))),
        dateLabel: formatDay(date),
        name: special.name,
        tone: special.tone,
        headline: special.headline,
        transport: special.transport,
        life: special.life,
        closed,
        happenings,
        links: special.links ?? [],
      });
    } else if (bank?.substitute) {
      flushPlain();
      tiles.push({
        key: date,
        dayLabel: String(Number(date.slice(8))),
        dateLabel: formatDay(date),
        name: "振替休日",
        tone: "warn",
        headline: `${bank.title}の振替休日`,
        transport: [
          { text: "連休の鉄道工事で、運休・バス代行になる区間がある。乗る前に National Rail で確かめる。" },
        ],
        life: [{ text: "銀行と役所は休み。店は日曜並みの短縮営業が多い。" }],
        closed,
        happenings,
        links: [],
      });
    } else if (closed.length > 0 || isSunday) {
      flushPlain();
      tiles.push({
        key: date,
        dayLabel: String(Number(date.slice(8))),
        dateLabel: formatDay(date),
        tone: "plain",
        headline: isSunday ? "日曜の営業時間" : "ふだんどおりに近い",
        transport: [],
        life: isSunday
          ? [{ text: "大型店は日曜の決まりで、10:00〜18:00のうち6時間だけ開く。" }]
          : [],
        closed,
        happenings,
        links: [],
      });
    } else {
      plain.push(date);
    }
  }
  flushPlain();
  return tiles;
}

/** 予約が要るもの。年越し花火を先頭に、あとは始まる順。 */
function buildBookingRows(items: ResolvedItem[], year: number, today: string): BookingRow[] {
  const rows: BookingRow[] = [];

  const nye = getEventGuide("new-years-eve-fireworks");
  if (nye) {
    const { edition } = pickEdition(nye, today);
    const sale = edition.glance?.find((g) => g.label === "発売");
    const price = edition.glance?.find((g) => g.label === "値段");
    rows.push({
      key: "nye",
      title: "年越し花火",
      when: `${formatDay(edition.dates[0].date)} 24:00`,
      status: sale
        ? `発売: ${sale.value}${sale.sub ? `(${sale.sub})` : ""}`
        : "チケット制",
      price: price ? `${price.value}${price.sub ? `(${price.sub})` : ""}` : undefined,
      href: "/events/new-years-eve-fireworks",
      url: "https://www.ticketmaster.co.uk/london-nye",
    });
  }

  // 舞台は演目が多いので、ここでは1行にまとめて舞台のページへ送る。
  const booked = items
    .filter(
      (item) =>
        item.kind !== "show" &&
        item.edition?.booking &&
        statusOn(item.edition, today, item.kind) !== "after",
    )
    .sort((a, b) => (a.edition?.start ?? "").localeCompare(b.edition?.start ?? ""));
  for (const item of booked) {
    const edition = item.edition!;
    const booking = edition.booking!;
    rows.push({
      key: item.slug,
      title: item.title,
      when: formatRange(edition),
      status: booking.status,
      price: edition.price,
      href: item.href,
      url: booking.url,
    });
  }

  const shows = items.filter((i) => i.kind === "show" && i.edition?.start);
  if (shows.length > 0) {
    const first = shows.map((i) => i.edition!.start!).sort()[0];
    const last = shows.map((i) => i.edition!.end ?? i.edition!.start!).sort().reverse()[0];
    rows.push({
      key: "shows",
      title: "クリスマスの舞台(パント・バレエ・芝居)",
      when: `${formatDay(first)}〜${formatDay(last)}`,
      status: `${shows.length}演目、どれも劇場の公式サイトで発売中`,
      href: "/musicals/christmas-shows",
    });
  }

  rows.push({
    key: "christmas-lunch",
    title: "12月25日の食事",
    when: formatDay(`${year}-12-25`),
    status: "営業する店は特別コースの予約制が多い。決まったら早めに予約を",
    href: "/sightseeing/travel-tips#calendar",
  });

  return rows;
}

/** 各項目と休館日の出典を、重ならないように集める。 */
function collectSources(items: ResolvedItem[]): SeasonSource[] {
  const seen = new Map<string, SeasonSource>();
  for (const item of items) {
    for (const source of item.edition?.sources ?? []) seen.set(source.url, source);
  }
  for (const closure of venueClosures) seen.set(closure.source.url, closure.source);
  for (const day of SPECIAL_DAYS) {
    for (const note of [...day.transport, ...day.life]) {
      if (note.source) seen.set(note.source.url, note.source);
    }
  }
  return [...seen.values()];
}

function Chip({
  icon: Icon,
  children,
}: {
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white ring-1 ring-white/20 backdrop-blur-sm">
      <Icon className="h-4 w-4 text-amber-300" aria-hidden="true" />
      {children}
    </li>
  );
}

export default async function ChristmasPage() {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const items = resolveItems(year);
  const axis = seasonAxis(items, year);
  const pulse = seasonPulse(items, today, year);
  const week = thisWeek(items, today);

  const [{ days: december }, { days: january }] = await Promise.all([
    getMonthDays(year, 12),
    getMonthDays(year + 1, 1),
  ]);
  const bankHolidays = [...december, ...january]
    .filter((d) => d.kind === "bank")
    .map((d) => ({ date: d.date, title: d.title, substitute: !!d.substitute }));

  const [ty, tm, td] = today.split("-").map(Number);
  const dusk = getDusk(ty, tm, td);

  const lights = items.filter((i) => i.kind === "lights");
  const markets = items.filter((i) => i.kind === "market");
  const rinks = items.filter((i) => i.kind === "rink");
  const free = items.filter((i) => i.free);
  const nextLight = lights
    .filter((i) => i.edition?.start && i.edition.start > today)
    .sort((a, b) => a.edition!.start!.localeCompare(b.edition!.start!))[0];

  const tiles = buildAdventTiles(year, items, bankHolidays);
  const bookings = buildBookingRows(items, year, today);
  const sources = collectSources(items);

  const sections = [
    { id: "stay", navLabel: "日程で調べる" },
    { id: "booking", navLabel: "予約が要るもの" },
    { id: "calendar", navLabel: "シーズンの暦" },
    { id: "days", navLabel: "12/24〜1/1" },
    { id: "walk", navLabel: "夜の歩き方" },
    { id: "rinks", navLabel: "スケートリンク" },
    { id: "markets", navLabel: "マーケット" },
    { id: "shows", navLabel: "舞台" },
    { id: "free", navLabel: "無料で楽しむ" },
    { id: "read", navLabel: "読みもの" },
    { id: "basis", navLabel: "基準と出典" },
  ];
  const n = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}${PATH}#article`,
    headline: `ロンドンのクリスマス${year}`,
    description:
      "ロンドンのクリスマスの灯り・マーケット・スケートリンク・催しの会期と、12月24日〜1月1日の交通と休館。",
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${PATH}`,
    dateModified: `${SEASON_CHECKED}T12:00:00Z`,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };

  return (
    <div
      data-page-main
      className="mx-auto max-w-4xl pb-10 pt-4 text-neutral-900 dark:text-neutral-100 sm:px-4"
    >
      <JsonLd data={breadcrumbListJsonLd({ path: PATH })} />
      <JsonLd data={articleJsonLd} />

      <Breadcrumbs path={PATH} className="mb-5" />

      <ChristmasHero
        eyebrow={`CHRISTMAS IN LONDON ${year}`}
        title={TITLE}
        lead={
          <p>
            ロンドンのクリスマスは、どこへ行くかより、いつ行くかで決まります。灯りは11月上旬から順に点き、マーケットは12月下旬に終わる所も1月上旬まで続く所もあり、24〜26日は街がほぼ止まります。滞在日を入れると、その日程で何が見られるかが分かります。
          </p>
        }
      >
        <ul className="mt-6 flex flex-wrap gap-2">
          {pulse.daysToChristmas !== null && (
            <Chip icon={CalendarHeart}>
              {pulse.daysToChristmas === 0 ? (
                "今日はクリスマス"
              ) : (
                <>
                  クリスマスまで あと
                  <span className="text-lg font-bold tabular-nums text-amber-300">
                    {pulse.daysToChristmas}
                  </span>
                  日
                </>
              )}
            </Chip>
          )}
          {pulse.lit > 0 ? (
            <Chip icon={Sparkles}>
              点灯している灯り {pulse.lit}/{pulse.lights}
            </Chip>
          ) : (
            nextLight?.edition?.start && (
              <Chip icon={Sparkles}>
                最初の点灯は{formatDay(nextLight.edition.start)}・{nextLight.shortTitle}
              </Chip>
            )
          )}
          {pulse.phase === "during" && (
            <Chip icon={Store}>今日開いているマーケット・リンク・催し {pulse.openToday}か所</Chip>
          )}
          {pulse.phase === "after" && (
            <Chip icon={Store}>{year}年のシーズンは終わりました</Chip>
          )}
          <Chip icon={Sunset}>
            今日の日の入り {dusk.sunset}・暗くなるのは{dusk.civilDusk}ごろ
          </Chip>
        </ul>
      </ChristmasHero>

      <ChristmasSeriesNav current="hub" className="mt-4" />

      <div className="mt-10">
        <GuideSectionNav sections={sections} />

        <XmasSection
          n={n("stay")}
          id="stay"
          title="滞在日を入れて調べる"
          lead="着く日と発つ日を入れると、その日程で開いている灯り・マーケット・リンク・催しと、休む館、交通が止まる日が出ます。会期は公式発表を確かめたものだけで判定し、発表の無いものは「未発表」と出ます。"
        >
          <StayPlanner
            payload={{
              year,
              items,
              closures: venueClosures,
              specialDays: SPECIAL_DAYS,
              bankHolidays,
            }}
          />
        </XmasSection>

        <XmasSection
          n={n("booking")}
          id="booking"
          title="いま予約が要るもの"
          lead="日時指定の券や抽選が要るものです。夜と週末の枠、12月の枠から先に埋まります。発売日と予約先は公式の案内のとおりに書いています。"
        >
          <BookingList rows={bookings} />
        </XmasSection>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        <XmasSection
          n={n("calendar")}
          id="calendar"
          title="シーズンの暦"
          lead="灯り・マーケット・スケートリンク・催しの会期を並べました。棒が重なっているところが、いちばん多くのものが見られる時期です。"
        >
          <SeasonCalendar items={items} axis={axis} today={today} year={year} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["この1週間にはじまる", week.starting, "start"],
                ["この1週間におわる", week.ending, "end"],
              ] as const
            ).map(([label, rows, key]) => (
              <div
                key={key}
                className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold">
                  {label}
                  <span className="ml-1 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    ({formatDay(today)}〜{formatDay(week.weekEnd)})
                  </span>
                </p>
                {rows.length === 0 ? (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">ありません。</p>
                ) : (
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {rows.map((item) => (
                      <li key={item.slug} className="flex items-baseline justify-between gap-3">
                        <Link href={item.href} className="text-link underline-offset-2 hover:underline">
                          {item.title}
                        </Link>
                        <span className="shrink-0 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
                          {formatDay(key === "start" ? item.edition!.start! : item.edition!.end!)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </XmasSection>

        <XmasSection
          n={n("days")}
          id="days"
          title={`12月24日〜1月1日`}
          lead="1年でいちばん予定が崩れやすい9日間です。25日は地下鉄もバスも鉄道も止まり、24〜26日は主な美術館・博物館が休みます。見たい館は23日までか27日以降に入れてください。"
        >
          <AdventDays tiles={tiles} />
          <p className="mt-3 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            交通は TfL と National Rail の案内から書いています。{year}年の年末年始の運行は例年11月下旬に発表されるので、それまでは前の年の案内をもとにした「例年」の書き方です。休館は、毎年同じ決まりとして公式サイトに書かれている館だけを載せています。
          </p>
        </XmasSection>

        <XmasSection
          n={n("walk")}
          id="walk"
          title="夜の歩き方"
          lead={
            <>
              12月の日の入りは16時前です。灯りは日の入りから空が暗くなるまでの40分ほどが、空の青さと一緒に写っていちばん映えます。順路の地図と見どころは
              <Link href="/sightseeing/christmas-lights" className="mx-1 text-link underline underline-offset-2">
                イルミネーションのページ
              </Link>
              にあります。
            </>
          }
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {LIGHTS_ROUTES.map((route) => (
              <li key={route.slug}>
                <Link
                  href={`/sightseeing/christmas-lights#${route.slug}`}
                  className="group flex h-full flex-col rounded-2xl bg-[#0b1d33] p-5 text-white ring-1 ring-black/10 transition hover:ring-amber-300"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Footprints className="h-4 w-4" aria-hidden="true" />
                    約{routeDistanceKm(route)}km・歩くだけなら{routeWalkMinutes(route)}分
                  </span>
                  <span className="mt-2 text-lg font-bold group-hover:underline">{route.title}</span>
                  <span className="mt-1.5 text-sm leading-relaxed text-white/80">{route.lead}</span>
                  <span className="mt-3 text-xs text-white/70">
                    {route.stops.map((s) => s.name).join(" → ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-base font-bold">通りの点灯日</h3>
          <ul className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
            {lights.map((item) => (
              <li key={item.slug} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <Link href={item.href} className="min-w-0 truncate underline-offset-2 hover:underline">
                  {item.shortTitle}
                </Link>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
                    {item.edition?.start ? formatDay(item.edition.start) : item.usualTiming}
                  </span>
                  <StatusChip status={statusOn(item.edition, today, item.kind)} kind={item.kind} />
                </span>
              </li>
            ))}
          </ul>
        </XmasSection>

        <XmasSection
          n={n("rinks")}
          id="rinks"
          title="スケートリンク"
          lead="冬だけ出る屋外のリンクです。滑るにはどこも日時指定の券が要り、夜と週末の枠から先に埋まります。ハイド・パークのウィンター・ワンダーランドの会場の中にもリンクがあります。"
        >
          <RinkTable rinks={rinks} />
        </XmasSection>

        <XmasSection
          n={n("markets")}
          id="markets"
          title="マーケット"
          lead={
            <>
              木の小屋の屋台が並ぶ形のマーケットです。屋台を出さないコヴェント・ガーデンとトラファルガー広場は「灯り」に、リンクが主役のレスター・スクエアとバタシーは「スケートリンク」に入れています。性格の違いと行き方は
              <Link href="/sightseeing/christmas-markets" className="mx-1 text-link underline underline-offset-2">
                マーケット比較のページ
              </Link>
              にまとめています。
            </>
          }
        >
          <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
            {markets.map((item) => (
              <li key={item.slug} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={item.href} className="min-w-0 text-sm font-semibold underline-offset-2 hover:underline">
                    {item.title}
                  </Link>
                  <StatusChip status={statusOn(item.edition, today, item.kind)} kind={item.kind} />
                </div>
                <p className="mt-0.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
                  {item.edition ? formatRange(item.edition) : `未発表(${item.usualTiming})`}・{item.station}
                </p>
              </li>
            ))}
          </ul>
        </XmasSection>

        <XmasSection
          n={n("shows")}
          id="shows"
          title="クリスマスの舞台"
          lead={
            <>
              ロンドンの冬は、劇場がいちばん賑わう季節です。日本でいう無言劇のパントマイムとは別物の「パント」、『くるみ割り人形』、『クリスマス・キャロル』。選び方と観方は
              <Link href="/musicals/christmas-shows" className="mx-1 text-link underline underline-offset-2">
                クリスマスの舞台のページ
              </Link>
              にまとめています。
            </>
          }
        >
          <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
            {items
              .filter((item) => item.kind === "show")
              .map((item) => (
                <li key={item.slug} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={item.href} className="min-w-0 text-sm font-semibold underline-offset-2 hover:underline">
                      {item.title}
                    </Link>
                    <StatusChip status={statusOn(item.edition, today, item.kind)} kind={item.kind} />
                  </div>
                  <p className="mt-0.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
                    {item.edition ? formatRange(item.edition) : `未発表(${item.usualTiming})`}・{item.station}
                  </p>
                </li>
              ))}
          </ul>
        </XmasSection>

        <XmasSection
          n={n("free")}
          id="free"
          title="無料で楽しむ"
          lead="灯りを見て歩くのも、屋台の並ぶマーケットに入るのも無料です(飲食と遊具は別)。ポンドが高い時期でも、夜の街を歩くだけでクリスマスのロンドンは十分に楽しめます。"
        >
          <FreeList items={free} />
        </XmasSection>

        <XmasSection n={n("read")} id="read" title="クリスマスの読みもの">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              {
                href: "/column/the-first-christmas-card-in-1843-was-a-flop-henry-cole-a-toasting-child-and-the-temperance-critics",
                label: "コラム",
                title: "1843年、世界初のクリスマスカードは売れなかった",
              },
              {
                href: "/column/the-founder-of-harrods-was-convicted-over-stolen-currants-in-1836-the-london-department-store-story-part-1",
                label: "コラム",
                title: "ハロッズの創業者と、ロンドンの百貨店の始まり",
              },
              {
                href: "/british-english/pudding",
                label: "イギリス英語",
                title: "「Pudding?」はプリンのことではない",
              },
              {
                href: "/events/december",
                label: "月のガイド",
                title: "12月のロンドン(天気・服装・祝日)",
              },
              {
                href: "/events/new-years-eve-fireworks",
                label: "年中行事ガイド",
                title: "ロンドンの年越し花火",
              },
              {
                href: "/events/new-years-day-parade",
                label: "年中行事ガイド",
                title: "元日のロンドン・パレード",
              },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex h-full flex-col rounded-xl border border-neutral-200 p-4 transition hover:border-red-300 dark:border-neutral-700 dark:hover:border-red-800"
                >
                  <span className="text-xs font-semibold text-red-800 dark:text-red-300">{link.label}</span>
                  <span className="mt-1 text-sm font-bold leading-snug">{link.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </XmasSection>

        <XmasSection n={n("basis")} id="basis" title="基準と出典">
          <div className="space-y-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>
              会期・時間・料金・発売日は、主催者の公式発表を確かめたものだけを載せています。予想の日程は入れず、発表の無いものは「未発表」と書いて、例年の時期を添えています。
            </p>
            <p>
              交通は TfL と National Rail の案内、休館は各館の公式サイト、祝日と振替休日は gov.uk のデータからです。灯りの「暗くなる時刻」は、太陽が地平線の6°下に沈む時刻(市民薄明の終わり)の計算値です。
            </p>
            <p className="font-semibold">最終確認: {formatFullDate(SEASON_CHECKED)}</p>
          </div>
          <details className="mt-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
            <summary className="cursor-pointer text-sm font-semibold">出典の一覧({sources.length}件)</summary>
            <ul className="mt-3 space-y-1.5 text-sm">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link underline underline-offset-2"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </XmasSection>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-12" />
    </div>
  );
}
