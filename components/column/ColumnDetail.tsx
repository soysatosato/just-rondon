import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Content, ContentSection } from "@prisma/client";
import { CommentTargetType } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { tagLabel } from "@/lib/column-taxonomy";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import type { AdjacentContent } from "@/utils/actions/contents";
import PageCommentSection, {
  type PageCommentItem,
} from "@/components/comments/PageCommentSection";

const proseClass =
  "prose dark:prose-invert prose-sm sm:prose-base max-w-full";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

type ColumnWithSections = Content & { sections: ContentSection[] };

export type SeriesEntry = {
  id: string;
  title: string;
  slug: string;
  seriesOrder: number | null;
};

export default function ColumnDetail({
  content,
  series = [],
  prev = null,
  next = null,
  comments,
}: {
  content: ColumnWithSections;
  series?: SeriesEntry[];
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
  comments: PageCommentItem[];
}) {
  const sections = content.sections.slice().sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  // 連載が2本以上あるときだけ回送ナビを出す（1本しか無い連載は実質単発）
  const hasSeries = Boolean(content.seriesName) && series.length > 1;
  const currentIndex = hasSeries
    ? series.findIndex((s) => s.slug === content.slug)
    : -1;
  const seriesPrev = currentIndex > 0 ? series[currentIndex - 1] : null;
  const seriesNext =
    currentIndex >= 0 && currentIndex < series.length - 1
      ? series[currentIndex + 1]
      : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:py-10 space-y-10">
      <Breadcrumbs path="/column" current={content.title} />

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-sm text-muted-foreground">
            {formatDate(content.createdAt)}
          </p>
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {content.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tagLabel(t)}
                </span>
              ))}
            </div>
          )}
        </div>
        {hasSeries && (
          <p className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
            連載「{content.seriesName}」全 {series.length} 回 の第{" "}
            {content.seriesOrder ?? "–"} 回
          </p>
        )}
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          {content.title}
        </h1>
        {content.summary && (
          <div className={`text-muted-foreground italic ${proseClass}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content.summary}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {content.image && (
        <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden">
          <img
            src={content.image}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      {content.mainText && (
        <section className={proseClass}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} />

      <div className="space-y-8">
        {sections.map((sec) => (
          <section
            key={sec.id}
            className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-6 last:border-b-0"
          >
            <h2 className="text-xl sm:text-2xl font-semibold">
              {sec.title}
            </h2>
            {sec.subtitle && (
              <p className="text-sm text-muted-foreground">{sec.subtitle}</p>
            )}
            {sec.description && (
              <div className={proseClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sec.description}
                </ReactMarkdown>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 連載の全話リスト。どの回からでも他の回に飛べるようにする */}
      {hasSeries && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
          <h2 className="mb-4 text-base font-bold tracking-tight sm:text-lg">
            連載「{content.seriesName}」全 {series.length} 回
          </h2>
          <ol className="space-y-2">
            {series.map((entry) => {
              const isCurrent = entry.slug === content.slug;
              const inner = (
                <>
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-slate-400 text-white dark:bg-slate-600"
                        : "bg-amber-600 text-white"
                    }`}
                  >
                    {entry.seriesOrder ?? "–"}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">
                    {entry.title}
                    {isCurrent && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        （この記事）
                      </span>
                    )}
                  </span>
                </>
              );

              return (
                <li key={entry.id}>
                  {isCurrent ? (
                    <div
                      aria-current="page"
                      className="flex items-start gap-3 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800/60"
                    >
                      {inner}
                    </div>
                  ) : (
                    <Link
                      href={`/column/${entry.slug}`}
                      className="group flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 transition hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900"
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* 前後の回への移動(連載中のみ)。連載でない単発コラムは、
          代わりにコラム全体での前後記事ナビを出す。 */}
      {hasSeries ? (
        (seriesPrev || seriesNext) && (
          <nav className="grid gap-3 sm:grid-cols-2">
            {seriesPrev ? (
              <Link
                href={`/column/${seriesPrev.slug}`}
                className="group rounded-xl border border-slate-200 p-4 transition hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700"
              >
                <p className="text-xs text-muted-foreground">
                  ← 第 {seriesPrev.seriesOrder ?? "–"} 回
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium group-hover:text-sky-700 dark:group-hover:text-sky-300">
                  {seriesPrev.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden />
            )}
            {seriesNext && (
              <Link
                href={`/column/${seriesNext.slug}`}
                className="group rounded-xl border border-slate-200 p-4 text-right transition hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700"
              >
                <p className="text-xs text-muted-foreground">
                  第 {seriesNext.seriesOrder ?? "–"} 回 →
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium group-hover:text-sky-700 dark:group-hover:text-sky-300">
                  {seriesNext.title}
                </p>
              </Link>
            )}
          </nav>
        )
      ) : (
        <AdjacentContentNav
          basePath="/column"
          prev={prev}
          next={next}
          accent="sky"
        />
      )}

      <PageCommentSection
        targetType={CommentTargetType.COLUMN}
        targetKey={content.slug}
        prompt="この記事を読んだ感想や、関連して知っていることがあれば教えてください。"
        heading="感想・コメント"
        placeholder="感想やご意見をお聞かせください"
        initialComments={comments}
      />

      <p className="pt-4">
        <Link
          href="/column"
          className="text-sm font-medium text-sky-600 dark:text-sky-300 underline"
        >
          ← コラム一覧に戻る
        </Link>
      </p>
    </div>
  );
}
