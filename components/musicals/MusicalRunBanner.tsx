import { CalendarClock, CalendarX } from "lucide-react";
import { londonDate } from "@/lib/publish-schedule";
import {
  formatRunDate,
  musicalRunFor,
  upcomingRunDates,
} from "@/lib/musicals/runs";
import { formatCheckedAt } from "@/lib/time-routes";

/**
 * 作品名の下に出す「いつまで・いつから観られるか」の知らせ。
 * 中身は lib/musicals/runs.ts。発表済みの日付が無い作品では何も描かない。
 *
 * ページは1時間ごとに描き直す(ISR)ので、過ぎた日付の判定はその時点の
 * ロンドンの日付で行う(SpotNoticeBanner と同じ)。千秋楽を過ぎた作品は
 * 取得関数の側で上演中から外れ、ヒーローが「上演は終わっています」と出す。
 */
export default function MusicalRunBanner({ slug }: { slug: string }) {
  const run = musicalRunFor(slug);
  if (!run) return null;
  const { opens, closes } = upcomingRunDates(slug, londonDate(new Date()));
  if (!opens && !closes) return null;

  // 初日がまだ来ていないなら、それを先に言う。千秋楽は添えるだけ。
  const isOpening = opens !== null;
  const Icon = isOpening ? CalendarClock : CalendarX;
  const title = isOpening
    ? `${formatRunDate(opens)}開幕`
    : `${formatRunDate(closes as string)}で終演`;
  const body = isOpening
    ? closes
      ? `初日より前の公演はありません。${formatRunDate(closes)}までの期間限定です。`
      : "初日より前の公演はありません。"
    : "千秋楽が発表されています。この日より後の公演はありません。";
  const className = isOpening
    ? "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100"
    : "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100";

  return (
    <aside
      aria-label={isOpening ? "開幕日" : "終演日"}
      className={`flex gap-3 rounded-2xl border p-4 ${className}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="text-base font-bold leading-snug">{title}</p>
        <p className="text-sm leading-relaxed">{body}</p>
        <p className="text-xs leading-relaxed opacity-80">
          {formatCheckedAt(run.checkedAt)}に確認(
          {run.sources.map((source, i) => (
            <span key={source.url}>
              {i > 0 && "、"}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {source.label}
              </a>
            </span>
          ))}
          )
        </p>
      </div>
    </aside>
  );
}
