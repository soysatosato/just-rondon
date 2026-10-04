import { unstable_cache } from "next/cache";
import { formatLondon } from "@/lib/publish-schedule";
import { sendAdminMail } from "@/utils/mail";

/**
 * バッキンガム宮殿の衛兵交代式の実施予定を、近衛師団(Household Division)の
 * 公式カレンダーから読む。
 *
 * 設計メモ:
 * 1. 公式ページはその月の全日程を HTML の表で載せている(月初には1か月分が
 *    出そろう)。API は無いので表を解析する。週次ダイジェストで手で調べる
 *    より新しく、号が月〜日で区切られる問題も起きない。
 * 2. 表は手で編集されたもので、「1<sup>st</sup> Oct」のように序数が
 *    タグで割れている。列の位置は見出し行から決め、並べ替えに耐えるようにする。
 * 3. 表に載っていない日は「その日は何も無い」。日曜は行そのものが無い週が
 *    ある。ただし表の月より先の日は「まだ発表されていない」で、意味が違う。
 *    この2つを取り違えると、未発表の日を「なし」と断言してしまう。
 * 4. 解析に失敗したら表は出さない。古い表や読み違えた表を出すくらいなら、
 *    公式へのリンクだけのほうがよい。表の書き方が変わると黙って失敗するので、
 *    本番では運営者にメールを送る(1日1通まで)。
 * 5. 当日の中止(悪天候・猛暑・国の式典)は公式カレンダーに反映されないことが
 *    ある。この表は「予定」で、当日の実施を約束するものではない。
 */

export const GUARD_SLUG = "changing-the-guard-buckingham-palace";

export const GUARD_CALENDAR_URL =
  "https://www.householddivision.org.uk/changing-the-guard-calendar";

/** 表示する日数。旅程を詰めている人が見る範囲として、今日から1週間。 */
const WINDOW_DAYS = 7;

/** 公式ページの取得結果を使い回す秒数。ページ側の ISR と揃える。 */
const REVALIDATE_SECONDS = 60 * 60;

/** 公式サイトが応答しないときにページの生成を止めないための上限。 */
const FETCH_TIMEOUT_MS = 5000;

/** 通知メールの送信を待つ上限。lib/signup-notification.ts と同じ。 */
const ALERT_TIMEOUT_MS = 5000;

/**
 * 公式表の「Type」列を分類したもの。
 *
 * - change: Guard Change。読者が見に来る交代式
 * - inspection: Captain's Inspection。交代の無い日の点検で、交代式ではない
 * - parade: Sunday Parade など
 * - cancelled: 表の上で中止と書かれたもの
 * - other: 上のどれでもない。原文のまま出して読者に判断を任せる
 */
export type GuardEventKind =
  | "change"
  | "inspection"
  | "parade"
  | "cancelled"
  | "other";

export type GuardEntry = {
  kind: GuardEventKind;
  /** 公式表の Type 列の原文。分類できなかったときに読者へそのまま見せる。 */
  typeEn: string;
  /** "11:00"。空欄なら null。 */
  time: string | null;
  /** 演奏する軍楽隊。"NO MUSIC" のときは null。 */
  band: string | null;
};

export type GuardDay = {
  /** ロンドンの日付 (YYYY-MM-DD)。 */
  date: string;
  /** 「10月5日(月)」 */
  label: string;
  isToday: boolean;
  /**
   * listed: 表に行がある / none: 表の月の日だが行が無い(=何も無い) /
   * unpublished: 表がまだ出ていない月の日
   */
  status: "listed" | "none" | "unpublished";
  entries: GuardEntry[];
};

export type GuardScheduleResult =
  | {
      ok: true;
      days: GuardDay[];
      /** 公式ページを取得した時刻(ISO)。ページに「◯時点」として必ず出す。 */
      checkedAt: string;
    }
  | { ok: false };

/* ------------------------------------------------------------------ *
 * 日付
 * ------------------------------------------------------------------ */

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** ロンドンの今日 (YYYY-MM-DD)。en-CA は ISO 形式で出る。 */
function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
  }).format(new Date());
}

/** ISO 日付に日数を足す。UTC の正午で計算して、夏時間の境目でずれないようにする。 */
function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days, 12));
  return date.toISOString().slice(0, 10);
}

function toIso(y: number, m: number, d: number): string | null {
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  // 「31 Sep」のような実在しない日は Date が翌月に繰り上げる。
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return `${m}月${d}日(${WEEKDAY_JA[weekday]})`;
}

/* ------------------------------------------------------------------ *
 * 解析
 * ------------------------------------------------------------------ */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  ndash: "–",
  mdash: "—",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

/**
 * セルの中身を1行の文字列にする。
 *
 * タグは空文字に置き換える。空白にすると「1<sup>st</sup>」が「1 st」に
 * 割れる。段落と改行だけは語の区切りなので空白にする。
 */
