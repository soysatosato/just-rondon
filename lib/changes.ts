/**
 * 「今月変わったロンドン」月次号(/changes)の共通定義。
 *
 * 号の月の計算、項目の分類、読者区分の表示名をここに置く。
 * これから決まっている改定の一覧は lib/changes-schedule.ts。
 *
 * 号の月は UTC の1日0時で持つ(MonthlyChangeIssue.monthStart)。
 * 週次(lib/weekly.ts)と同じく、サーバーのタイムゾーンで月が
 * ずれないよう、計算はすべて UTC で完結させる。
 */

/* ------------------------------------------------------------------ *
 * 号の月
 * ------------------------------------------------------------------ */

/** "2026-10" 形式。月を2桁にして辞書順=時系列順にする。 */
export function getMonthSlug(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getMonthSlugForDate(date: Date): string {
  return getMonthSlug(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

export function parseMonthSlug(
  slug: string,
): { year: number; month: number } | null {
  const m = slug.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

/** その月の1日 00:00 UTC。 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

/** 「2026年10月」。 */
export function formatMonthJa(monthStart: Date): string {
  return `${monthStart.getUTCFullYear()}年${monthStart.getUTCMonth() + 1}月`;
}

/** 「10月1日」。適用日は日付だけを持つので UTC で読む。 */
export function formatDayJa(date: Date): string {
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

/** 「2027年1月1日」。年をまたぐ予告に使う。 */
export function formatFullDayJa(date: Date): string {
  return `${date.getUTCFullYear()}年${formatDayJa(date)}`;
}

/** 号の古さ(月単位)。0 なら今月号、正は過去、負はこれから来る月。 */
export function getMonthsAgo(monthStart: Date, now: Date = new Date()): number {
  return (
    (now.getUTCFullYear() - monthStart.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - monthStart.getUTCMonth())
  );
}

export interface ChangeIssueFreshness {
  monthsAgo: number;
  /** 「今月」「先月」「3か月前」など。 */
  label: string;
  /** 過去の号か。予告の項目が古くなっている可能性を読者に知らせる。 */
  isPast: boolean;
}

export function getChangeIssueFreshness(
  monthStart: Date,
  now: Date = new Date(),
): ChangeIssueFreshness {
  const monthsAgo = getMonthsAgo(monthStart, now);
  let label: string;
  if (monthsAgo === 0) label = "今月";
  else if (monthsAgo === 1) label = "先月";
  else if (monthsAgo === -1) label = "来月";
  else if (monthsAgo < 0) label = `${-monthsAgo}か月後`;
  else label = `${monthsAgo}か月前`;
  return { monthsAgo, label, isPast: monthsAgo > 0 };
}

/* ------------------------------------------------------------------ *
 * 項目の分類
 *
 * 色は「何が変わったか」だけに使う。読者区分(旅行者/在住者)は
 * 色を持たない文字のチップにして、2系統の色が1項目に並ばないようにする。
 * ------------------------------------------------------------------ */

export const CHANGE_KINDS = [
  "fare",
  "admission",
  "opening",
  "closure",
  "bills",
  "housing",
  "wage",
  "visa",
  "tax",
  "life",
] as const;

export type ChangeKind = (typeof CHANGE_KINDS)[number];

export interface ChangeKindMeta {
  label: string;
  /** 和文ラベルに添える欧文。週次の誌面と同じ組み。 */
  eng: string;
  dotClass: string;
  textClass: string;
}

export const CHANGE_KIND_META: Record<ChangeKind, ChangeKindMeta> = {
  fare: {
    label: "交通運賃",
    eng: "Fares",
    dotClass: "bg-sky-500",
    textClass: "text-sky-700 dark:text-sky-400",
  },
  admission: {
    label: "入場料",
    eng: "Admission",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  opening: {
    label: "開業・再開",
    eng: "Opening",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  closure: {
    label: "閉館・終了",
    eng: "Closure",
    dotClass: "bg-rose-500",
    textClass: "text-rose-700 dark:text-rose-400",
  },
  bills: {
    label: "光熱費・生活費",
    eng: "Bills",
    dotClass: "bg-orange-500",
    textClass: "text-orange-700 dark:text-orange-400",
  },
  housing: {
    label: "住まい",
    eng: "Housing",
    dotClass: "bg-teal-500",
    textClass: "text-teal-700 dark:text-teal-400",
  },
  wage: {
    label: "賃金・雇用",
    eng: "Work",
    dotClass: "bg-lime-600",
    textClass: "text-lime-700 dark:text-lime-400",
  },
  visa: {
    label: "ビザ・入国",
    eng: "Visa",
    dotClass: "bg-indigo-500",
    textClass: "text-indigo-700 dark:text-indigo-400",
  },
  tax: {
    label: "税・手当",
    eng: "Tax",
    dotClass: "bg-violet-500",
    textClass: "text-violet-700 dark:text-violet-400",
  },
  life: {
    label: "暮らし",
    eng: "Everyday",
    dotClass: "bg-slate-500",
    textClass: "text-slate-700 dark:text-slate-300",
  },
};

export function isChangeKind(value: string): value is ChangeKind {
  return (CHANGE_KINDS as readonly string[]).includes(value);
}

export function getChangeKindMeta(kind: string): ChangeKindMeta {
  return isChangeKind(kind) ? CHANGE_KIND_META[kind] : CHANGE_KIND_META.life;
}

export const CHANGE_AUDIENCES = ["traveller", "resident", "both"] as const;
export type ChangeAudience = (typeof CHANGE_AUDIENCES)[number];

/**
 * 読者区分の表示名。both は出さない(全員に関係があるものに
 * 「全員向け」と書いても情報が増えない)。
 */
export const AUDIENCE_LABEL: Record<ChangeAudience, string | null> = {
  traveller: "旅行者向け",
  resident: "在住者向け",
  both: null,
};

/** changed=この月から変わった / upcoming=来月以降に変わることが決まった */
export const CHANGE_TIMINGS = ["changed", "upcoming"] as const;
export type ChangeTiming = (typeof CHANGE_TIMINGS)[number];

/** confirmed=確定 / planned=発表されたが覆りうる */
export const CHANGE_STATUSES = ["confirmed", "planned"] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

/** 号の2つの節。並びは「変わったこと」が先。 */
export const TIMING_SECTIONS: {
  timing: ChangeTiming;
  anchor: string;
  eng: string;
  heading: (monthLabel: string) => string;
  note: string;
}[] = [
  {
    timing: "changed",
    anchor: "changed",
    eng: "Changed This Month",
    heading: (m) => `${m}から変わったこと`,
    note: "この月に適用が始まった改定と、開業・閉館。サイト内の該当ページは改定後の数字に直してあります。",
  },
  {
    timing: "upcoming",
    anchor: "upcoming",
    eng: "Coming Up",
    heading: () => "これから変わること",
    note: "来月以降に変わることが決まったもの。予算や申請の時期を決める前に。",
  },
];
