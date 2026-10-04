import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowRight, ExternalLink, TriangleAlert } from "lucide-react";
import type { MonthlyChangeItem } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  AUDIENCE_LABEL,
  formatDayJa,
  formatFullDayJa,
  getChangeKindMeta,
  type ChangeAudience,
} from "@/lib/changes";
import { ancestorCrumbs, treeLabel } from "@/components/navigation/tree";

/**
 * 月次号の1項目。週次の BriefEntry と同じく、箱ではなく細罫と余白で区切る。
 *
 * 週次と違うのは「前 → 後」の行を見出しのすぐ下に置くこと。改定の記事で
 * 読者が最初に知りたいのは「いくらからいくらへ」で、それが本文の3段落目に
 * 埋もれていると、数字を探して読み飛ばすことになる。
 *
 * 本文は畳まない。週次は1号10件を超えるので畳んでいるが、月次は件数が
 * 少なく、1件ごとに「誰がどう動けばいいか」まで読んでほしい。
 */

/** sitePath を「光熱費・生活の契約」のような名前に直す。 */
function sitePageLabel(path: string): string {
  return treeLabel(path) ?? ancestorCrumbs(path).at(-1)?.label ?? "関連ページ";
}

function sourceLabel(item: MonthlyChangeItem): string {
  if (item.sourceName) return item.sourceName;
  try {
    return new URL(item.source).hostname.replace(/^www\./, "");
  } catch {
    return "出典";
  }
}

export default function ChangeEntry({
  item,
  index,
  /** 号の月。適用日が同じ年なら年を省く。 */
  monthStart,
}: {
  item: MonthlyChangeItem;
  index: number;
  monthStart: Date;
}) {
  const kind = getChangeKindMeta(item.kind);
  const audience = AUDIENCE_LABEL[item.audience as ChangeAudience] ?? null;

  const effective = item.effectiveDate
    ? item.effectiveDate.getUTCFullYear() === monthStart.getUTCFullYear()
      ? formatDayJa(item.effectiveDate)
      : formatFullDayJa(item.effectiveDate)
    : null;

  const hasDelta = item.before || item.after;

  return (
    <article className="py-7">
      <div className="grid gap-x-5 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
        <span
          aria-hidden
          className="hidden select-none pt-0.5 font-serif text-xl tabular-nums leading-none text-muted-foreground/45 sm:block"
        >
          {String(index).padStart(2, "0")}
        </span>

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span
              aria-hidden
              className="select-none font-serif text-sm tabular-nums leading-none text-muted-foreground/50 sm:hidden"
            >
              {String(index).padStart(2, "0")}
            </span>

            <span
              className={cn(
                "inline-flex items-baseline gap-1.5 text-[11px] font-bold leading-none",
                kind.textClass,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "inline-block h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full",
                  kind.dotClass,
                )}
              />
              {kind.label}
              <span className="font-serif text-[10px] font-semibold uppercase tracking-[0.14em] opacity-55">
                {kind.eng}
              </span>
            </span>

            {audience && (
              <span className="rounded-sm border border-foreground/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-foreground/70 dark:text-gray-300">
                {audience}
              </span>
            )}
          </div>

          <h3 className="text-[17px] font-bold leading-snug tracking-tight sm:text-lg dark:text-white">
            {item.title}
          </h3>

          {(hasDelta || effective) && (
            <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {hasDelta && (
                <span className="inline-flex items-baseline gap-2 tabular-nums">
                  {item.before && (
                    <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50 dark:text-gray-500">
                      {item.before}
                    </span>
                  )}
                  {item.before && item.after && (
                    <>
                      <ArrowRight
                        aria-hidden
                        className="h-3.5 w-3.5 shrink-0 self-center text-muted-foreground"
                      />
                      <span className="sr-only">から</span>
                    </>
                  )}
                  {item.after && (
                    <span className="text-lg font-bold leading-none dark:text-white">
                      {item.after}
                    </span>
                  )}
                </span>
              )}
              {effective && (
                <span className="text-xs font-semibold tabular-nums text-muted-foreground dark:text-gray-400">
                  {effective}から
                </span>
              )}
            </p>
          )}

          {/* 覆りうることは本文より先に伝える。 */}
          {item.status === "planned" && (
            <p className="mt-3 flex gap-2 border-l-2 border-amber-500 py-1 pl-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                発表の段階です。変更・撤回になる可能性があるため、手続きの前に出典で最新の状況を確認してください。
              </span>
            </p>
          )}

          <div className="prose prose-sm mt-3 max-w-none leading-[1.95] text-muted-foreground marker:text-muted-foreground dark:prose-invert dark:text-gray-300 prose-headings:text-foreground prose-strong:text-foreground dark:prose-strong:text-white">
            <ReactMarkdown>{item.description}</ReactMarkdown>
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {item.sitePath && (
              <Link
                href={item.sitePath}
                className="group inline-flex items-center gap-1 font-bold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground dark:text-gray-200"
              >
                {sitePageLabel(item.sitePath)}の解説へ
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4 hover:text-foreground dark:text-gray-400"
            >
              出典: {sourceLabel(item)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
