/**
 * 公演日時の表示。作品ページと劇場ページで共有する。
 *
 * ロンドン現地時刻に揃えるのが要点。読者は日本から見るが、劇場に着く
 * 時刻はロンドンの時計で決まる。閲覧環境のタイムゾーンで描くと、
 * 日本から見たとき 19:30 の公演が翌日 03:30 と出てしまう。
 */

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatPerformanceDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  // 曜日は Intl の英語略称ではなく日本語に置き換える。
  const weekdayIndex = new Date(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
  ).getDay();
  return `${Number(get("month"))}月${Number(get("day"))}日(${WEEKDAY_JA[weekdayIndex]})`;
}

export function formatPerformanceTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
