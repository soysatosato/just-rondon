import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "../MarkdownBody";
import GuideDisclaimer from "./GuideDisclaimer";
import {
  JOBS_BASE,
  articleJsonLd,
  breadcrumbJsonLd,
  guidePath,
  guides,
} from "./guides";
import type { JobGuideArticle } from "./types";

export default function GuideLayout({ article }: { article: JobGuideArticle }) {
  const relatedGuides = guides.filter((g) => g.slug !== article.slug);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={breadcrumbJsonLd(article)} />
      <JsonLd data={articleJsonLd(article)} />

      <nav className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        <Link href={JOBS_BASE} className="hover:underline">
          お仕事・労働問題
        </Link>
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

      <section className="mt-12">
        <h2 className="text-lg font-semibold">関連ガイド</h2>
        <div className="mt-4 space-y-3">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={guidePath(g.slug)} className="block">
              <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                <CardContent className="p-5">
                  <span className="block text-base font-semibold">
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
      </section>

      <div className="mt-6 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/jobs/service-charges"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              英国サービスチャージ完全ガイド｜Tipping Act 2023と従業員の権利
            </Link>
          </li>
          <li>
            <Link
              href="/jobs/service-charges/case-story"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              サービスチャージ未払いで審判所に申立てた記録（実体験）
            </Link>
          </li>
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <GuideDisclaimer />
    </main>
  );
}
