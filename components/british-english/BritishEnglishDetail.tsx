import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Content, ContentSection } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import ContentFigure from "@/components/content/ContentFigure";
import type { AdjacentContent } from "@/utils/actions/contents";

const proseClass =
  "prose prose-sm sm:prose-base max-w-full dark:prose-invert prose-headings:font-bold prose-a:text-rose-600 dark:prose-a:text-rose-400 prose-strong:text-rose-600 dark:prose-strong:text-rose-400 prose-li:marker:text-rose-400";

const SECTION_ACCENTS = [
  {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    rail: "bg-rose-500",
  },
  {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    rail: "bg-sky-500",
  },
  {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    rail: "bg-amber-500",
  },
  {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    rail: "bg-emerald-500",
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

type BritishEnglishWithSections = Content & { sections: ContentSection[] };

export default function BritishEnglishDetail({
  content,
  prev = null,
  next = null,
}: {
  content: BritishEnglishWithSections;
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
}) {
  const sections = content.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <Breadcrumbs path="/british-english" current={content.title} />

      <header className="relative mt-6 overflow-hidden rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-background to-amber-50 px-6 py-9 dark:border-rose-900/50 dark:from-rose-950/25 dark:via-background dark:to-amber-950/15 sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/10"
        />

        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              British English
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(content.createdAt)}
            </span>
          </div>

          {content.engTitle && (
            <p className="break-words text-4xl font-extrabold leading-none tracking-tight text-rose-600 dark:text-rose-400 sm:text-6xl">
              {content.engTitle}
            </p>
          )}

          <h1
            className={`text-xl font-bold leading-snug tracking-tight sm:text-3xl ${
              content.engTitle ? "mt-4" : ""
            }`}
          >
            {content.title}
          </h1>
        </div>
      </header>

      {content.summary && (
        <div className="mt-8 rounded-2xl border-l-4 border-rose-500 bg-muted/50 px-5 py-4">
          <div
            className={`${proseClass} prose-p:my-0 text-[15px] font-medium leading-relaxed`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content.summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {content.image && (
        <ContentFigure
          crop
          className="mt-8"
          image={content.image}
          alt={content.title}
          caption={content.imageCaption}
          source={content.imageSource}
          credit={content.imageCredit}
          link={content.imageLink}
        />
      )}

      {content.mainText && (
        <section className={`mt-8 ${proseClass}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.inArticle} />
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((sec, i) => {
          const accent = SECTION_ACCENTS[i % SECTION_ACCENTS.length];
          return (
            <section
              key={sec.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7"
            >
              <div className="mb-4 flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 h-8 w-1.5 shrink-0 rounded-full ${accent.rail}`}
                />
                <div className="min-w-0">
                  <span
                    className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${accent.badge}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-lg font-bold leading-snug tracking-tight sm:text-2xl">
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {sec.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {sec.description && (
                <div className={proseClass}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sec.description}
                  </ReactMarkdown>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-10">
        <AdjacentContentNav
          basePath="/british-english"
          prev={prev}
          next={next}
          accent="rose"
        />
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-rose-300 bg-rose-50/50 px-6 py-7 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
        <p className="text-sm font-bold">明日もまた1語、増えます。</p>
        <p className="mt-1 text-xs text-muted-foreground">
          イギリス英語の沼は、思ったより深い。
        </p>
        <Link
          href="/british-english"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          ← イギリス英語をすべて見る
        </Link>
      </div>
    </div>
  );
}
