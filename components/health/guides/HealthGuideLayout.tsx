import Link from "next/link";
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
import { NHS_CONTACTS } from "@/lib/health/rates";
import {
  HEALTH_BASE,
  HEALTH_CATEGORY_LABELS,
  getHealthGuideMeta,
  healthGuideArticleJsonLd,
  healthGuideBreadcrumbJsonLd,
  healthGuidePath,
  healthGuides,
} from "./guides";
import type { HealthGuideArticle } from "./types";

export default function HealthGuideLayout({
  article,
}: {
  article: HealthGuideArticle;
}) {
  const relatedGuides = healthGuides.filter((g) => g.slug !== article.slug);
  const meta = getHealthGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${healthGuidePath(article.slug)}`;

  // navLabel が無い記事は見出しをそのまま出す(医療6本はすべて持つ)。
  const navSections = article.sections.map((sec) => ({
    id: sec.id,
    navLabel: sec.navLabel ?? sec.title,
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={healthGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={healthGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs path="/health" current={meta?.label ?? article.title} />

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
        <p className="mt-4 text-sm font-semibold text-sky-700 dark:text-sky-400">
          {article.audience}
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {article.summary}
        </p>
      </header>

      {/*
        緊急連絡先は全記事の最上部に固定で出す。
        体調が悪い人が目次を読んで該当記事を探す前提に立たない。
      */}
      <div className="mt-6 rounded-lg border border-red-300 bg-red-50/80 p-4 dark:border-red-900/60 dark:bg-red-950/25">
        <p className="text-sm font-bold text-red-800 dark:text-red-300">
          いま緊急なら
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          意識がない・呼吸が苦しい・大量出血・胸の痛みなど生命に関わる状態なら{" "}
          <strong>{NHS_CONTACTS.emergency}</strong>。
          緊急かどうか判断がつかないときは{" "}
          <strong>{NHS_CONTACTS.nonEmergency}</strong>（24時間・無料・通訳を頼めます）。
        </p>
      </div>

      {/*
        要点。医療の記事は「結局いくらかかって、何を持っていけばいいか」を
        最初に確定させたい読者が多いので、目次より前に置く。

        ビザ側と違って項目を型で固定していないのは、6本の要点に
        共通のスキーマが無いため。歯科の3バンド、111と999の使い分け、
        PPC の損益分岐は、並べて比べるものではなく、その記事だけの数字。
        灰色の label/value 表をやめたのは、すぐ上の緊急連絡先の枠と
        体裁が近く、どちらも同じ重さに見えていたから。
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
        固定の目次ではなく追従ナビにするのは、医療の記事が
        必要になった場面で開かれるため。薬局の前で「薬剤師の処方範囲」へ、
        受付で「断られたら」へと飛ぶので、そのたびに冒頭へ戻らせない。
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
        免責。医療情報は誤読が健康被害に直結するため、
        住まいガイドより一段強く「診断ではない」と明示する。
      */}
      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本記事は NHS の制度と手続きを説明する情報提供であり、医学的な助言・診断では
        ありません。症状の判断は必ず医療者に委ねてください。ここで扱う制度は
        イングランドのものです（スコットランド・ウェールズ・北アイルランドでは
        処方箋が無料であるなど、負担の仕組みが異なります）。患者負担額は毎年4月1日に
        改定されるため、受診前に NHS の公式ページで最新額をご確認ください。
      </p>

      {/*
        ほかのガイド。以前は blurb つきのカードを5枚並べていて、
        どの記事の末尾にも同じ長さの尾がついていた。ハブが状況から
        選ばせる形になったので、ここは索引に徹する。
      */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの医療ガイド</h2>
        <ul className="mt-4 divide-y divide-gray-200 dark:divide-neutral-800">
          {relatedGuides.map((g) => (
            <li key={g.slug}>
              <Link
                href={healthGuidePath(g.slug)}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 transition hover:text-sky-700 dark:hover:text-sky-400"
              >
                <span className="text-sm font-semibold">{g.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {HEALTH_CATEGORY_LABELS[g.category]}
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
              href={HEALTH_BASE}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              医療・NHS ガイド トップ
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
