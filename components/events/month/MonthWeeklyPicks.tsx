import Link from "next/link";
import { formatWeekRange, getKindMeta } from "@/lib/weekly";

type Pick = {
  id: string;
  kind: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  venue: string | null;
  isFree: boolean;
  brief: { slug: string };
};

type Brief = { slug: string; weekStart: Date; weekEnd: Date };

/** 最初に見せる件数。残りは <details> に畳む(JS 無しで開ける)。 */
const VISIBLE = 8;

/** "10/1〜1/31"。年は出さない(月別ページの中で、前後の年は文脈で分かる)。 */
function formatPeriod(start: Date | null, end: Date | null): string {
  const fmt = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  if (!start || !end) return "";
  return start.getTime() === end.getTime()
    ? fmt(start)
    : `${fmt(start)}〜${fmt(end)}`;
}

function PickRow({ pick }: { pick: Pick }) {
  const meta = getKindMeta(pick.kind);
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {formatPeriod(pick.startDate, pick.endDate)}
        </span>
        <span className={meta.textClass}>{meta.label}</span>
        {pick.isFree && (
          <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
            無料
          </span>
        )}
      </div>
      <Link
        href={`/events/week/${pick.brief.slug}`}
        className="mt-1 block text-sm font-medium leading-snug text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
      >
        {pick.title}
      </Link>
      {pick.venue && (
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {pick.venue}
        </p>
      )}
    </li>
  );
}

function PickList({ title, picks }: { title: string; picks: Pick[] }) {
  if (picks.length === 0) return null;
  const head = picks.slice(0, VISIBLE);
  const rest = picks.slice(VISIBLE);

  return (
    <div className="mt-6 first:mt-0">
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
        {title}
        <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
          {picks.length}件
        </span>
      </h3>
      <ul className="mt-1 divide-y divide-neutral-200 dark:divide-neutral-700">
        {head.map((p) => (
          <PickRow key={p.id} pick={p} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            残り{rest.length}件を見る
          </summary>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {rest.map((p) => (
              <PickRow key={p.id} pick={p} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/**
 * 週次ダイジェストで取り上げた、その月にかかる催しと展覧会。
 *
 * Event テーブルの定番行事とは別に、号を重ねるほど増える。号を書いたときの
 * 見出しをそのまま使い、詳しい中身は号へのリンクで読ませる。
 */
export default function MonthWeeklyPicks({
  month,
  exhibitions,
  events,
  briefs,
}: {
  month: number;
  exhibitions: Pick[];
  events: Pick[];
  briefs: Brief[];
}) {
  return (
    <div>
      {exhibitions.length + events.length > 0 && (
        <>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            週次ダイジェスト「今週のロンドン」で紹介したもののうち、{month}
            月に開催中のものです。終わったものは外しています。会期は号を書いた時点の情報なので、出かける前に公式サイトで確かめてください。
          </p>
          <div className="mt-4">
            <PickList title="展覧会(会期末が近い順)" picks={exhibitions} />
            <PickList title="催し・お得情報" picks={events} />
          </div>
        </>
      )}

      {briefs.length > 0 && (
        <div className="mt-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/60">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {month}月の「今週のロンドン」
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {briefs.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/events/week/${b.slug}`}
                  className="text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
                >
                  {b.weekStart.getUTCFullYear()}年{" "}
                  {formatWeekRange(b.weekStart, b.weekEnd).replace(
                    /\([日月火水木金土]\)/g,
                    ""
                  )}
                  の号
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
