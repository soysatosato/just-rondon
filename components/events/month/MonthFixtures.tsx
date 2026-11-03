import Link from "next/link";
import { cn } from "@/lib/utils";
import { fixturesHref, type FixtureView } from "@/lib/football/fixtures";

/**
 * 「◯月のロンドン」の節。その月にロンドンで行われるプレミアリーグの
 * ホーム試合を並べ、旅行の日付で探すページ(/sightseeing/football/fixtures)へ
 * その月の日程を入れた状態で送る。データは lib/football/fixtures.ts。
 */
export default function MonthFixtures({
  fixtures,
  month,
}: {
  fixtures: FixtureView[];
  /** "2026-11" */
  month: string;
}) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0, 12)).getUTCDate();
  const href = fixturesHref({
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  });
  const provisional = fixtures.some((f) => f.status === "provisional");

  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {provisional
          ? "日時が未確定の試合は、テレビ放映の都合で同じ週末のうちに動くことがあります(時刻の「仮」は日程表の仮の時刻)。"
          : "どの試合も日時が確定しています。時刻はロンドン時間です。"}
      </p>
      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-700">
        {fixtures.map((f) => (
          <li
            key={f.id}
            className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-2.5"
          >
            <span className="text-sm text-neutral-900 dark:text-neutral-100">
              <span className="font-semibold tabular-nums">
                {f.dateLabel} {f.kickoff}
                {f.status === "provisional" && (
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    (仮)
                  </span>
                )}
              </span>
              <span className="ml-2">
                {f.homeName} 対 {f.awayName}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 text-xs font-semibold",
                f.status === "provisional"
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {f.status === "provisional" ? "日時は未確定" : "日時確定"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm">
        <Link
          href={href}
          className="font-medium text-link underline underline-offset-2 dark:text-blue-400"
        >
          旅行の日付で試合を探す
        </Link>
        <span className="ml-1 text-neutral-600 dark:text-neutral-400">
          (チケットの取りやすさ・日本時間・動きうる日も見られます)
        </span>
      </p>
    </div>
  );
}
