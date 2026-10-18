import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { GuideCalloutData } from "./types";

/**
 * 注意・補足・小ワザを本文から視覚的に分離する。
 *
 * blockquote で代用しない理由: blockquote だと「12月25日は地下鉄が
 * 全面運休」のような事故に直結する警告と、単なる引用が同じ見た目になる。
 */
const TONE_STYLES: Record<
  GuideCalloutData["tone"],
  { wrapper: string; label: string; text: string }
> = {
  info: {
    wrapper:
      "border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/25",
    label: "text-link",
    text: "補足",
  },
  warn: {
    wrapper:
      "border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/25",
    label: "text-red-700 dark:text-red-300",
    text: "注意",
  },
  tip: {
    wrapper:
      "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25",
    label: "text-emerald-700 dark:text-emerald-300",
    text: "ヒント",
  },
};

export default function GuideCallout({
  tone,
  title,
  body,
}: GuideCalloutData) {
  const style = TONE_STYLES[tone];

  return (
    <div className={`mt-5 rounded-lg border p-4 ${style.wrapper}`}>
      <p className={`text-xs font-bold tracking-wide ${style.label}`}>
        {style.text}
      </p>
      <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </p>
      <div className="text-sm text-neutral-700 dark:text-neutral-300">
        <MarkdownBody size="compact">{body}</MarkdownBody>
      </div>
    </div>
  );
}
