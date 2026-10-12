import { ArrowUpRight } from "lucide-react";
import {
  sourceHost,
  sourceKindLabel,
  type ReadingSource,
  type SourceKind,
} from "@/lib/reading-sources";

/**
 * 読み物の末尾の「参考資料」欄。
 *
 * 1行に載せるのは資料名・種別・発行元・年・ドメインだけにする。
 * 「この資料で何を確かめたか」を行ごとに書くと欄が本文の続きのように
 * 長くなるので、確かめた範囲と時期は欄の最後に1行でまとめる。
 *
 * ドメインを出すのは、リンクを開く前に「議会のサイトか、誰かのブログか」が
 * 分かるようにするため。出典欄の信用はそこで決まる。
 */

const KIND_STYLES: Record<SourceKind, string> = {
  // 原典だけ色を付ける。欄の中で決め手になる資料がひと目で分かる。
  original:
    "bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/25",
  collection:
    "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-400/20",
  official:
    "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-400/20",
  study:
    "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-400/20",
};

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(date);
}

function SourceRow({ source, index }: { source: ReadingSource; index: number }) {
  const host = source.url ? sourceHost(source.url) : "";

  const body = (
    <>
      <span
        aria-hidden
        className="pt-0.5 text-xs font-semibold tabular-nums text-muted-foreground/60"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="min-w-0 space-y-1.5">
        <span className="block text-sm font-medium leading-relaxed text-foreground decoration-muted-foreground/40 underline-offset-4 group-hover:underline sm:text-[15px]">
          {source.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span
            className={`rounded px-1.5 py-px text-[10px] font-semibold tracking-wider ring-1 ring-inset ${KIND_STYLES[source.kind]}`}
          >
            {sourceKindLabel(source.kind)}
          </span>
          <span>
            {source.publisher}
            {source.year && (
              <span className="tabular-nums">
                <span aria-hidden className="mx-1.5 text-muted-foreground/40">
                  /
                </span>
                {source.year}
              </span>
            )}
          </span>
          {host && (
            <span className="font-mono text-[11px] text-muted-foreground/70">
              {host}
            </span>
          )}
        </span>
      </span>

      {source.url ? (
        <ArrowUpRight
          aria-hidden
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      ) : (
        <span aria-hidden className="w-4" />
      )}
    </>
  );

  const rowClass =
    "grid grid-cols-[1.75rem_1fr_auto] items-start gap-x-3 py-4";

  return (
    <li>
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group -mx-3 rounded-lg px-3 transition-colors hover:bg-muted/50 ${rowClass}`}
        >
          {body}
          <span className="sr-only">(新しいタブで開きます)</span>
        </a>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}

export default function ReadingSources({
  sources,
  checkedAt,
}: {
  sources: ReadingSource[];
  /** 本文と資料を照らし合わせた日時。無ければ末尾の一文を出さない。 */
  checkedAt: Date | null;
}) {
  if (sources.length === 0) return null;

  return (
    <section
      id="sources"
      aria-labelledby="sources-heading"
      className="scroll-mt-24 border-t-2 border-foreground pt-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="sources-heading"
          className="text-lg font-bold tracking-tight sm:text-xl"
        >
          参考資料
        </h2>
        <p
          aria-hidden
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          Sources
          <span className="ml-2 tabular-nums">
            {String(sources.length).padStart(2, "0")}
          </span>
        </p>
      </div>

      <ol className="mt-2 divide-y divide-border border-b border-border">
        {sources.map((source, i) => (
          <SourceRow key={`${source.title}-${i}`} source={source} index={i} />
        ))}
      </ol>

      {checkedAt && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          記事の主な日付・数字・引用は、上の資料と照らし合わせて確かめています(
          {formatMonth(checkedAt)}確認)。
        </p>
      )}
    </section>
  );
}
