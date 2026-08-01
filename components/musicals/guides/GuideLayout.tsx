import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "../../jobs/MarkdownBody";
import GuideDisclaimer from "./GuideDisclaimer";
import {
  MUSICALS_BASE,
  articleJsonLd,
  breadcrumbJsonLd,
  guidePath,
  guides,
} from "./guides";
import type { MusicalGuideArticle } from "./types";
import { fetchTopMusicals } from "@/utils/actions/musicals";

export default async function GuideLayout({
  article,
}: {
  article: MusicalGuideArticle;
}) {
  const relatedGuides = guides.filter((g) => g.slug !== article.slug);
  const topMusicals = await fetchTopMusicals(3);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={breadcrumbJsonLd(article)} />
      <JsonLd data={articleJsonLd(article)} />

      <nav className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        <Link href={MUSICALS_BASE} className="hover:underline">
          ミュージカル
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

      {topMusicals.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">人気ミュージカルをチェック</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            観劇前にあらすじや曲を予習しておくと、当日の理解がぐっと深まります。
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topMusicals.map((m) => (
              <Link key={m.slug} href={`/musicals/${m.slug}`} className="block">
                <Card className="overflow-hidden bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                  <div className="relative h-28 w-full">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <span className="block text-sm font-semibold">
                      {m.name}
                    </span>
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

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <GuideDisclaimer />
    </main>
  );
}
