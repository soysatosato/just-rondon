import { cn } from "@/lib/utils";
import { parseKeyPoints, splitLabeledPoint } from "@/lib/reading-keypoints";
import { ARTICLE_ACCENT, type ArticleAccentName } from "./accent";
import { ReadingInline } from "./ReadingMarkdown";

/**
 * 記事の冒頭に置く「要点」。値は Content.description(lib/reading-keypoints.ts)。
 *
 * 読み物は1本4,000〜1万字あり、結論が最後の節まで出てこない書き方のものが
 * 多い。検索から来た読者の多くは「ロンドン大火の犯人は誰か」のような
 * 1つの問いを持っていて、答えに着く前に帰っていた。答えを先に渡し、
 * 経緯を読みたい人だけが本文に進めるようにする。
 *
 * 全項目が「**意味**: …」の形なら、ラベルと値の表にする(イギリス英語の
 * 「早わかり」)。それ以外は番号なしの箇条書き。
 */
export default function KeyPoints({
  markdown,
  title,
  accent: accentName,
}: {
  markdown: string | null | undefined;
  title: string;
  accent: ArticleAccentName;
}) {
  const items = parseKeyPoints(markdown);
  if (items.length === 0) return null;

  const accent = ARTICLE_ACCENT[accentName];
  const labeled = items.map(splitLabeledPoint);
  const isTable = labeled.every(Boolean);

  return (
    <section
      aria-label={title}
      className={cn("rounded-2xl border px-5 py-5 sm:px-6", accent.panel)}
    >
      <h2
        className={cn(
          "text-xs font-bold tracking-[0.12em]",
          accent.label,
        )}
      >
        {title}
      </h2>

      {isTable ? (
        <dl className="mt-3 divide-y divide-neutral-200/80 text-[15px] leading-[1.75] dark:divide-neutral-700/70">
          {labeled.map((p, i) => (
            <div
              key={i}
              className="grid gap-x-4 gap-y-0.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[6.5em_1fr]"
            >
              <dt className="text-[13px] font-bold text-neutral-500 dark:text-neutral-400 sm:pt-[0.15em]">
                {p!.label}
              </dt>
              <dd className="text-neutral-800 dark:text-neutral-100">
                <ReadingInline accent={accentName}>{p!.value}</ReadingInline>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <ul
          className={cn(
            "mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.75] text-neutral-800 dark:text-neutral-100",
            accent.marker,
          )}
        >
          {items.map((item, i) => (
            <li key={i} className="pl-0.5">
              <ReadingInline accent={accentName}>{item}</ReadingInline>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