function cellText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function classify(typeEn: string): GuardEventKind {
  if (/cancel|no guard change|not take place/i.test(typeEn)) return "cancelled";
  if (/guard change|changing/i.test(typeEn)) return "change";
  if (/inspection/i.test(typeEn)) return "inspection";
  if (/parade/i.test(typeEn)) return "parade";
  return "other";
}

type ParsedRow = GuardEntry & { date: string };

type ParsedSchedule = {
  rows: ParsedRow[];
  /** バッキンガム宮殿の表がある月("YYYY-MM")。表の無い月の日は未発表として扱う。 */
  months: Set<string>;
};

class GuardParseError extends Error {}

/**
 * 1つの表から行を取り出す。見出し行の位置で列を決める。
 */
function parseTable(
  tableHtml: string,
  year: number,
  month: number,
): ParsedRow[] {
  const rows = [...tableHtml.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((m) =>
    [...m[0].matchAll(/<t[dh][\s\S]*?<\/t[dh]>/gi)].map((c) => cellText(c[0])),
  );

  const headerIndex = rows.findIndex(
    (cells) =>
      cells.some((c) => /^date$/i.test(c)) &&
      cells.some((c) => /^type$/i.test(c)),
  );
  if (headerIndex === -1) {
    throw new GuardParseError("表の見出し行(Date / Type)が見つからない");
  }

  const header = rows[headerIndex];
  const col = (pattern: RegExp) => header.findIndex((c) => pattern.test(c));
  const dateCol = col(/^date$/i);
  const typeCol = col(/^type$/i);
  const timeCol = col(/^time$/i);
  const bandCol = col(/music/i);

  const parsed: ParsedRow[] = [];

  for (const cells of rows.slice(headerIndex + 1)) {
    const dateText = cells[dateCol];
    const typeEn = cells[typeCol];
    if (!dateText || !typeEn) continue;

    // "Thu 1st Oct"。月の略称が無ければ見出しの月とみなす。
    const match = dateText.match(
      /\b(\d{1,2})\s*(?:st|nd|rd|th)?(?:\s+([a-z]{3})[a-z]*)?/i,
    );
    if (!match) continue;

    const day = Number(match[1]);
    let rowMonth = month;
    let rowYear = year;
    if (match[2]) {
      const index = MONTH_NAMES.findIndex((name) =>
        name.startsWith(match[2].toLowerCase()),
      );
      if (index !== -1) {
        rowMonth = index + 1;
        // 12月の表に1月の行がある、のような年またぎ。
        if (rowMonth < month - 6) rowYear = year + 1;
        if (rowMonth > month + 6) rowYear = year - 1;
      }
    }

    const date = toIso(rowYear, rowMonth, day);
    if (!date) continue;

    const time = timeCol >= 0 ? cells[timeCol]?.match(/\d{1,2}[:.]\d{2}/) : null;
    const bandText = bandCol >= 0 ? cells[bandCol] : "";

    parsed.push({
      date,
      kind: classify(typeEn),
      typeEn,
      time: time ? time[0].replace(".", ":") : null,
      band: bandText && !/no music/i.test(bandText) ? bandText : null,
    });
  }

  return parsed;
}

/**
 * ページ全体を上から読み、「月の見出し → 会場の見出し → 表」の並びで
 * バッキンガム宮殿の表だけを拾う。
 *
 * 2026-10 時点では「October 2026」の見出しの下に WINDSOR CASTLE と
 * BUCKINGHAM PALACE の表が1つずつある。翌月分が下に足されても、
 * 見出しを順に追っているので月を取り違えない。
 */
export function parseGuardCalendar(html: string): ParsedSchedule {
  const rows: ParsedRow[] = [];
  const months = new Set<string>();

  let current: { year: number; month: number } | null = null;
  let venue: "buckingham" | "windsor" | null = null;

  const tokens = html.matchAll(
    /<strong[^>]*>([\s\S]*?)<\/strong>|<table[\s\S]*?<\/table>/gi,
  );

  for (const token of tokens) {
    if (token[1] !== undefined) {
      const text = cellText(token[1]).toLowerCase();

      const monthMatch = text.match(/^([a-z]+)\s+(\d{4})$/);
      const monthIndex = monthMatch ? MONTH_NAMES.indexOf(monthMatch[1]) : -1;
      if (monthMatch && monthIndex !== -1) {
        current = { year: Number(monthMatch[2]), month: monthIndex + 1 };
        venue = null;
      } else if (text === "buckingham palace") {
        venue = "buckingham";
      } else if (text === "windsor castle") {
        venue = "windsor";
      }
      continue;
    }

    if (venue !== "buckingham" || !current) continue;

    const tableRows = parseTable(token[0], current.year, current.month);
    rows.push(...tableRows);
    months.add(
      `${current.year}-${String(current.month).padStart(2, "0")}`,
    );
    venue = null;
  }

  if (months.size === 0) {
    throw new GuardParseError(
      "「◯月 YYYY」の見出しの下に BUCKINGHAM PALACE の表が見つからない",
    );
  }
  if (rows.length === 0) {
    throw new GuardParseError("バッキンガム宮殿の表から1行も読めなかった");
  }

  return { rows, months };
}

/** 今日から WINDOW_DAYS 日分に並べ直す。 */
export function buildGuardWindow(
  schedule: ParsedSchedule,
  today: string,
): GuardDay[] {
  return Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const date = addDays(today, i);
    const entries: GuardEntry[] = schedule.rows
      .filter((row) => row.date === date)
      .map(({ kind, typeEn, time, band }) => ({ kind, typeEn, time, band }));

    const status: GuardDay["status"] = !schedule.months.has(date.slice(0, 7))
      ? "unpublished"
      : entries.length > 0
        ? "listed"
        : "none";

    return {
      date,
      label: dayLabel(date),
      isToday: i === 0,
      status,
      entries,
    };
  });
}

