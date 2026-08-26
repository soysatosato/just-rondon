import type { LucideIcon } from "lucide-react";
import {
  TriangleAlert,
  TrainFront,
  DoorClosed,
  Users,
  Sparkles,
  Palette,
  Tag,
  Store,
  CloudSun,
  CalendarDays,
} from "lucide-react";

const DAY_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ *
 * ISO週の計算
 *
 * DB の weekStart/weekEnd は「UTCの月曜0時 / 日曜0時」で揃える。
 * date-fns の getISOWeek 等はローカルタイムで動くため、サーバーのTZ次第で
 * 週が1日ずれる。ここでは UTC で完結する実装を置く。
 * ------------------------------------------------------------------ */

/** その日が属するISO週(月曜始まり)の月曜を、UTC 0時で返す。 */
export function getISOWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const day = d.getUTCDay(); // 0=日曜
  // 日曜(0)は前の月曜まで6日戻す。それ以外は 1 - day 日戻す。
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

/**
 * ISO 8601 の週番号。1月4日は必ず第1週に入る、という定義から逆算する。
 * 週の「年」はカレンダー上の年とずれることがある(例: 2027/1/1 は 2026-w53)。
 */
export function getISOWeekParts(date: Date): { year: number; week: number } {
  const monday = getISOWeekStart(date);

  // ISO週が属する年は「その週の木曜がある年」で決まる。
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  const year = thursday.getUTCFullYear();

  const firstMonday = getISOWeekStart(new Date(Date.UTC(year, 0, 4)));
  const week = Math.round((monday.getTime() - firstMonday.getTime()) / (7 * DAY_MS)) + 1;

  return { year, week };
}

/** "2026-w33" 形式。週番号は2桁ゼロ埋めして辞書順=時系列順にする。 */
export function getWeekSlug(year: number, week: number): string {
  return `${year}-w${String(week).padStart(2, "0")}`;
}

export function getWeekSlugForDate(date: Date): string {
  const { year, week } = getISOWeekParts(date);
  return getWeekSlug(year, week);
}

export function parseWeekSlug(
  slug: string
): { year: number; week: number } | null {
  const m = slug.match(/^(\d{4})-w(\d{2})$/);
  if (!m) return null;

  const year = parseInt(m[1], 10);
  const week = parseInt(m[2], 10);
  // ISO年は52週または53週。54以上は存在しない。
  if (week < 1 || week > 53) return null;

  return { year, week };
}

/** ISO週番号から、その週の月曜0時(UTC)と日曜0時(UTC)を求める。 */
export function getWeekRange(
  year: number,
  week: number
): { weekStart: Date; weekEnd: Date } {
  const firstMonday = getISOWeekStart(new Date(Date.UTC(year, 0, 4)));
  const weekStart = new Date(firstMonday.getTime() + (week - 1) * 7 * DAY_MS);
  const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
  return { weekStart, weekEnd };
}

/** 「8月10日(月)〜8月16日(日)」のような日本語の期間表記。 */
const JP_WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const fmt = (d: Date) =>
    `${d.getUTCMonth() + 1}月${d.getUTCDate()}日(${JP_WEEKDAY[d.getUTCDay()]})`;
  return `${fmt(weekStart)}〜${fmt(weekEnd)}`;
}

/**
 * 号の古さ(週単位)。0 なら今週号。
 * 過去号に「この号は◯週前の情報です」と出すために使う。
 */
export function getWeeksAgo(weekStart: Date, now: Date = new Date()): number {
  const currentMonday = getISOWeekStart(now);
  const briefMonday = getISOWeekStart(weekStart);
  return Math.round((currentMonday.getTime() - briefMonday.getTime()) / (7 * DAY_MS));
}

export interface IssueFreshness {
  /** 0=今週 / 負=これから来る週 / 正=過去 */
  weeksAgo: number;
  /** 「今週」「来週」「3週間前」など。 */
  label: string;
  /** 号の内容がまだ有効か。過去号には注意バナーを出す。 */
  isPast: boolean;
}

