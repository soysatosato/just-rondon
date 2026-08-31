import Link from "next/link";
import { CommentTargetType } from "@prisma/client";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "@/lib/jsonld";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideNotes from "@/components/guides/GuideNotes";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import GuideSources from "@/components/guides/GuideSources";
import MealDealPrices from "@/components/food/MealDealPrices";
import PageCommentSection, {
  type PageCommentItem,
} from "@/components/comments/PageCommentSection";
import {
  FOOD_BASE,
  FOOD_CATEGORY_LABELS,
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

  // navLabel が無い記事は見出しをそのまま出す(食費6本はすべて持つ)。
  const navSections = article.sections.map((sec) => ({
    id: sec.id,
    navLabel: sec.navLabel ?? sec.title,
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={foodGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={foodGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs path="/food" current={meta?.label ?? article.title} />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {article.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={article.dataAsOf}
            updatedAt={article.updatedAt}
          />
        </div>
        {/*
          audience は「この記事は誰のものか」を summary より先に言う。
          ハブの状況カードもここを読むので、文言は1つしかない。
        */}
        <p className="mt-4 text-sm font-semibold text-sky-700 dark:text-sky-400">
          {article.audience}
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {article.summary}
        </p>
      </header>

      {/*
        要点。節約の記事は「結局いくら浮くのか」を先に確定させたい読者が多いので、
        本文より前に置く。

        以前は罫線で仕切った灰色の label/value 表だった。見た目が仕様書に寄っていて、
        金額が本文と同じ大きさで並ぶため、いちばん拾いたい数字が沈んでいた。
        医療ガイドと同じく2列のグリッドに開き、value は MarkdownBody を通すので
        金額だけ強調できる。
      */}
      {article.atAGlance && article.atAGlance.length > 0 && (
        <section className="mt-8 mb-8 rounded-xl border border-gray-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-base font-bold">要点</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {article.atAGlance.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {fact.label}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                  <MarkdownBody>{fact.value}</MarkdownBody>
                </dd>
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

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      {/*
        固定の目次ではなく追従ナビ。食費の記事はレジや棚の前で開かれ、
        「値引きの時刻」「どの組み合わせが得か」へ直接飛ぶ使われ方をするので、
        そのたびに冒頭へ戻らせない。
      */}
      <GuideSectionNav sections={navSections} />

      <div className="space-y-8">
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

              {/* 定型パネルは本文より前。数字を見てから解説を読む順序にする。 */}
              {section.panel === "meal-deal-prices" && (
                <MealDealPrices asOf={article.dataAsOf} />
              )}

              <MarkdownBody>{section.body}</MarkdownBody>

              {section.tips && section.tips.length > 0 && (
                <GuideNotes items={section.tips} />
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

      {/*
        ほかのガイド。以前は blurb つきのカードを5枚並べていて、
        どの記事の末尾にも同じ長さの尾がついていた。ハブが状況から
        選ばせる形になったので、ここは索引に徹する。
      */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの食費節約ガイド</h2>
        <ul className="mt-4 divide-y divide-gray-200 dark:divide-neutral-800">
          {relatedGuides.map((g) => (
            <li key={g.slug}>
              <Link
                href={foodGuidePath(g.slug)}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 transition hover:text-sky-700 dark:hover:text-sky-400"
              >
                <span className="text-sm font-semibold">{g.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {FOOD_CATEGORY_LABELS[g.category]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
