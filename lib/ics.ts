/**
 * 「カレンダーに追加」で配る iCalendar(.ics)を作る。
 *
 * 扱うのは終日の予定だけ。行事や開幕の日付は「YYYY-MM-DD」(ロンドンの日付)で
 * 持っていて、時刻は「20:00開門・24:00花火」のような文でしか無いため、
 * 時刻は説明文に入れる。終日なのでタイムゾーンは要らない。
 *
 * 前の日の朝9時ごろに知らせる通知(VALARM)を付ける。取り込んだ予定の
 * 通知を無視するカレンダーもあるが、付けて困ることはない。
 */
import { SITE_URL } from "@/lib/seo";

export type IcsEvent = {
  /** 予定ごとに一意で、取り込み直したときに同じ予定として上書きされる値。 */
  uid: string;
  title: string;
  /** "YYYY-MM-DD" */
  start: string;
  /** 最終日("YYYY-MM-DD"、その日を含む)。1日だけなら省く。 */
  end?: string;
  description: string;
  /** サイト内のパス。 */
  path: string;
  location?: string;
};

/** RFC 5545 の TEXT の書き方(\ ; , と改行をエスケープ)。 */
function text(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** 1行75オクテットで折り返す。日本語の文字の途中では切らない。 */
function fold(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch, "utf8");
    // 2行目以降は先頭の空白1つぶん短くなる。
    const limit = out.length === 0 ? 75 : 74;
    if (bytes + size > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

function compactDate(ymd: string): string {
  return ymd.replace(/-/g, "");
}

/** 終日の予定の DTEND は最終日の翌日(含まない)。 */
function dayAfter(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

export function buildIcs(calendarName: string, events: IcsEvent[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Just Rondon//Calendar//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(calendarName)}`,
  ];
  for (const event of events) {
    const url = `${SITE_URL}${event.path}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}@just-rondon.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compactDate(event.start)}`,
      `DTEND;VALUE=DATE:${compactDate(dayAfter(event.end ?? event.start))}`,
      `SUMMARY:${text(event.title)}`,
      `DESCRIPTION:${text(`${event.description}\n\n${url}`)}`,
      `URL:${url}`,
      ...(event.location ? [`LOCATION:${text(event.location)}`] : []),
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${text(event.title)}`,
      "TRIGGER:-PT15H",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** ルートハンドラの応答。検索には出さない。 */
export function icsResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
