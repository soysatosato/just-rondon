import Link from "next/link";
import { CalendarDays, ExternalLink } from "lucide-react";

import {
  formatPerformanceDate,
  formatPerformanceTime,
} from "../schedule-format";

export type TheatrePerformance = {
  startsAt: Date;
  timeTba: boolean;
  url: string | null;
  status: string;
  musical: { name: string; slug: string };
};

/**
 * 劇場の直近公演。
 *
 * 作品ページの MusicalSchedule と似ているが、こちらは1劇場に複数作品が
 * 並びうるため作品名を出す。通常は1作品なので、そのときは作品名の列を
 * 出さない(全行に同じ名前が並ぶだけで情報にならない)。
 */
export default function TheatrePerformances({
  performances,
  fetchedAt,
  multipleShows,
}: {
  performances: TheatrePerformance[];
  fetchedAt: Date | null;
  multipleShows: boolean;
}) {
  if (performances.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="mb-2 text-xl font-semibold sm:text-2xl">
        この劇場の直近の公演
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Ticketmaster の販売情報より。
        {fetchedAt && `${formatPerformanceDate(fetchedAt)}時点。`}
        休演日や追加公演が変わることがあるため、購入前に公式サイトで
        ご確認ください。
      </p>

      <ul className="divide-y divide-border">
        {performances.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <CalendarDays size={16} className="shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {formatPerformanceDate(p.startsAt)}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {/* 時刻未定の公演は時刻を出さない。00:00 と出すと深夜公演に見える。 */}
                {p.timeTba ? "時刻未定" : formatPerformanceTime(p.startsAt)}
              </span>
              {multipleShows && (
                <Link
                  href={`/musicals/${p.musical.slug}`}
                  className="truncate text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  {p.musical.name}
                </Link>
              )}
            </div>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
              >
                チケット
                <ExternalLink size={13} />
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
