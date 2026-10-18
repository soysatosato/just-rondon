import Link from "next/link";
import { formatRange, type ResolvedItem } from "@/lib/christmas";

/**
 * お金をかけずに見られるもの。灯りと、入場無料のマーケット、礼拝。
 * 屋台の飲食や遊具は別にお金がかかる——無料なのは「見て歩くこと」まで。
 */
export default function FreeList({ items }: { items: ResolvedItem[] }) {
  return (
    <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-700 dark:border-neutral-700 dark:bg-neutral-900">
      {items.map((item) => (
        <li key={item.slug} className="flex items-start gap-3 p-4">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-xs font-black text-amber-950 shadow-inner"
          >
            £0
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              <Link href={item.href} className="underline-offset-2 hover:underline">
                {item.title}
              </Link>
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-neutral-600 dark:text-neutral-400">
              {item.edition ? formatRange(item.edition) : `未発表(${item.usualTiming})`}
              {item.entry !== "無料" ? `・${item.entry}` : ""}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {item.summary}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