export function getIssueFreshness(
  weekStart: Date,
  now: Date = new Date()
): IssueFreshness {
  const weeksAgo = getWeeksAgo(weekStart, now);

  let label: string;
  if (weeksAgo === 0) label = "今週";
  else if (weeksAgo === -1) label = "来週";
  else if (weeksAgo < 0) label = `${-weeksAgo}週間後`;
  else if (weeksAgo === 1) label = "先週";
  else label = `${weeksAgo}週間前`;

  return { weeksAgo, label, isPast: weeksAgo > 0 };
}

/* ------------------------------------------------------------------ *
 * 項目の分類
 * ------------------------------------------------------------------ */

/** alert=知らないと困る / opportunity=知ると得する / context=前提として知っておく */
export type BriefGroup = "alert" | "opportunity" | "context";

export type BriefKind =
  | "strike"
  | "disruption"
  | "closure"
  | "crowd"
  | "event"
  | "exhibition"
  | "deal"
  | "opening"
  | "weather"
  | "holiday";

export type BriefSeverity = "high" | "medium" | "low";

/** thisWeek=今週その事が起きる / announced=今週判明した(発生は先) */
export type BriefTiming = "thisWeek" | "announced";

/** planned は「まだ覆りうる」の意。ストライキ予告は妥結で中止になる。 */
export type BriefStatus = "confirmed" | "planned";

export interface KindMeta {
  label: string;
  group: BriefGroup;
  icon: LucideIcon;
  iconWrapClass: string;
  badgeClass: string;
}

