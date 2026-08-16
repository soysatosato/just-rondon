import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideSources from "@/components/guides/GuideSources";
import GuideToc from "@/components/guides/GuideToc";
import { SITE_URL } from "@/lib/seo";
import {
  MUSICALS_BASE,
  MUSICAL_GUIDE_CATEGORY_LABELS,
  MUSICAL_GUIDE_CATEGORY_ORDER,
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  getGuideMeta,
  guidePath,
  guidesByCategory,
} from "./guides";
import type { MusicalGuideArticle } from "./types";
import { fetchTopMusicals } from "@/utils/actions/musicals";

export default async function GuideLayout({
  article,
}: {
  article: MusicalGuideArticle;
}) {
  const meta = getGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${guidePath(article.slug)}`;
  const topMusicals = await fetchTopMusicals(3);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={breadcrumbJsonLd(article)} />
      <JsonLd data={articleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <nav className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        <Link href={MUSICALS_BASE} className="hover:underline">
          ミュージカル
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-700 dark:text-gray-300">
          {meta?.label ?? article.title}
        </span>
      </nav>

      <header className="space-y-3">
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
        <GuideFreshness
          dataAsOf={article.dataAsOf}
          updatedAt={article.updatedAt}
        />
      </header>

      <Separator className="my-6" />

      {article.atAGlance && article.atAGlance.length > 0 && (
        <section className="mb-8 overflow-hidden rounded-lg border border-gray-300 dark:border-neutral-700">
          <h2 className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800">
            要点
          </h2>
          <dl className="divide-y divide-gray-200 dark:divide-neutral-700">
            {article.atAGlance.map((fact) => (
              <div
                key={fact.label}
                className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
              >
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                  {fact.label}
                </dt>
                <dd className="text-sm leading-relaxed">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {article.mainText && (
        <section className="mb-8">
          <MarkdownBody>{article.mainText}</MarkdownBody>
        </section>
      )}

      <GuideToc sections={article.sections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="mt-8 space-y-8">
        {article.sections.map((section, i) => (
          <Card
            key={section.id}
            id={section.id}
            className="scroll-mt-24 border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <CardContent className="space-y-2 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {i + 1}. {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {section.subtitle}
                </p>
              )}
              <MarkdownBody>{section.body}</MarkdownBody>

              {section.tips && section.tips.length > 0 && (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
                  <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
                    実務メモ
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
                    {section.tips.map((tip) => (
                      <li key={tip} className="leading-relaxed">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.callout && <GuideCallout {...section.callout} />}
            </CardContent>
          </Card>
        ))}
      </div>

      {article.faq && article.faq.length > 0 && <GuideFaq items={article.faq} />}

      {article.sources && article.sources.length > 0 && (
        <GuideSources sources={article.sources} dataAsOf={article.dataAsOf} />
      )}

      {/*
        ほかの記事はカテゴリ見出しごと出す。「チケットを取るまで」と
        「誰と観るか」では読者のいる段階が違うので、フラットに5枚並べると
        今の関心と関係ない記事が混ざる。
      */}
      <section className="mt-12 space-y-6">
        <h2 className="text-lg font-semibold">ほかの観劇ガイド</h2>
        {MUSICAL_GUIDE_CATEGORY_ORDER.map((category) => {
          const others = guidesByCategory(category).filter(
            (g) => g.slug !== article.slug,
          );
          if (others.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {MUSICAL_GUIDE_CATEGORY_LABELS[category]}
              </h3>
              {others.map((g) => (
                <Link key={g.slug} href={guidePath(g.slug)} className="block">
                  <Card className="border-gray-300 bg-white shadow-sm transition hover:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500">
                    <CardContent className="p-5">
                      <span className="block text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {g.eyebrow}
                      </span>
                      <span className="mt-1 block text-base font-semibold">
                        {g.label}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {g.blurb}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          );
        })}
      </section>

      {topMusicals.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">人気ミュージカルをチェック</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            観劇前にあらすじや曲を予習しておくと、当日の理解がぐっと深まります。
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {topMusicals.map((m) => (
              <Link key={m.slug} href={`/musicals/${m.slug}`} className="block">
                <Card className="overflow-hidden border-gray-300 bg-white shadow-sm transition hover:border-blue-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-blue-500">
                  <div className="relative h-28 w-full">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(min-width: 640px) 220px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <span className="block text-sm font-semibold">{m.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {m.engName}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={MUSICALS_BASE}
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンのミュージカル トップ
            </Link>
          </li>
          {article.relatedLinks?.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-blue-600 hover:opacity-80 dark:text-blue-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
