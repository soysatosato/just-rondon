import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Content, ContentSection } from "@prisma/client";
import ModernBritainBreadCrumbs from "@/components/modern-britain/ModernBritainBreadCrumbs";
import { modernBritainTagLabel } from "@/lib/modern-britain-taxonomy";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import type { AdjacentContent } from "@/utils/actions/contents";

// 太字は本文中の「殴り返し」に多用されるので、色は付けず字面の太さだけで効かせる。
// 全部インディゴにすると、1段落に何度も出てくる強調が蛍光ペンだらけに見える。
const proseClass =
  "prose prose-sm sm:prose-base max-w-full dark:prose-invert prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-foreground prose-li:marker:text-indigo-400";

// 本文はMarkdownで管理しているので、記法側では target を指定できない。
// 出典は外部の報道記事なので、読者を記事から連れ去らないよう別タブで開く。
const markdownComponents = {
  // node は react-markdown が渡す内部プロパティ。DOMに流すと
  // node="[object Object]" という属性が出力されるので捨てる。
  a: ({
    href,
    children,
    node: _node,
    ...rest
  }: React.ComponentPropsWithoutRef<"a"> & { node?: unknown }) => {
    const isExternal = /^https?:\/\//.test(href ?? "");
    return (
      <a
        href={href}
        {...rest}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

type ModernBritainWithSections = Content & { sections: ContentSection[] };

export default function ModernBritainDetail({
  content,
  prev = null,
  next = null,
}: {
  content: ModernBritainWithSections;
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
}) {
  const sections = content.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <ModernBritainBreadCrumbs title={content.title} />

      <header className="relative mt-6 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-background to-cyan-50 px-6 py-9 dark:border-indigo-900/50 dark:from-indigo-950/25 dark:via-background dark:to-cyan-950/15 sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
        />

        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Britain, Argued
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(content.createdAt)}
            </span>
          </div>

          <h1 className="text-xl font-bold leading-snug tracking-tight sm:text-3xl">
            {content.title}
          </h1>

          {content.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:bg-slate-900/60 dark:text-indigo-300"
                >
                  {modernBritainTagLabel(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {content.summary && (
        <div className="mt-8 rounded-2xl border-l-4 border-indigo-500 bg-muted/50 px-5 py-4">
          <div
            className={`${proseClass} prose-p:my-0 text-[15px] font-medium leading-relaxed`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content.summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {content.image && (
        <div className="relative mt-8 h-56 w-full overflow-hidden rounded-2xl sm:h-72 md:h-80">
          <img
            src={content.image}
            alt={content.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      {content.mainText && (
        <section className={`mt-8 ${proseClass}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.inArticle} />
      </div>

      {/* 記事は「第1部=ニュース紹介(1本)」「第2部=論考(1〜2本)」の2部構成。
          全セクションを同じ見た目で並べると、事実の紹介と書き手の主張が
          地続きに見えてしまう。先頭は色を落とした地の面で「報道の引用」、
          2本目以降はカードを立てて「書き手の論」と読み分けさせる。 */}
      <div className="mt-10 space-y-8">
        {sections.map((sec, i) => {
          const isReport = i === 0;
          return (
            <section
              key={sec.id}
              className={
                isReport
                  ? "rounded-2xl border border-slate-200 bg-muted/40 p-5 dark:border-slate-800 sm:p-7"
                  : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7"
              }
            >
              <div className="mb-4 flex items-start gap-3">
                <span
                  aria-hidden
                  className={`mt-1 h-8 w-1.5 shrink-0 rounded-full ${
                    isReport ? "bg-slate-400 dark:bg-slate-600" : "bg-indigo-500"
                  }`}
                />
                <div className="min-w-0">
                  <span
                    className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                      isReport
                        ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    }`}
                  >
                    {isReport ? "News" : "Argument"}
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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
          basePath="/modern-britain"
          prev={prev}
          next={next}
          accent="indigo"
        />
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 px-6 py-7 text-center dark:border-indigo-900/60 dark:bg-indigo-950/20">
        <p className="text-sm font-bold">英国のいまを、もう一本。</p>
        <Link
          href="/modern-britain"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          ← 論考をすべて見る
        </Link>
      </div>
    </div>
  );
}
