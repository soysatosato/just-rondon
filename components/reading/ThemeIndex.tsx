import Link from "next/link";
import { cn } from "@/lib/utils";
import { stripInlineMarkdown } from "@/lib/plain-text";
import {
  RELATED_KIND_LABEL,
  type RelatedKind,
} from "@/lib/reading-related";

export type ThemeIndexItem = {
  href: string;
  title: string;
  /** イギリス英語の語。あれば題の代わりに見出しにする。 */
  engTitle?: string | null;
  kind: RelatedKind;
};

export type ThemeIndexEntry = {
  key: string;
  label: string;
  blurb: string;
  items: ThemeIndexItem[];
  guides: readonly { href: string; label: string }[];
};

const KIND_DOT: Record<RelatedKind, string> = {
  column: "bg-amber-500",
  "british-english": "bg-rose-500",
  "modern-britain": "bg-indigo-500",
  history: "bg-amber-800 dark:bg-amber-600",
};

/** 1テーマの中で最初から見せる本数。残りは「ほか◯本」の中。 */
const VISIBLE = 4;

/**
 * 読み物をセクションではなく話題で引く索引。対応は lib/reading-topics.ts。
 *
 * セクション(コラム・イギリス英語・英国のいま・通史)は書き手の都合の
 * 分け方で、読者は「ロンドン塔の話」「地下鉄の話」で探している。
 * 1テーマに4本まで見せ、残りは折りたたむ(HTML には全部載るので、
 * 検索エンジンもすべての記事へのリンクを辿れる)。
 *
 * 点の色は記事のセクション(ハブ・記事ページと同じ色)。
 */
export default function ThemeIndex({
  id,
  heading,
  description,
  themes,
}: {
  id: string;
  heading: string;
  description?: string;
  themes: ThemeIndexEntry[];
}) {
  if (themes.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <div className="mb-5 border-b border-foreground/20 pb-2">
        <h2 id={id} className="text-lg font-bold tracking-tight sm:text-xl">
          {heading}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const shown = theme.items.slice(0, VISIBLE);
          const rest = theme.items.slice(VISIBLE);
          return (
            <li
              key={theme.key}
              id={`theme-${theme.key}`}
              className="flex scroll-mt-24 flex-col rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/60 sm:p-5"
            >
              <h3 className="flex items-baseline justify-between gap-2 text-[15px] font-bold leading-snug">
                <span>{theme.label}</span>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {theme.items.length}本
                </span>
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {theme.blurb}
              </p>

              <ul className="mt-3 space-y-2">
                {shown.map((item) => (
                  <ThemeLink key={item.href} item={item} />
                ))}
              </ul>

              {rest.length > 0 && (
                <details className="group mt-2">
                  <summary className="cursor-pointer list-none text-[13px] font-semibold text-link hover:underline [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">
                      ほか{rest.length}本を見る
                    </span>
                    <span className="hidden group-open:inline">閉じる</span>
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {rest.map((item) => (
                      <ThemeLink key={item.href} item={item} />
                    ))}
                  </ul>
                </details>
              )}

              {theme.guides.length > 0 && (
                <div className="mt-auto pt-4">
                  <p className="flex flex-wrap gap-x-3 gap-y-1 border-t border-neutral-100 pt-3 text-[13px] dark:border-neutral-800">
                    {theme.guides.map((g) => (
                      <Link
                        key={g.href}
                        href={g.href}
                        className="font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 hover:decoration-current dark:text-neutral-300 dark:decoration-neutral-600 dark:hover:text-white"
                      >
                        {g.label} →
                      </Link>
                    ))}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ThemeLink({ item }: { item: ThemeIndexItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className="group flex items-start gap-2 text-[14px] leading-snug"
      >
        <span
          aria-hidden
          className={cn(
            "mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full",
            KIND_DOT[item.kind],
          )}
        />
        <span className="min-w-0 group-hover:underline">
          <span className="sr-only">{RELATED_KIND_LABEL[item.kind]}: </span>
          {item.kind === "british-english" && item.engTitle ? (
            <>
              <span className="font-semibold" lang="en-GB">
                {item.engTitle}
              </span>{" "}
              <span className="text-muted-foreground">
                {stripInlineMarkdown(item.title)}
              </span>
            </>
          ) : (
            <span className="line-clamp-2">{stripInlineMarkdown(item.title)}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
