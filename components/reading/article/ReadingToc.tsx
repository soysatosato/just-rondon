import { cn } from "@/lib/utils";
import { ARTICLE_ACCENT, type ArticleAccentName } from "./accent";

export type TocItem = { id: string; title: string };

/** 節の見出しのアンカー。displayOrder は0始まりなので1を足す。 */
export function sectionAnchor(index: number) {
  return `section-${index + 1}`;
}

/**
 * 記事内の目次。節が3つ以上ある記事にだけ出す(2つなら見出しを読めば足りる)。
 *
 * コラムは4,000〜1万字で、スマホでは20画面を超える。どこまで読んだか、
 * この先に何があるかが分からないまま下ろし続けることになっていた。
 */
export default function ReadingToc({
  items,
  accent: accentName,
}: {
  items: TocItem[];
  accent: ArticleAccentName;
}) {
  if (items.length < 3) return null;
  const accent = ARTICLE_ACCENT[accentName];

  return (
    <nav
      aria-label="目次"
      className="rounded-2xl border border-neutral-200 px-5 py-4 dark:border-neutral-800 sm:px-6"
    >
      <h2 className="text-xs font-bold tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
        目次
      </h2>
      <ol className="mt-2 space-y-0.5">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="group flex gap-3 rounded-lg py-1.5 text-[15px] leading-snug text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            >
              <span
                aria-hidden
                className={cn(
                  "w-5 shrink-0 text-right font-bold tabular-nums",
                  accent.label,
                )}
              >
                {i + 1}
              </span>
              <span className="underline-offset-4 group-hover:underline">
                {item.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
