import Link from "next/link";
import { caseStoryBase, chapterPath, getNeighbours } from "./chapters";
import { t } from "./ui";
import type { Locale } from "./types";

export default function ChapterNav({
  slug,
  locale = "ja",
}: {
  slug: string;
  locale?: Locale;
}) {
  const { prev, next } = getNeighbours(slug, locale);
  const strings = t(locale);

  return (
    <nav className="mt-10 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={chapterPath(prev.slug, locale)}
            className="rounded-lg border border-gray-200 dark:border-neutral-700 p-4 hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {strings.prevChapter}
            </span>
            <span className="mt-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
              {prev.label}
            </span>
          </Link>
        ) : (
          <span aria-hidden className="hidden sm:block" />
        )}

        {next && (
          <Link
            href={chapterPath(next.slug, locale)}
            className="rounded-lg border border-gray-200 dark:border-neutral-700 p-4 text-right hover:bg-gray-50 dark:hover:bg-neutral-900 sm:col-start-2"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {strings.nextChapter}
            </span>
            <span className="mt-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
              {next.label}
            </span>
          </Link>
        )}
      </div>

      <Link
        href={caseStoryBase(locale)}
        className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:opacity-80"
      >
        {strings.backToIndex}
      </Link>
    </nav>
  );
}