/* ------------------------------------------------------------------ *
 * 取得
 * ------------------------------------------------------------------ */

/**
 * 解析の失敗を運営者に知らせる。本番だけ、ロンドンの日付ごとに1通まで。
 *
 * ページの再生成(最大1時間に1回)のたびに送ると、直るまで毎時メールが
 * 届く。送れた事実を日付をキーに unstable_cache へ載せ、同じ日の2回目以降は
 * キャッシュが返るだけにする。送信が失敗した場合は例外になってキャッシュ
 * されないので、次の再生成でもう一度試みる。
 */
async function alertOwner(reason: string): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;

  const today = londonToday();
  const sendOnce = unstable_cache(
    async () => {
      await sendAdminMail({
        subject: "[just-rondon] 衛兵交代式の実施予定が読めませんでした",
        text: [
          "衛兵交代式ページの「今日から7日間の実施予定」が出せていません。",
          "いまは表の代わりに公式カレンダーへのリンクだけを出しています。",
          "",
          `理由: ${reason}`,
          `公式カレンダー: ${GUARD_CALENDAR_URL}`,
          `ページ: https://www.just-rondon.com/sightseeing/${GUARD_SLUG}`,
          "",
          "公式ページの表の書き方が変わった可能性があります。",
          "解析は lib/guard/schedule.ts の parseGuardCalendar にあります。",
          "このメールは同じ日には1通しか送りません。",
        ].join("\n"),
      });
      return true;
    },
    ["guard-schedule-alert", today],
    { revalidate: 60 * 60 * 24 },
  );

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      sendOnce(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${ALERT_TIMEOUT_MS}ms で打ち切り`)),
          ALERT_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (error) {
    console.error("[guard-schedule] alert failed", error);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 今日から7日分の実施予定。失敗しても例外にはせず { ok: false } を返す。
 *
 * 通信の失敗・タイムアウト・5xx は公式サイト側の一時的な不調とみなし、
 * ログだけ残す(次の再生成で直る)。4xx と解析の失敗は、URL や表の
 * 書き方が変わったということで、待っても直らないので運営者に知らせる。
 */
export async function fetchGuardSchedule(): Promise<GuardScheduleResult> {
  let res: Response;
  try {
    res = await fetch(GUARD_CALENDAR_URL, {
      headers: { "User-Agent": "just-rondon (+https://www.just-rondon.com)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error("[guard-schedule] fetch failed", error);
    return { ok: false };
  }

  if (!res.ok) {
    console.error(`[guard-schedule] responded ${res.status}`);
    if (res.status >= 400 && res.status < 500) {
      await alertOwner(`公式ページが ${res.status} を返した`);
    }
    return { ok: false };
  }

  let schedule: ParsedSchedule;
  try {
    schedule = parseGuardCalendar(await res.text());
  } catch (error) {
    console.error("[guard-schedule] parse failed", error);
    await alertOwner(
      error instanceof GuardParseError ? error.message : String(error),
    );
    return { ok: false };
  }

  const days = buildGuardWindow(schedule, londonToday());

  // 月が替わったのに公式が表を更新していないと、7日すべてが未発表になる。
  // 表の体をなさないので出さない。待てば公式が更新するので知らせもしない。
  if (days.every((day) => day.status === "unpublished")) return { ok: false };

  // 取得時刻は応答の Date ヘッダーから取る。fetch の結果はキャッシュから
  // 返ることがあり、そのとき「いま」を書くと実際より新しい時刻を名乗ってしまう。
  const served = res.headers.get("date");
  const checkedAt =
    served && !Number.isNaN(Date.parse(served))
      ? new Date(served).toISOString()
      : new Date().toISOString();

  return { ok: true, days, checkedAt };
}

/** 「10/4(日) 9:12」。ロンドン時間の確認時刻を出すのに使う。 */
export function formatCheckedAt(iso: string): string {
  return formatLondon(new Date(iso));
}
