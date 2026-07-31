import Link from "next/link";
import { CASE_STORY_BASE, chapterPath, getNeighbours } from "./chapters";

export default function ChapterNav({ slug }: { slug: string }) {
  const { prev, next } = getNeighbours(slug);

  return (
    <nav className="mt-10 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={chapterPath(prev.slug)}
            className="rounded-lg border border-gray-200 dark:border-neutral-700 p-4 hover:bg-gray-50 dark:hover:bg-neutral-900"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ← 前の章
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
            href={chapterPath(next.slug)}
            className="rounded-lg border border-gray-200 dark:border-neutral-700 p-4 text-right hover:bg-gray-50 dark:hover:bg-neutral-900 sm:col-start-2"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              次の章 →
            </span>
            <span className="mt-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
              {next.label}
            </span>
          </Link>
        )}
      </div>

      <Link
        href={CASE_STORY_BASE}
        className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:opacity-80"
      >
        全体の目次に戻る
      </Link>
    </nav>
  );
}
