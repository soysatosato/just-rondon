import type { SeasonEdition, SeasonItem, SeasonKind, SeasonSource } from "./types";

/**
 * 会期の読み出しと日付の書式。日付はすべて "YYYY-MM-DD"(ロンドンの日付)の
 * 文字列で持ち、辞書順の比較で前後を決める。Date に直すのは曜日を出すときと
 * 日数を足すときだけで、どちらも UTC で計算する(時差で1日ずれないように)。
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * いま案内すべきシーズンの年。1月はまだ前の年のシーズンの中にいる。
 *
 * @param today ロンドンの日付 "YYYY-MM-DD"
 */
export function seasonYear(today: string): number {
  const [year, month] = today.split("-").map(Number);
  return month === 1 ? year - 1 : year;
}

/** そのシーズンの開催。発表が無ければ null。 */
export function editionFor(
  editions: readonly SeasonEdition[],
  year: number,
): SeasonEdition | null {
  return editions.find((e) => e.year === year) ?? null;
}

/** その年より前で、いちばん新しい開催。 */
export function previousEdition(
  editions: readonly SeasonEdition[],
  year: number,
): SeasonEdition | null {
  const older = editions.filter((e) => e.year < year);
  return older.length > 0 ? older[older.length - 1] : null;
}

/** "2026-12-24" に days 日を足す。 */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** from から to までの日数(同じ日なら0)。 */
export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / DAY_MS);
}

/** "2026-11-02" → "11月2日(月)"。 */
export function formatDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}月${d}日(${weekday})`;
}

/** "2026-11-02" → "11/2"。表や暦の狭い欄に。 */
export function formatShortDay(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
}

/** "2026-10-11" → "2026年10月11日"。 */
export function formatFullDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** "2026-12-24" → "木"。 */
export function weekdayOf(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** 会期を1行で。「11月2日(月)〜1月3日(日)」「点灯は11月12日(木)」。 */
export function formatRange(edition: SeasonEdition): string {
  const label = edition.label ?? "";
  if (!edition.start) return `${label}日程は未発表`;
  if (edition.end) {
    return `${label}${formatDay(edition.start)}〜${formatDay(edition.end)}`;
  }
  // 終わりの日が未発表。「点灯は◯日」のように語があればそれだけで足りる。
  return label
    ? `${label}${formatDay(edition.start)}`
    : `${formatDay(edition.start)}から`;
}

/** 会期を短く。「11/2〜1/3」「11/12から」。 */
export function formatShortRange(edition: SeasonEdition): string {
  if (!edition.start) return "日程は未発表";
  return edition.end
    ? `${formatShortDay(edition.start)}〜${formatShortDay(edition.end)}`
    : `${formatShortDay(edition.start)}から`;
}

/** 出典の markdown。「出典: [名前](URL)(◯年◯月◯日確認)」。 */
export function sourceLine(
  sources: readonly SeasonSource[],
  checkedAt: string,
): string {
  const links = sources.map((s) => `[${s.label}](${s.url})`).join("、");
  return `出典: ${links}(${formatFullDate(checkedAt)}確認)`;
}

/**
 * ある日の状態。
 *
 *   unannounced  そのシーズンの日程が発表されていない
 *   before       まだ始まっていない
 *   open         開いている
 *   closed-day   会期中だがその日は休み(12月25日など)
 *   unknown      会期中だが、12月25日に開くかが公式に書かれていない
 *   after        終わった
 */
export type DayStatus =
  | "unannounced"
  | "before"
  | "open"
  | "closed-day"
  | "unknown"
  | "after";

/**
 * 終わりの日が発表されていない会期を、いつまで続くものとして扱うか。
 * 英国ではクリスマスの飾りを十二夜(1月5日の夜〜6日)までに片付けるので、
 * 1月6日で区切る。これが無いと、1月下旬になっても灯りが「点灯中」と出る。
 */
const UNDATED_END = "01-06";

/** 会期の終わり。発表が無ければ翌年の1月6日。 */
export function effectiveEnd(edition: SeasonEdition): string {
  return edition.end ?? `${edition.year + 1}-${UNDATED_END}`;
}

/**
 * @param kind 通りの灯りは屋外の公道なので、12月25日もそのまま見られる。
 *             それ以外で25日の営業が公式に書かれていなければ unknown。
 */
export function statusOn(
  edition: SeasonEdition | null,
  date: string,
  kind?: SeasonKind,
): DayStatus {
  if (!edition?.start) return "unannounced";
  if (date < edition.start) return "before";
  if (date > effectiveEnd(edition)) return "after";
  if (edition.closedDates?.includes(date)) return "closed-day";
  if (date.slice(5) === "12-25") {
    if (edition.christmasDay === "closed") return "closed-day";
    if (edition.christmasDay === "open" || kind === "lights") return "open";
    return "unknown";
  }
  return "open";
}

/** シーズン年の版と、その前の版をまとめて引く。 */
export function resolveEdition(item: Pick<SeasonItem, "editions">, year: number) {
  return {
    edition: editionFor(item.editions, year),
    previous: previousEdition(item.editions, year),
  };
}

/** 12月25日(そのシーズン年)。 */
export function christmasDayOf(year: number): string {
  return `${year}-12-25`;
}
