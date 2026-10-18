import Link from "next/link";
import { TreePine } from "lucide-react";
import { londonDate } from "@/lib/publish-schedule";
import { SEASON_CHECKED, formatFullDate, seasonBandFor, seasonYear } from "@/lib/christmas";
import { cn } from "@/lib/utils";

/**
 * 観光スポットと美術館のページに出す「この場所のクリスマス」の帯。
 *
 * 検索から来る読者の97%は詳細のページに着地する。そのページで、冬だけの
 * リンクや年末年始の休館をその場で知らせ、特集のハブへつなぐ。
 * 会期は lib/christmas のデータから出すので、特集と食い違わない。
 *
 * 出すのは10月からシーズンの終わりまで。出すものが無いページでは何も描かない。
 */
export default function SeasonBand({
  spot,
  museum,
  className,
}: {
  spot?: string;
  museum?: string;
  className?: string;
}) {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const band = seasonBandFor({ spot, museum }, today, year);
  if (!band) return null;

  return (
    <aside
      aria-label="この場所のクリスマス"
      className={cn(
        "rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-emerald-50 p-4 dark:border-red-900/50 dark:from-red-950/30 dark:via-neutral-950 dark:to-emerald-950/30 sm:p-5",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-300">
        <TreePine className="h-4 w-4" aria-hidden="true" />
        この場所のクリスマス({band.year}年)
      </p>

      <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
        {band.entries.map((entry) => (
          <li key={entry.title}>
            <span className="mr-1.5 inline-block rounded bg-white px-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-neutral-900 dark:text-emerald-300 dark:ring-emerald-900">
              {entry.relation === "here" ? "ここで" : "すぐ近くで"}
            </span>
            <Link href={entry.href} className="font-semibold underline-offset-2 hover:underline">
              {entry.title}
            </Link>
            <span className="tabular-nums">: {entry.when}</span>
            {entry.note && (
              <span className="block text-xs text-neutral-600 dark:text-neutral-400">{entry.note}</span>
            )}
          </li>
        ))}
        {band.closures.map((closure) => (
          <li key={closure.name}>
            <span className="mr-1.5 inline-block rounded bg-white px-1.5 text-xs font-semibold text-red-800 ring-1 ring-red-200 dark:bg-neutral-900 dark:text-red-300 dark:ring-red-900">
              年末年始
            </span>
            {closure.days ? (
              <>
                <span className="font-semibold">{closure.name}</span>は{closure.days}が休み。
              </>
            ) : (
              <span className="font-semibold">{closure.name}</span>
            )}
            {closure.notes.map((note) => (
              <span key={note} className="block text-xs text-neutral-600 dark:text-neutral-400">
                {note}
              </span>
            ))}
          </li>
        ))}
      </ul>

      <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <Link
          href="/events/christmas"
          className="text-sm font-semibold text-link underline underline-offset-2"
        >
          ロンドンのクリスマス特集へ
        </Link>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          公式発表を確かめたもの({formatFullDate(SEASON_CHECKED)}時点)
        </span>
      </p>
    </aside>
  );
}
