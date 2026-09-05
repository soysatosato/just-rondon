/**
 * 旅行プランに実際の日付を割り当てるための処理。
 *
 * 「1日目」だけでは分からないことが2つある。衛兵交代式のように
 * 実施日が曜日で決まるもの、そして月曜休館の施設。出発日を1つ
 * もらえば、あとは日数を足すだけでどちらも判定できる。
 *
 * 曜日は 0=月 〜 6=日 で持つ。JavaScript の Date.getDay() は
 * 0=日 なので、境目をここ1箇所に閉じ込めて外へ出さない。
 */

export const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

/** 曜日の並び順そのものを文字列にしたもの。indexOf で番号に直すのに使う。 */
const DAY_CHARS = "月火水木金土日";

/* ------------------------------------------------------------------ *
 * 日付
 * ------------------------------------------------------------------ */

/**
 * 出発日は "YYYY-MM-DD" で持つ。Date をそのまま保存しないのは、
 * localStorage を経由すると UTC の文字列になり、時差で1日ずれるため。
 */
export type IsoDate = string;

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 文字列を現地時間の午前0時として読む。
 *
 * new Date("2026-10-03") は UTC の午前0時と解釈されるので、日本や
 * 英国の時間帯で読み戻すと前日になることがある。年月日を分解して
 * ローカルのコンストラクタに渡し、その解釈をさせない。
 */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !ISO_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // 「2026-02-31」のような実在しない日付は、Date が3月に繰り上げる。
  // 入れた値と出てきた値が違うなら、それは日付ではなかったということ。
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function toIsoDate(date: Date): IsoDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 出発日から数えて day 日目(1始まり)の日付。 */
export function dateForDay(startDate: string | null, day: number): Date | null {
  const start = parseIsoDate(startDate);
  if (!start) return null;
  const date = new Date(start);
  date.setDate(date.getDate() + day - 1);
  return date;
}

/** 0=月 〜 6=日。Date.getDay() は 0=日 なのでここで詰め替える。 */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** 「10月3日(金)」。年は出さない——旅程の中で年が変わることはまず無い。 */
export function formatPlanDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAY_LABELS[weekdayIndex(date)]})`;
}

/* ------------------------------------------------------------------ *
 * 開館曜日
 * ------------------------------------------------------------------ */

/*
 * 休館曜日を openingHours の散文から読み取る parseClosedDays() は撤去した。
 *
 * 読めていたのは155件中10件で、しかも書き方ひとつで誤読した——「土曜のみ」
 * と書くと残り6日が休館だと読まれる。2026-09 に15件を追加したとき、
 * 3件の休館日を正しく読ませるために原文の文言そのものを調整する必要が
 * あり、書き手が正規表現を意識しないと成立しない仕組みだと分かった。
 *
 * 事実は Attraction.closedWeekdays が持つ。値の入れ方と、どこまで
 * 調べたかは scripts/seed-attraction-closed-days.ts を参照。
 */

/** 休館曜日の一覧を「月・火」の形にする。 */
export function formatClosedDays(days: number[]): string {
  return days.map((d) => WEEKDAY_LABELS[d]).join("・");
}
