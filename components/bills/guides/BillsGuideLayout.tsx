import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideSectionCard from "@/components/guides/GuideSectionCard";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "@/lib/jsonld";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideNotes from "@/components/guides/GuideNotes";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import GuideSources from "@/components/guides/GuideSources";
import {
  BILLS_BASE,
  BILLS_CATEGORY_LABELS,
  getBillsGuideMeta,
  billsGuideArticleJsonLd,
  billsGuideBreadcrumbJsonLd,
  billsGuidePath,
  billsGuides,
} from "./guides";
import type { BillsGuideArticle } from "./types";
import { stripInlineMarkdown } from "@/lib/plain-text";

/**
 * 光熱費ガイドの記事レイアウト。医療ガイドの骨格を踏襲する。
 *
 * 医療と違って最上部の緊急連絡枠は持たない。代わりに要点を目次より前に置く。
 * この記事群を開く読者は「結局いくらで、誰が払って、いつまでに何をするか」を
 * 確定させに来ていて、それが要点の3項目そのものだから。
 */
export default function BillsGuideLayout({
  article,
}: {
  article: BillsGuideArticle;
}) {
  const relatedGuides = billsGuides.filter((g) => g.slug !== article.slug);
  const meta = getBillsGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${billsGuidePath(article.slug)}`;

  const navSections = article.sections.map((sec) => ({
    id: sec.id,
    navLabel: sec.navLabel ?? sec.title,
  }));

  return (
    <div data-page-main className="mx-auto max-w-4xl sm:px-4 pt-4 pb-10 text-neutral-900 dark:text-neutral-100">
      <JsonLd data={billsGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={billsGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs path={BILLS_BASE} current={meta?.label ?? article.title} />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
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
        <p className="mt-4 text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          {stripInlineMarkdown(article.summary)}
        </p>
      </header>

      {article.atAGlance && article.atAGlance.length > 0 && (
        <section className="mt-8 mb-8 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-base font-bold">要点</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {article.atAGlance.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  {fact.label}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                  <MarkdownBody size="compact">{fact.value}</MarkdownBody>
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
        追従ナビにするのは、請求書を手に開かれる記事だから。
        「払えないとき」「解約」へ直接飛ぶ読者を冒頭へ戻らせない。
      */}
      <GuideSectionNav sections={navSections} />

      <div className="space-y-8">
        {article.sections.map((section, i) => (
          <GuideSectionCard key={section.id} id={section.id}>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {i + 1}. {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {section.subtitle}
              </p>
            )}
            <MarkdownBody>{section.body}</MarkdownBody>

            {section.tips && section.tips.length > 0 && (
              <GuideNotes items={section.tips} />
            )}

            {section.callout && <GuideCallout {...section.callout} />}
          </GuideSectionCard>
        ))}
      </div>

      {article.faq && article.faq.length > 0 && (
        <GuideFaq items={article.faq} />
      )}

      {article.sources && article.sources.length > 0 && (
        <GuideSources sources={article.sources} dataAsOf={article.dataAsOf} />
      )}

      {/*
        免責。料金は四半期・年度ごとに動き、区や物件ごとにも違うので、
        「記事の数字は目安で、請求書と公式ページの数字が正」と明示する。
      */}
      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-neutral-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-neutral-300">
        本記事はイングランドの制度を説明する情報提供で、特定の事業者や料金プランを
        勧めるものではありません。ガス・電気の単価は3か月ごと、Council Tax・水道・
        TV Licence は毎年4月に改定され、Council Tax は区によっても大きく違います。
        実際の金額は、お手元の請求書と各機関の公式ページでご確認ください。
        特定の事業者との提携関係はありません。
      </p>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの光熱費・契約ガイド</h2>
        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
          {relatedGuides.map((g) => (
            <li key={g.slug}>
              <Link
                href={billsGuidePath(g.slug)}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 transition hover:text-sky-700 dark:hover:text-sky-400"
              >
                <span className="text-sm font-semibold">{g.label}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {BILLS_CATEGORY_LABELS[g.category]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={BILLS_BASE}
              className="text-link hover:opacity-80"
            >
              光熱費・生活の契約ガイド トップ
            </Link>
          </li>
          {article.relatedLinks?.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-link hover:opacity-80"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </div>
  );
}
