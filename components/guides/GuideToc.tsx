import type { GuideSectionData } from "./types";

/**
 * 記事内目次。
 * 既存の /sightseeing/thames-cruise などの目次と同じ見た目にそろえている。
 */
export default function GuideToc({
  sections,
}: {
  sections: GuideSectionData[];
}) {
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="目次"
      className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-5"
    >
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        目次
      </h2>
      <ul className="mt-3 list-none space-y-2 border-l border-gray-300 dark:border-neutral-700 pl-4">
        {sections.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
            >
              {i + 1}. {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
