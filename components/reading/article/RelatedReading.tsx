import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { stripInlineMarkdown } from "@/lib/plain-text";
import {
  RELATED_KIND_LABEL,
  type RelatedCandidate,
} from "@/lib/reading-related";
import { responsiveImage } from "@/lib/wikimedia-image";

const KIND_TEXT: Record<RelatedCandidate["kind"], string> = {
  column: "text-amber-700 dark:text-amber-400",
  "british-english": "text-rose-700 dark:text-rose-400",
  "modern-britain": "text-indigo-700 dark:text-indigo-400",
  history: "text-amber-800 dark:text-amber-500",
};

/**
 * 記事末尾の「関連する読み物」。選び方は lib/reading-related.ts。
 *
 * 前後の記事(公開日の隣)は話題がつながらないので、こちらを先に置く。
 * イギリス英語は日本語の見出しより英語の語のほうが引きが強いので、語を
 * 見出しにして日本語の題を下に添える。
 */
export default function RelatedReading({
  items,
}: {
  items: RelatedCandidate[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-reading">
      <h2
        id="related-reading"
        className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white sm:text-xl"
      >
        関連する読み物
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const isEnglish = item.kind === "british-english" && item.engTitle;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className="group flex h-full gap-3 rounded-xl border border-neutral-200 p-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
              >
                {item.image ? (
                  <img
                    {...responsiveImage(item.image, "80px", 330)}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-neutral-100 px-1 text-center text-[13px] font-extrabold leading-tight text-rose-700 dark:bg-neutral-800 dark:text-rose-400"
                  >
                    {isEnglish ? (
                      item.engTitle
                    ) : (
                      <BookOpen className="h-6 w-6 text-neutral-400" />
                    )}
                  </span>
                )}
                <span className="min-w-0">
                  <span
                    className={cn("text-xs font-bold", KIND_TEXT[item.kind])}
                  >
                    {RELATED_KIND_LABEL[item.kind]}
                  </span>
                  <span className="mt-0.5 block line-clamp-3 text-[15px] font-semibold leading-snug text-neutral-900 group-hover:underline dark:text-neutral-100">
                    {isEnglish ? (
                      <>
                        <span className="text-rose-700 dark:text-rose-400">
                          {item.engTitle}
                        </span>{" "}
                        <span className="font-normal text-neutral-700 dark:text-neutral-300">
                          {stripInlineMarkdown(item.title)}
                        </span>
                      </>
                    ) : (
                      stripInlineMarkdown(item.title)
                    )}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
