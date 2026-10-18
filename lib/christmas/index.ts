import { christmasHappenings } from "./happenings";
import { christmasLights } from "./lights";
import { marketSeasonItems } from "./markets";
import { christmasRinks } from "./rinks";
import { venueClosures } from "./closures";
import { KIND_ORDER } from "./kinds";
import {
  addDays,
  christmasDayOf,
  daysBetween,
  editionFor,
  formatRange,
  previousEdition,
  statusOn,
} from "./season";
import type {
  SeasonEdition,
  SeasonItem,
  SeasonKind,
  SeasonPlace,
  VenueClosure,
} from "./types";

export type {
  SeasonEdition,
  SeasonItem,
  SeasonKind,
  SeasonPlace,
  SeasonSource,
  VenueClosure,
} from "./types";
export * from "./season";

/**
 * 特集全体を最後に見直した日。全項目の公式サイトを見直したら直す。
 * ページの「基準と出典」に出す。
 */
export const SEASON_CHECKED = "2026-10-18";

export { KIND_LABELS, KIND_ORDER } from "./kinds";

/** 特集に載せる全件。灯り → マーケット → リンク → 催しの順。 */
export function allSeasonItems(): SeasonItem[] {
  const items = [
    ...christmasLights,
    ...marketSeasonItems(),
    ...christmasRinks,
    ...christmasHappenings,
  ];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) {
      throw new Error(`クリスマス特集の slug が重複しています: ${item.slug}`);
    }
    seen.add(item.slug);
  }
  return items;
}

/**
 * そのシーズンの版を解決した1件。クライアントの部品にそのまま渡せるよう、
 * 関数を含まない素のオブジェクトにしてある。
 */
export type ResolvedItem = Omit<SeasonItem, "editions"> & {
  edition: SeasonEdition | null;
  previous: SeasonEdition | null;
};

/** 種類の順、その中は始まる日の順(未発表は後ろ)。 */
export function resolveItems(year: number): ResolvedItem[] {
  const rank = (kind: SeasonKind) => KIND_ORDER.indexOf(kind);
  return allSeasonItems()
    .map(({ editions, ...rest }) => ({
      ...rest,
      edition: editionFor(editions, year),
      previous: previousEdition(editions, year),
    }))
    .sort((a, b) => {
      if (a.kind !== b.kind) return rank(a.kind) - rank(b.kind);
      const sa = a.edition?.start ?? "9999";
      const sb = b.edition?.start ?? "9999";
      return sa.localeCompare(sb);
    });
}

/* ============================================================
 * 暦の横軸と、いまの状態
 * ========================================================== */

export type SeasonAxis = { start: string; end: string; days: number };

/**
 * 暦の横軸。11月1日〜1月10日を基本に、それより早く始まる・遅く終わる
 * 会期があれば広げる。
 */
export function seasonAxis(items: ResolvedItem[], year: number): SeasonAxis {
  const starts = items.flatMap((i) => (i.edition?.start ? [i.edition.start] : []));
  const ends = items.flatMap((i) => (i.edition?.end ? [i.edition.end] : []));
  const start = [`${year}-11-01`, ...starts].sort()[0];
  const end = [`${year + 1}-01-10`, ...ends].sort()[ends.length];
  return { start, end, days: daysBetween(start, end) + 1 };
}

/** 軸の上の位置(0〜100%)。 */
export function axisPercent(axis: SeasonAxis, date: string): number {
  const offset = daysBetween(axis.start, date);
  return Math.min(100, Math.max(0, (offset / axis.days) * 100));
}

export type SeasonPulse = {
  phase: "before" | "during" | "after";
  /** 点灯している灯り / 灯りの件数。 */
  lit: number;
  lights: number;
  /** 今日開いている(灯り以外)。 */
  openToday: number;
  /** 次に始まるもの。 */
  next: ResolvedItem | null;
  /** 12月25日まで何日か。過ぎていれば null。 */
  daysToChristmas: number | null;
};

/**
 * 見出しの帯に出す「いま」の状態。
 *
 * シーズンの始まりは最初の開幕日、終わりは最後の閉幕日。終わりの日が
 * 未発表の灯りは数えない(灯りは例年1月上旬に外されるが、日付は出ない)。
 */
