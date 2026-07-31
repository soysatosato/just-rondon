import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "../MarkdownBody";
import ChapterNav from "./ChapterNav";
import Disclaimer from "./Disclaimer";
import {
  CASE_STORY_BASE,
  articleJsonLd,
  breadcrumbJsonLd,
  getChapterIndex,
} from "./chapters";
import type { CaseStoryArticle } from "./types";

export default function ArticleLayout({
  article,
}: {
  article: CaseStoryArticle;
}) {
  const position = getChapterIndex(article.slug) + 1;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(article)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(article)),
        }}
      />

      <nav className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/jobs/service-charges" className="hover:underline">
          サービスチャージ
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={CASE_STORY_BASE} className="hover:underline">
          未払いの記録
        </Link>
      </nav>

      <header className="space-y-3">
        {position > 0 && (
          <p className="text-xs font-medium tracking-wide text-blue-600 dark:text-blue-400">
            第{position}章
          </p>
        )}
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {article.engTitle}
        </p>
        {article.summary && (
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {article.summary}
          </p>
        )}
      </header>

      <Separator className="my-6" />

      {article.mainText && (
        <section className="mb-10">
          <MarkdownBody>{article.mainText}</MarkdownBody>
        </section>
      )}

      <div className="space-y-8">
        {article.sections.map((section, i) => (
          <Card
            key={section.title}
            className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm"
          >
            <CardContent className="p-6 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {i + 1}. {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {section.subtitle}
                </p>
              )}
              <MarkdownBody>{section.body}</MarkdownBody>
            </CardContent>
          </Card>
        ))}
      </div>

      <ChapterNav slug={article.slug} />
      <Disclaimer />
    </main>
  );
}
