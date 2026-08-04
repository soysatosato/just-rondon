import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "../MarkdownBody";
import ChapterNav from "./ChapterNav";
import Disclaimer from "./Disclaimer";
import HtmlLang from "./HtmlLang";
import LocaleSwitch from "./LocaleSwitch";
import {
  SERVICE_CHARGES_PATH,
  articleJsonLd,
  breadcrumbJsonLd,
  caseStoryBase,
  chapterPath,
  getChapterIndex,
} from "./chapters";
import { t } from "./ui";
import type { CaseStoryArticle, Locale } from "./types";

export default function ArticleLayout({
  article,
  locale = "ja",
}: {
  article: CaseStoryArticle;
  locale?: Locale;
}) {
  const position = getChapterIndex(article.slug) + 1;
  const strings = t(locale);
  const path = chapterPath(article.slug, locale);

  return (
    <main className="mx-auto max-w-4xl py-10 text-gray-900 dark:text-gray-100">
      {locale === "en" && <HtmlLang lang="en" />}
      <JsonLd data={breadcrumbJsonLd(article, locale)} />
      <JsonLd data={articleJsonLd(article, locale)} />

      <div className="mb-6 flex items-center justify-between gap-4">
        <nav className="text-xs text-gray-500 dark:text-gray-400">
          <Link href={SERVICE_CHARGES_PATH} className="hover:underline">
            {strings.breadcrumbServiceCharges}
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={caseStoryBase(locale)} className="hover:underline">
            {strings.breadcrumbStory}
          </Link>
        </nav>
        <LocaleSwitch path={path} locale={locale} />
      </div>

      <header className="space-y-3">
        {position > 0 && (
          <p className="text-xs font-medium tracking-wide text-blue-600 dark:text-blue-400">
            {strings.chapterLabel(position)}
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

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mb-10" />

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

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <ChapterNav slug={article.slug} locale={locale} />
      <Disclaimer locale={locale} />
    </main>
  );
}
