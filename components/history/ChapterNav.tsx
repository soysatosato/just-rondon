import Link from "next/link";
import { HISTORY_BASE, chapterPath, getNeighbours } from "./chapters";

/**
 * 前後章のナビ。
 *
 * components/jobs/case-story/ChapterNav.tsx と同じ構造だが、
 * こちらは多言語対応が要らないぶん単純。章番号を出しているのは、
 * 通史の途中から検索で入ってきた読者に現在地を示すため。
 */
export default function ChapterNav({ slug }: { slug: string }) {
  const { prev, next } = getNeighbours(slug);

  return (
    <nav className="mt-12 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={chapterPath(prev.slug)}
            className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ← 第{prev.number}章
            </span>
            <span className="mt-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
              {prev.label}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              {prev.period}
            </span>
          </Link>
        ) : (
          <span aria-hidden className="hidden sm:block" />
        )}

        {next && (
          <Link
            href={chapterPath(next.slug)}
            className="rounded-lg border border-gray-200 p-4 text-right hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-900 sm:col-start-2"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              第{next.number}章 →
            </span>
            <span className="mt-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
              {next.label}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              {next.period}
            </span>
          </Link>
        )}
      </div>

      <Link
        href={HISTORY_BASE}
        className="inline-block text-sm text-blue-600 hover:opacity-80 dark:text-blue-400"
      >
        全10章の目次に戻る
      </Link>
    </nav>
  );
}
