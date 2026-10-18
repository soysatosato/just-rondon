import Link from "next/link";
import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 特集の中のページを行き来する帯。ハブ・イルミネーション・マーケット比較の
 * 上に置く。検索から来る読者の97%は詳細のページに着地するので、どのページに
 * 着いても特集のほかのページが見えるようにする。
 */
const PAGES = [
  { key: "hub", href: "/events/christmas", label: "特集トップ" },
  { key: "lights", href: "/sightseeing/christmas-lights", label: "イルミネーション" },
  { key: "markets", href: "/sightseeing/christmas-markets", label: "マーケット" },
  { key: "rinks", href: "/events/christmas#rinks", label: "スケートリンク" },
  { key: "shows", href: "/musicals/christmas-shows", label: "舞台" },
  { key: "days", href: "/events/christmas/christmas-day", label: "12月25日と年末年始" },
] as const;

export type SeriesPage = (typeof PAGES)[number]["key"];

export default function ChristmasSeriesNav({
  current,
  className,
}: {
  current: SeriesPage;
  className?: string;
}) {
  return (
    <nav
      aria-label="ロンドンのクリスマス特集"
      className={cn(
        "rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-emerald-50 p-3 dark:border-red-900/50 dark:from-red-950/30 dark:via-neutral-950 dark:to-emerald-950/30",
        className,
      )}
    >
      <p className="flex items-center gap-1.5 px-1 text-xs font-bold text-red-800 dark:text-red-300">
        <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
        ロンドンのクリスマス特集
      </p>
      <ul className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PAGES.map((page) => {
          const active = page.key === current;
          return (
            <li key={page.key} className="shrink-0">
              <Link
                href={page.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition",
                  active
                    ? "bg-red-700 text-white"
                    : "bg-white text-neutral-800 ring-1 ring-neutral-200 hover:ring-red-300 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-neutral-700",
                )}
              >
                {page.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