export const KIND_META: Record<BriefKind, KindMeta> = {
  strike: {
    label: "ストライキ",
    group: "alert",
    icon: TriangleAlert,
    iconWrapClass: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    badgeClass: "border-red-600/40 bg-red-600/10 text-red-700 dark:text-red-400",
  },
  disruption: {
    label: "運休・工事",
    group: "alert",
    icon: TrainFront,
    iconWrapClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    badgeClass:
      "border-orange-600/40 bg-orange-600/10 text-orange-700 dark:text-orange-400",
  },
  closure: {
    label: "臨時休館",
    group: "alert",
    icon: DoorClosed,
    iconWrapClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    badgeClass:
      "border-orange-600/40 bg-orange-600/10 text-orange-700 dark:text-orange-400",
  },
  crowd: {
    label: "混雑・封鎖",
    group: "alert",
    icon: Users,
    iconWrapClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    badgeClass:
      "border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  },
  event: {
    label: "今週だけの催し",
    group: "opportunity",
    icon: Sparkles,
    iconWrapClass:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    badgeClass:
      "border-violet-600/40 bg-violet-600/10 text-violet-700 dark:text-violet-400",
  },
  exhibition: {
    label: "展覧会",
    group: "opportunity",
    icon: Palette,
    iconWrapClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    badgeClass:
      "border-indigo-600/40 bg-indigo-600/10 text-indigo-700 dark:text-indigo-400",
  },
  deal: {
    label: "お得情報",
    group: "opportunity",
    icon: Tag,
    iconWrapClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    badgeClass:
      "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  },
  opening: {
    label: "新オープン",
    group: "opportunity",
    icon: Store,
    iconWrapClass:
      "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
    badgeClass:
      "border-teal-600/40 bg-teal-600/10 text-teal-700 dark:text-teal-400",
  },
  weather: {
    label: "天候",
    group: "context",
    icon: CloudSun,
    iconWrapClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    badgeClass: "border-sky-600/40 bg-sky-600/10 text-sky-700 dark:text-sky-400",
  },
  holiday: {
    label: "祝日",
    group: "context",
    icon: CalendarDays,
    iconWrapClass:
      "bg-slate-50 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300",
    badgeClass:
      "border-slate-600/40 bg-slate-600/10 text-slate-700 dark:text-slate-300",
  },
};

export const BRIEF_KINDS = Object.keys(KIND_META) as BriefKind[];

/** DBの文字列は自由入力なので、未知の kind でも落ちないようにフォールバックする。 */
export function getKindMeta(kind: string): KindMeta {
  return KIND_META[kind as BriefKind] ?? KIND_META.event;
}

export interface GroupMeta {
  heading: string;
  /** セクションナビ用の短い名前。 */
  shortLabel: string;
  /** セクション見出しの下に出す一言。 */
  note: string;
  anchor: string;
  icon: LucideIcon;
  /** 見出し左の縦罫。セクションの性格を色で示す。 */
  accentClass: string;
  chipClass: string;
}

export const GROUP_META: Record<BriefGroup, GroupMeta> = {
  alert: {
    heading: "今週の注意",
    shortLabel: "注意",
    note: "知らないと予定が崩れるもの。出発前に公式サイトで最新情報を確認してください。",
    anchor: "alert",
    icon: TriangleAlert,
    accentClass: "bg-red-500",
    chipClass:
      "border-red-600/40 bg-red-600/10 text-red-700 dark:text-red-400",
  },
  opportunity: {
    heading: "今週の耳寄り情報",
    shortLabel: "耳寄り",
    note: "この週だからこそ狙えるもの。",
    anchor: "opportunity",
    icon: Sparkles,
    accentClass: "bg-violet-500",
    chipClass:
      "border-violet-600/40 bg-violet-600/10 text-violet-700 dark:text-violet-400",
  },
  context: {
    heading: "今週の前提",
    shortLabel: "前提",
    note: "天候や祝日など、動き方に影響するもの。",
    anchor: "context",
    icon: CloudSun,
    accentClass: "bg-sky-500",
    chipClass:
      "border-sky-600/40 bg-sky-600/10 text-sky-700 dark:text-sky-400",
  },
};

/**
 * 読者が号を開く動機はまず「今週なにがあるか」なので、耳寄り情報を先頭に置く。
 * 支障系は影響が大きいものだけを載せる運用にしたぶん、件数が少なく後ろでも埋もれない。
 */
export const GROUP_ORDER: BriefGroup[] = ["opportunity", "alert", "context"];

export interface SeverityMeta {
  label: string;
  /** 読者が取るべき行動。バッジのtitle属性や補足に使う。 */
  action: string;
  badgeClass: string;
}

export const SEVERITY_META: Record<BriefSeverity, SeverityMeta> = {
  high: {
    label: "影響大",
    action: "旅程の変更が必要",
    badgeClass: "border-red-600/40 bg-red-600/10 text-red-700 dark:text-red-400",
  },
  medium: {
    label: "影響中",
    action: "迂回や時間調整で回避できる",
    badgeClass:
      "border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  },
  low: {
    label: "影響小",
    action: "知っておくと快適",
    badgeClass:
      "border-slate-600/40 bg-slate-600/10 text-slate-700 dark:text-slate-300",
  },
};

export function getSeverityMeta(severity: string | null): SeverityMeta | null {
  if (!severity) return null;
  return SEVERITY_META[severity as BriefSeverity] ?? null;
}

export const TIMING_LABEL: Record<BriefTiming, string> = {
  thisWeek: "今週",
  announced: "予告",
};

export function getTimingLabel(timing: string): string | null {
  return TIMING_LABEL[timing as BriefTiming] ?? null;
}

/* ------------------------------------------------------------------ *
 * 曜日別の並び
 *
 * 号は種類別(耳寄り/注意/前提)に束ねているが、読者が実際に知りたいのは
 * 「土曜は何があるか」であることが多い。同じ日に重なって物理的に両立しない
 * 催しがあっても、種類別の並びからは気づけない。
 * ------------------------------------------------------------------ */

/** その日に該当する項目。 */
export interface DaySlot {
  /** ISO 日付 (YYYY-MM-DD)。予報の date と突き合わせる鍵になる。 */
  date: string;
  /** 「9/5」形式。 */
  label: string;
  /** 「土」。 */
  weekday: string;
  /** 土日は色を変えて週末を拾いやすくする。 */
  isWeekend: boolean;
  /** その日に始まる・その日だけの項目の件数。 */
  count: number;
}

/** UTC の日付だけを YYYY-MM-DD で返す。DBの日付は UTC 0時で揃っている。 */
function toISODate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/**
 * 号の会期を1日ずつに割り、その日に「起きる」項目の件数を数える。
 *
 * 件数の数え方には幅がある。会期の長い展覧会(ひと月続くもの)を毎日に
 * 数えると、どの日も件数が同じになって曜日の差が消える。ここでは
 * 「その日に始まるもの」と「その日で終わるもの」だけを数える。読者にとって
 * 行動を促されるのはその2つ——始まる日は新しく行けるようになった日で、
 * 終わる日は逃すと二度と見られない日だから。
 *
 * timing が announced の項目(発生が会期より先)は会期内に日付を持たないので
 * 自然に除外される。
 */
export function buildDaySlots(
  weekStart: Date,
  weekEnd: Date,
  items: { startDate: Date | null; endDate: Date | null; timing: string }[]
): DaySlot[] {
  const slots: DaySlot[] = [];

  for (
    let t = weekStart.getTime();
    t <= weekEnd.getTime();
    t += 24 * 60 * 60 * 1000
  ) {
    const d = new Date(t);
    const dow = d.getUTCDay();

    const date = toISODate(d);
    const count = items.filter((item) => {
      if (item.timing === "announced") return false;
      const s = item.startDate ? toISODate(item.startDate) : null;
      const e = item.endDate ? toISODate(item.endDate) : null;
      return s === date || e === date;
    }).length;

    slots.push({
      date,
      label: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
      weekday: JP_WEEKDAY[dow],
      isWeekend: dow === 0 || dow === 6,
      count,
    });
  }

  return slots;
}

/**
 * 「見納め」バッジを出しうる kind。
 *
 * 会期が今週で閉じることが読者の行動につながるのは、展示や店のように
 * 「閉じたら二度と見られない」ものに限られる。運休・工事が今週で終わるのは
 * むしろ朗報で、締切ではない。催し(event)は週末2日間の開催が「終わる」と
 * 判定されてしまうため含めない——単発の催しは日付そのものが締切として
 * 既にカードに出ている。
 */
const ENDING_BADGE_KINDS: ReadonlySet<string> = new Set([
  "exhibition",
  "opening",
  "deal",
]);

/**
 * 項目が今週で見納めかどうか。
 *
 * DBには【今週で終了】をタイトルに手書きする運用が既にあるが、文字列なので
 * 色も付かずソートもできない。日付から機械的に判定して、最も行動を促す
 * 情報をバッジとして出す。
 *
 * 判定を日付だけに頼れない事情がある。endDate は「その号の会期に合わせて
 * 切り詰めた終わり」であることが多く、実際にはまだ続くものが weekEnd で
 * 終わって見える。既存4号で日付だけの判定を流したところ、ひと月続く
 * トータリー・テムズや、週末の運休までが「見納め」になった。
 *
 * そこで二重に絞る:
 * 1. kind が ENDING_BADGE_KINDS のもの(閉じたら見られなくなるもの)だけ。
 * 2. 会期が2日以上あって、その終わりが今週内にあるもの。
 *
 * それでも「まだ続くのに weekEnd で切られた展示」は拾ってしまう。号を書く
 * ときに、実際の閉幕日が先にあるなら endDate にその日を入れておけば
 * 正しく外れる。
 */
export function isEndingThisWeek(
  item: {
    kind: string;
    startDate: Date | null;
    endDate: Date | null;
    timing: string;
  },
  weekStart: Date,
  weekEnd: Date
): boolean {
  if (item.timing === "announced") return false;
  if (!ENDING_BADGE_KINDS.has(item.kind)) return false;
  if (!item.endDate) return false;

  const end = item.endDate.getTime();
  if (end < weekStart.getTime() || end > weekEnd.getTime()) return false;

  // 単日開催は「見納め」ではない。
  if (item.startDate && item.startDate.getTime() === end) return false;

  return true;
}
