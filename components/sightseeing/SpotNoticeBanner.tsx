import { CalendarX, MoveRight, OctagonAlert } from "lucide-react";
import { londonDate } from "@/lib/publish-schedule";
import { spotNoticeFor, type SpotNoticeTone } from "@/lib/sightseeing/notices";
import { formatCheckedAt } from "@/lib/time-routes";

/**
 * 名前の下に出す「いま行けるか」の知らせ(閉館の予定・移転・休止)。
 * 中身は lib/sightseeing/notices.ts。該当の無いスポットでは何も描かない。
 *
 * ページは1時間ごとに描き直す(ISR)ので、until の判定はその時点の
 * ロンドンの日付で行う(SeasonBand と同じ)。
 */

const TONE: Record<
  SpotNoticeTone,
  { icon: typeof OctagonAlert; className: string; label: string }
> = {
  closed: {
    icon: OctagonAlert,
    label: "休止・休館",
    className:
      "border-red-300 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100",
  },
  closing: {
    icon: CalendarX,
    label: "閉館の予定",
    className:
      "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
  },
  moving: {
    icon: MoveRight,
    label: "移転",
    className:
      "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100",
  },
};

export default function SpotNoticeBanner({ slug }: { slug: string }) {
  const notice = spotNoticeFor(slug, londonDate(new Date()));
  if (!notice) return null;
  const tone = TONE[notice.tone];
  const Icon = tone.icon;

  return (
    <aside
      aria-label={tone.label}
      className={`flex gap-3 rounded-2xl border p-4 ${tone.className}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="text-base font-bold leading-snug">{notice.title}</p>
        <p className="text-sm leading-relaxed">{notice.body}</p>
        <p className="text-xs leading-relaxed opacity-80">
          {formatCheckedAt(notice.checkedAt)}に確認(
          {notice.sources.map((source, i) => (
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
