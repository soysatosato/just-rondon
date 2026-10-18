import Link from "next/link";
import { eventMonthPath } from "@/lib/events";

/**
 * 12か月の切り替え。前後の月を大きく、残りを小さく並べる。
 *
 * 旅行の時期を決めている読者は、隣の月と見比べながら決める。
 * 12本すべてが互いにリンクし合うので、どの月から入っても他の月に届く。
 */
export default function MonthNav({ month }: { month: number }) {
  const prev = month === 1 ? 12 : month - 1;
  const next = month === 12 ? 1 : month + 1;

  return (
    <nav aria-label="ほかの月" className="mt-12">
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={eventMonthPath(prev)}
          className="rounded-xl border border-neutral-200 p-4 transition hover:border-emerald-400 dark:border-neutral-700"
        >
          <span className="text-xs text-neutral-500 dark:text-neutral-400">← 前の月</span>
          <span className="mt-0.5 block font-bold text-neutral-900 dark:text-neutral-100">
            {prev}月のロンドン
          </span>
        </Link>
        <Link
          href={eventMonthPath(next)}
          className="rounded-xl border border-neutral-200 p-4 text-right transition hover:border-emerald-400 dark:border-neutral-700"
        >
          <span className="text-xs text-neutral-500 dark:text-neutral-400">次の月 →</span>
          <span className="mt-0.5 block font-bold text-neutral-900 dark:text-neutral-100">
            {next}月のロンドン
          </span>
        </Link>
      </div>

      <ul className="mt-3 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <li key={m}>
            {m === month ? (
              <span
                aria-current="page"
                className="block rounded-lg bg-emerald-700 py-1.5 text-center text-sm font-semibold text-white"
              >
                {m}月
              </span>
            ) : (
              <Link
                href={eventMonthPath(m)}
                className="block rounded-lg border border-neutral-200 py-1.5 text-center text-sm text-neutral-700 transition hover:border-emerald-400 dark:border-neutral-700 dark:text-neutral-300"
              >
                {m}月
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