export function seasonPulse(items: ResolvedItem[], today: string, year: number): SeasonPulse {
  const starts = items.flatMap((i) => (i.edition?.start ? [i.edition.start] : [])).sort();
  const ends = items.flatMap((i) => (i.edition?.end ? [i.edition.end] : [])).sort();
  const first = starts[0];
  const last = ends[ends.length - 1];

  const phase =
    !first || today < first ? "before" : last && today > last ? "after" : "during";

  const lights = items.filter((i) => i.kind === "lights");
  const lit = lights.filter((i) => statusOn(i.edition, today, i.kind) === "open").length;
  const openToday = items.filter(
    (i) => i.kind !== "lights" && statusOn(i.edition, today, i.kind) === "open",
  ).length;

  const next =
    items
      .filter((i) => i.edition?.start && i.edition.start > today)
      .sort((a, b) => a.edition!.start!.localeCompare(b.edition!.start!))[0] ?? null;

  const christmas = christmasDayOf(year);
  const daysToChristmas = today <= christmas ? daysBetween(today, christmas) : null;

  return { phase, lit, lights: lights.length, openToday, next, daysToChristmas };
}

/** 今日から7日のうちに始まる・終わるもの。 */
export function thisWeek(items: ResolvedItem[], today: string) {
  const weekEnd = addDays(today, 6);
  const within = (date?: string) => !!date && date >= today && date <= weekEnd;
  return {
    starting: items.filter((i) => within(i.edition?.start)),
    ending: items.filter((i) => within(i.edition?.end)),
    weekEnd,
  };
}

/* ============================================================
 * 観光スポット・美術館のページに出す季節の帯
 * ========================================================== */

export type BandEntry = {
  title: string;
  /** 「11月11日(水)〜1月10日(日)」 */
  when: string;
  /** 料金や25日の休みなど、短い補足。 */
  note?: string;
  relation: SeasonPlace["relation"];
  href: string;
};

export type BandClosure = { name: string; days: string; notes: string[] };

export type SeasonBand = {
  year: number;
  entries: BandEntry[];
  closures: BandClosure[];
};

const matches = (place: SeasonPlace, target: { spot?: string; museum?: string }) =>
  (!!target.spot && place.spot === target.spot) ||
  (!!target.museum && place.museum === target.museum);

/** "12-24","12-25","12-26" → "12月24〜26日"。 */
function formatClosedDays(days: string[]): string {
  const sorted = [...days].sort((a, b) => {
    // 1月は12月のあと。
    const key = (d: string) => (d.startsWith("01-") ? `13-${d.slice(3)}` : d);
    return key(a).localeCompare(key(b));
  });
  const parts: string[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length === 0) return;
    const [m, d1] = run[0].split("-").map(Number);
    const d2 = Number(run[run.length - 1].split("-")[1]);
    parts.push(run.length === 1 ? `${m}月${d1}日` : `${m}月${d1}〜${d2}日`);
    run = [];
  };
  for (const day of sorted) {
    const prev = run[run.length - 1];
    if (prev && prev.slice(0, 2) === day.slice(0, 2) && Number(day.slice(3)) === Number(prev.slice(3)) + 1) {
      run.push(day);
    } else {
      flush();
      run = [day];
    }
  }
  flush();
  return parts.join("と");
}

/**
 * その場所の季節の帯。出すものが無ければ null。
 *
 * 出すのは10月1日から、そのシーズンの最後の催しが終わるまで。会期が
 * 発表されたもので、まだ終わっていないものだけを並べる(未発表のものは
 * 載せない——帯に「未発表」が並んでも、その場所の読者の役に立たない)。
 * 休館日は1月1日を過ぎたら出さない。
 */
export function seasonBandFor(
  target: { spot?: string; museum?: string },
  today: string,
  year: number,
): SeasonBand | null {
  if (today < `${year}-10-01`) return null;

  const entries: BandEntry[] = [];
  for (const item of resolveItems(year)) {
    const place = item.places?.find((p) => matches(p, target));
    if (!place || !item.edition?.start) continue;
    const status = statusOn(item.edition, today, item.kind);
    if (status === "after") continue;
    const notes = [
      item.edition.price,
      item.edition.christmasDay === "closed" ? "12月25日は休み" : null,
    ].filter(Boolean);
    entries.push({
      title: item.title,
      when: formatRange(item.edition),
      note: notes.length > 0 ? notes.join("。") : undefined,
      relation: place.relation,
      href: item.href,
    });
  }

  const closures: BandClosure[] =
    today <= `${year + 1}-01-01`
      ? venueClosures
          .filter((c: VenueClosure) => c.places.some((p) => matches(p, target)))
          .map((c) => ({
            name: c.name,
            days: c.closed.length > 0 ? formatClosedDays(c.closed) : "",
            notes: c.notes ?? [],
          }))
      : [];

  if (entries.length === 0 && closures.length === 0) return null;

  // その場所で開かれるものを先に、すぐ近くのものをあとに。
  entries.sort((a, b) => (a.relation === b.relation ? 0 : a.relation === "here" ? -1 : 1));
  return { year, entries, closures };
}

export { formatClosedDays };
