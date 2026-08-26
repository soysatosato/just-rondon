import Link from "next/link";
import { CommentTargetType } from "@prisma/client";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "@/lib/jsonld";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideSources from "@/components/guides/GuideSources";
import GuideToc from "@/components/guides/GuideToc";
import PageCommentSection, {
  type PageCommentItem,
} from "@/components/comments/PageCommentSection";
import {
  FOOD_BASE,
  FOOD_SECTION_NAME,
  foodGuideArticleJsonLd,
  foodGuideBreadcrumbJsonLd,
  foodGuidePath,
  foodGuides,
  getFoodGuideMeta,
} from "./guides";
import type { FoodGuideArticle } from "./types";

export default function FoodGuideLayout({
  article,
  comments,
}: {
  article: FoodGuideArticle;
  comments: PageCommentItem[];
}) {
  const relatedGuides = foodGuides.filter((g) => g.slug !== article.slug);
  const meta = getFoodGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${foodGuidePath(article.slug)}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={foodGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={foodGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <BreadCrumbs
        name={FOOD_SECTION_NAME}
        link="food"
        name2={meta?.label ?? article.title}
      />

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {article.engTitle}
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {article.summary}
        </p>
        <GuideFreshness
          dataAsOf={article.dataAsOf}
          updatedAt={article.updatedAt}
        />
      </header>

      <Separator className="my-6" />

      {/*
        要点表。節約の記事は「結局いくら浮くのか」を先に見せないと
        本文が読まれないため、目次より前に置く。
      */}
      {article.atAGlance && article.atAGlance.length > 0 && (
        <section className="mb-8 overflow-hidden rounded-lg border border-gray-300 dark:border-neutral-700">
          <h2 className="border-b border-gray-300 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 px-4 py-2 text-sm font-semibold">
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
            className="scroll-mt-24 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm"
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

              {section.tips && section.tips.length > 0 && (
                <div className="mt-5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 p-4">
                  <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
                    実践メモ
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 dark:text-gray-300 marker:text-gray-400">
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

      {article.faq && article.faq.length > 0 && (
        <GuideFaq items={article.faq} />
      )}

      {article.sources && article.sources.length > 0 && (
        <GuideSources sources={article.sources} dataAsOf={article.dataAsOf} />
      )}

      {/*
        免責。値引きの時刻・割引率・Meal Deal の対象商品は店舗ごとに違い、
        価格改定も頻繁なので、住まい編ほど強い文言は要らないが必ず添える。
      */}
      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本記事の価格・割引率・値引きの時刻は{article.dataAsOf}
        時点で確認したものです。Meal Deal
        の価格は年に1〜2回改定され、閉店前の値引きや対象商品は店舗ごとの裁量で運用されているため、
        記載どおりでない場合があります。最終的な価格は店頭・各社アプリでご確認ください。
      </p>

      <PageCommentSection
        targetType={CommentTargetType.FOOD_TIP}
        targetKey={article.slug}
        prompt={article.commentPrompt}
        heading="みんなの工夫"
        placeholder="実践している節約の工夫を教えてください"
        initialComments={comments}
      />

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの食費節約ガイド</h2>
        <div className="mt-4 space-y-3">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={foodGuidePath(g.slug)} className="block">
              <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-sky-400 dark:hover:border-sky-500">
                <CardContent className="p-5">
                  <span className="block text-xs font-semibold text-sky-600">
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
      </section>

      <div className="mt-6 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={FOOD_BASE}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              食費を抑えるコツ トップ
            </Link>
          </li>
          {article.relatedLinks?.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-blue-600 dark:text-blue-400 hover:opacity-80"
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
