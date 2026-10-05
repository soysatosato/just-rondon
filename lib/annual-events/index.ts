import type { EventGuide, GuideEdition } from "./types";
import { newYearsEveFireworks } from "./content/new-years-eve-fireworks";
import { bonfireNight } from "./content/bonfire-night";
import { newYearsDayParade } from "./content/new-years-day-parade";

export type {
  EventGuide,
  GuideEdition,
  GuideItem,
  GuidePlace,
  GuideSource,
  GlanceItem,
} from "./types";

/**
 * 書き上げた年中行事ガイド。URL は /events/<slug>。
 *
 * ★ 足したら next-sitemap.config.js の staticPages にも足すこと
 *   (設定ファイルは CJS なので、この TS を読めない)。
 */
const GUIDES: readonly EventGuide[] = [
  bonfireNight,
  newYearsEveFireworks,
  newYearsDayParade,
];

const BY_SLUG = new Map(GUIDES.map((g) => [g.slug, g]));

/**
 * 観光スポットのページとして先に書いてあった行事。一覧(/events/guides)にだけ並べる。
 *
 * 中身はガイドと同じ「行くための実務」だが、検索の順位が付いているので
 * URL を動かさない(チェルシーは「チェルシーフラワーショー 2027」で3位)。
 */
export const SPOT_GUIDES: readonly {
  title: string;
  href: string;
  month: number;
  usualTiming: string;
  summary: string;
}[] = [
  {
    title: "チェルシー・フラワーショー",
    href: "/sightseeing/rhs-chelsea-flower-show",
    month: 5,
    usualTiming: "毎年5月下旬の5日間",
    summary:
      "英国王立園芸協会の庭園の祭典。最初の2日は会員限定で、チケットは前売り制。",
  },
  {
    title: "ハイド・パークのウィンター・ワンダーランド",
    href: "/sightseeing/hyde-park-winter-wonderland",
    month: 11,
    usualTiming: "11月下旬〜1月上旬",
    summary:
      "ハイド・パークに毎冬立つ、移動遊園地とクリスマスマーケット。",
  },
];

export function getEventGuide(slug: string): EventGuide | null {
  return BY_SLUG.get(slug) ?? null;
}

export function allEventGuides(): readonly EventGuide[] {
  return GUIDES;
}

/**
 * 年間カレンダー(Event テーブル)の行に対応するガイド。無ければ null。
 * 行の題は「英語名（日本語名）」なので、英語名の前方一致で結ぶ。
 */
export function guideForEventTitle(title: string): EventGuide | null {
  return (
    GUIDES.find((g) => g.calendarTitles.some((t) => title.startsWith(t))) ??
    null
  );
}

export function eventGuidePath(guide: Pick<EventGuide, "slug">): string {
  return `/events/${guide.slug}`;
}

/** その年の開催の、最後の日("YYYY-MM-DD")。 */
function lastDay(edition: GuideEdition): string {
  return edition.dates
    .map((d) => d.endDate ?? d.date)
    .reduce((a, b) => (a > b ? a : b));
}

/**
 * ページに出す年。
 *
 * まだ終わっていない開催のうちいちばん早いもの(upcoming)。どれも
 * 終わっていれば最後の開催を出し、次回が未発表であることを添える。
 * 毎年 editions に翌年分を足せば、ページは勝手に次の年へ移る。
 *
 * @param today ロンドンの日付("YYYY-MM-DD")
 */
export function pickEdition(
  guide: EventGuide,
  today: string
): { edition: GuideEdition; upcoming: boolean } {
  const next = guide.editions.find((e) => lastDay(e) >= today);
  if (next) return { edition: next, upcoming: true };
  return { edition: guide.editions[guide.editions.length - 1], upcoming: false };
}

const WEEKDAYS = "日月火水木金土";

/** "2026-12-31" → "12月31日(木)"。withYear なら年も付ける。 */
export function formatGuideDate(ymd: string, withYear = false): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${withYear ? `${y}年` : ""}${m}月${d}日(${weekday})`;
}

/** 日程1行の日付部分。「11月7日(土)〜8日(日)」。 */
export function formatGuideDateRange(date: string, endDate?: string): string {
  if (!endDate || endDate === date) return formatGuideDate(date);
  const [, m1] = date.split("-").map(Number);
  const [, m2] = endDate.split("-").map(Number);
  const end = formatGuideDate(endDate);
  return `${formatGuideDate(date)}〜${m1 === m2 ? end.replace(`${m2}月`, "") : end}`;
}

/**
 * 今日から見て次に来る順。一覧の並びに使う。
 * 今月の行事が先頭に来て、過ぎた月の行事は後ろへ回る。
 */
export function monthsFromNow(month: number, todayMonth: number): number {
  return (month - todayMonth + 12) % 12;
}

// 月名(/events/<月>)と slug がぶつかると、月ページが読めなくなる。
const MONTH_SLUGS = new Set([
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
]);
for (const g of GUIDES) {
  if (MONTH_SLUGS.has(g.slug)) {
    throw new Error(`年中行事ガイドの slug が月名と重なっています: ${g.slug}`);
  }
}
