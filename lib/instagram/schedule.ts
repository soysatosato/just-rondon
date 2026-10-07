/**
 * Instagram の投稿枠。週4本、日本時間の21:00。
 *
 * 読む人の大半は日本にいるので、時計は日本時間で持つ。21時は日本で
 * Instagram がいちばん開かれる夜の時間帯で、ロンドンでは12時(冬)/
 * 13時(夏)。コラムの公開(ロンドン12:30)とほぼ同じ頃になる。
 * 日本には夏時間が無いので、枠は常に UTC 12:00 になる。
 *
 * 曜日は月・水・金・日。間隔を2日・2日・2日・1日に散らし、週末を1日含める。
 * 変えるときは IG_SLOT_WEEKDAYS だけ直せばよい(既に入った予約は動かない)。
 */

/** 0 = 日曜。日本の曜日。 */
export const IG_SLOT_WEEKDAYS: readonly number[] = [1, 3, 5, 0];
export const IG_SLOT_HOUR_JST = 21;

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 日本での日付 "2026-10-12"。 */
export function jstDate(at: Date): string {
  return new Date(at.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

function weekdayOf(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** 日本の日付 "2026-10-12" の21:00。形式が違えば null。曜日は問わない。 */
export function igSlotFor(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const slot = new Date(
    Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), IG_SLOT_HOUR_JST) -
      JST_OFFSET_MS,
  );
  if (Number.isNaN(slot.getTime())) return null;
  // 2026-02-30 のような日付は繰り上がるので、戻して照合する。
  return jstDate(slot) === ymd ? slot : null;
}

/**
 * 次に空いている枠。
 *
 * まだ時刻が来ていない枠のうち、いちばん後ろに入っている予約の翌日以降で
 * 最初の投稿曜日。承認した順に枠が埋まっていく。
 */
export function nextIgSlot(latest: Date | null, now = new Date()): Date {
  const today = jstDate(now);
  const todaySlot = igSlotFor(today)!;
  let day = todaySlot.getTime() > now.getTime() ? today : addDays(today, 1);
  if (latest) {
    const afterLatest = addDays(jstDate(latest), 1);
    if (afterLatest > day) day = afterLatest;
  }
  while (!IG_SLOT_WEEKDAYS.includes(weekdayOf(day))) day = addDays(day, 1);
  return igSlotFor(day)!;
}

/** "10/12(月) 21:00" */
export function formatIgSlot(at: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(at);
}

/** 投稿曜日を「月・水・金・日」の形で。 */
export function igSlotWeekdaysLabel(): string {
  const names = ["日", "月", "火", "水", "木", "金", "土"];
  return [...IG_SLOT_WEEKDAYS]
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    .map((d) => names[d])
    .join("・");
}
