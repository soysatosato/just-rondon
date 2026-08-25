import Link from "next/link";
import type { AdjacentContent } from "@/utils/actions/contents";

const ACCENT_CLASSES = {
  sky: "hover:border-sky-300 dark:hover:border-sky-700 group-hover:text-sky-700 dark:group-hover:text-sky-300",
  indigo:
    "hover:border-indigo-300 dark:hover:border-indigo-700 group-hover:text-indigo-700 dark:group-hover:text-indigo-300",
  rose: "hover:border-rose-300 dark:hover:border-rose-700 group-hover:text-rose-700 dark:group-hover:text-rose-300",
} as const;

export default function AdjacentContentNav({
  basePath,
  prev,
  next,
  accent = "sky",
}: {
  basePath: string;
  prev: AdjacentContent | null;
  next: AdjacentContent | null;
  accent?: keyof typeof ACCENT_CLASSES;
}) {
  if (!prev && !next) return null;

  const accentClass = ACCENT_CLASSES[accent];

  return (
    <nav className="grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          className={`group rounded-xl border border-slate-200 p-4 transition dark:border-slate-700 ${accentClass}`}
        >
          <p className="text-xs text-muted-foreground">← 前の記事</p>
          <p className="mt-1 line-clamp-2 text-sm font-medium">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next && (
        <Link
          href={`${basePath}/${next.slug}`}
          className={`group rounded-xl border border-slate-200 p-4 text-right transition dark:border-slate-700 ${accentClass}`}
        >
          <p className="text-xs text-muted-foreground">次の記事 →</p>
          <p className="mt-1 line-clamp-2 text-sm font-medium">
            {next.title}
          </p>
        </Link>
      )}
    </nav>
  );
}
