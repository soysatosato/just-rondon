import { addDays, daysBetween, formatShortDay, statusOn } from "./season";
import type { ResolvedItem } from "./index";
import type { SpecialDay } from "./days";
import { isClosedOn, isLongTermClosed } from "./closures";
import type { VenueClosure } from "./types";

/**
 * 「滞在日を入れると、開いているものが分かる」の判定。
 *
 * ハブの StayPlanner(ブラウザ)が使う。サーバーは日付を知らないまま
 * 描くので、判定はすべてここの純粋な関数で、渡されたデータだけから出す。
 */

/** 1度に調べられる日数の上限。旅行の日程として長すぎる入力を弾く。 */
export const MAX_STAY_DAYS = 31;

export type StayRange = { from: string; to: string };

/** 範囲が正しく、上限の日数に収まっているか。 */
export function isValidStay(range: StayRange): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(range.from) || !pattern.test(range.to)) return false;
  const span = daysBetween(range.from, range.to);
  return span >= 0 && span < MAX_STAY_DAYS;
}

export function stayDates(range: StayRange): string[] {
  const span = daysBetween(range.from, range.to);
  return Array.from({ length: span + 1 }, (_, i) => addDays(range.from, i));
}

export type ItemStay = {
  item: ResolvedItem;
  /** 開いている日数 / 滞在日数。 */
  openDays: number;
  totalDays: number;
  /** 滞在中で会期内なのに休みの日(12月25日など)。 */
  closedDays: string[];
  /** 12月25日に開くかが公式に書かれていない日。 */
  unknownDays: string[];
  /** 短い説明。「11/19から」「1/3まで・12/25は休み」。 */
  detail: string;
};

export type StayResult = {
  /** 滞在中ずっと開いている。 */
  allDays: ItemStay[];
  /** 一部の日だけ開いている。 */
  someDays: ItemStay[];
  /** 滞在中は開いていない(まだ始まらない、もう終わった)。 */
  noDays: ItemStay[];
  /** そのシーズンの日程が未発表。 */
  unannounced: ItemStay[];
  /**
   * 滞在中に休む館。休む日が同じ館をまとめてある(「12/24〜12/26: 大英博物館、
   * ナショナル・ギャラリー、…」)。長期休館の館は longTerm にまとめる。
   */
  closures: { dates: string[]; names: string[] }[];
  longTerm: string[];
  /** 滞在中の、旅程に響く日。 */
  specialDays: { date: string; day: SpecialDay }[];
  /** 滞在中の祝日(gov.uk)。 */
  bankHolidays: { date: string; title: string; substitute: boolean }[];
};

function describe(stay: Omit<ItemStay, "detail">, range: StayRange): string {
  const edition = stay.item.edition;
  if (!edition?.start) {
    return `日程は未発表(${stay.item.usualTiming})`;
  }
  // 公演日が決まっている舞台は、滞在中の公演日だけを書く。
  if (edition.onlyDates) {
    const shows = edition.onlyDates.filter((d) => d >= range.from && d <= range.to);
    return shows.length > 0
      ? `${shows.map(formatShortDay).join("・")}に公演`
      : "滞在中の公演なし";
  }
  if (stay.openDays === 0) {
    if (edition.start > range.to) return `${formatShortDay(edition.start)}から`;
    if (edition.end && edition.end < range.from) return `${formatShortDay(edition.end)}で終わり`;
    return "滞在中は休み";
  }
  const parts: string[] = [];
  if (edition.start > range.from) parts.push(`${formatShortDay(edition.start)}から`);
  if (edition.end && edition.end < range.to) parts.push(`${formatShortDay(edition.end)}まで`);
  if (stay.closedDays.length > 0) {
    parts.push(`${stay.closedDays.map(formatShortDay).join("・")}は休み`);
  }
  if (stay.unknownDays.length > 0) {
    parts.push(`${stay.unknownDays.map(formatShortDay).join("・")}の営業は未発表`);
  }
  if (!edition.end) {
    // 灯りは例年1月上旬まで。それ以外は、終わりが分からないことを必ず書く。
    parts.push(stay.item.kind === "lights" ? "例年1月上旬まで" : "終わりの日は未発表");
  }
  return parts.length > 0 ? parts.join("・") : "滞在中ずっと";
}

export function evaluateStay(
  range: StayRange,
  data: {
    items: ResolvedItem[];
    closures: VenueClosure[];
    specialDays: SpecialDay[];
    bankHolidays: { date: string; title: string; substitute: boolean }[];
  },
): StayResult {
  const dates = stayDates(range);
  const result: StayResult = {
    allDays: [],
    someDays: [],
    noDays: [],
    unannounced: [],
    closures: [],
    longTerm: [],
    specialDays: [],
    bankHolidays: [],
  };

  for (const item of data.items) {
    const statuses = dates.map((date) => statusOn(item.edition, date, item.kind));
    const openDays = statuses.filter((s) => s === "open").length;
    const closedDays = dates.filter((_, i) => statuses[i] === "closed-day");
    const unknownDays = dates.filter((_, i) => statuses[i] === "unknown");
    const base = { item, openDays, totalDays: dates.length, closedDays, unknownDays };
    const stay: ItemStay = { ...base, detail: describe(base, range) };
    // 終わりの日が未発表のもの(灯り以外)は、全日程開いているとは言い切らない。
    // 公演日だけの舞台も「ずっと」にはしない。
    const undatedEnd =
      (!item.edition?.end && item.kind !== "lights") || !!item.edition?.onlyDates;

    if (!item.edition?.start) result.unannounced.push(stay);
    else if (openDays === dates.length && !undatedEnd) result.allDays.push(stay);
    else if (openDays > 0 || unknownDays.length > 0) result.someDays.push(stay);
    else result.noDays.push(stay);
  }

  const groups = new Map<string, { dates: string[]; names: string[] }>();
  for (const closure of data.closures) {
    if (dates.some((date) => isLongTermClosed(closure, date))) {
      result.longTerm.push(closure.name);
      continue;
    }
    const closed = dates.filter((date) => isClosedOn(closure, date));
    if (closed.length === 0) continue;
    const key = closed.join(",");
    const group = groups.get(key) ?? { dates: closed, names: [] };
    group.names.push(closure.name);
    groups.set(key, group);
  }
  result.closures = [...groups.values()].sort((a, b) => a.dates[0].localeCompare(b.dates[0]));

  for (const date of dates) {
    const day = data.specialDays.find((d) => d.monthDay === date.slice(5));
    if (day) result.specialDays.push({ date, day });
  }

  result.bankHolidays = data.bankHolidays.filter((b) => dates.includes(b.date));

  return result;
}
