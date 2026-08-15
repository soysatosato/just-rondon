import { CalendarDays, ExternalLink } from "lucide-react";

export type SchedulePerformance = {
  startsAt: Date;
  timeTba: boolean;
  url: string | null;
  status: string;
};

/** 表示する公演数。1〜2週間ぶんを想定。全部出すと数百件になる。 */
const VISIBLE_COUNT = 8;

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * ロンドン現地時刻での表示に揃える。
 *
 * 読者は日本から見るが、劇場に着く時刻はロンドンの時計で決まる。
 * 閲覧環境のタイムゾーンで描くと、日本から見たとき 19:30 の公演が
 * 翌日 03:30 と出てしまう。
 */
function formatDate(date: Date): string {
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

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function MusicalSchedule({
  performances,
  fetchedAt,
}: {
  performances: SchedulePerformance[];
  fetchedAt: Date | null;
}) {
  // 呼び出し側で未来ぶんだけ渡す前提だが、0件なら節ごと出さない。
  if (performances.length === 0) return null;

  const visible = performances.slice(0, VISIBLE_COUNT);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-foreground mb-2">
        直近の公演スケジュール
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Ticketmaster の販売情報より。
        {fetchedAt && `${formatDate(fetchedAt)}時点。`}
        休演日や追加公演が変わることがあるため、購入前に公式サイトでご確認ください。
      </p>

      <ul className="divide-y divide-border">
        {visible.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <CalendarDays size={16} className="shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {formatDate(p.startsAt)}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {/* 時刻未定の公演は時刻を出さない。00:00 と出すと深夜公演に見える。 */}
                {p.timeTba ? "時刻未定" : formatTime(p.startsAt)}
              </span>
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                チケット
                <ExternalLink size={13} />
              </a>
            )}
          </li>
        ))}
      </ul>

      {performances.length > visible.length && (
        <p className="mt-4 text-sm text-muted-foreground">
          ほか {performances.length - visible.length} 公演。
        </p>
      )}
    </section>
  );
}
