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
import {
  VISA_BASE,
  VISA_CATEGORY_LABELS,
  getVisaGuideMeta,
  visaGuideArticleJsonLd,
  visaGuideBreadcrumbJsonLd,
  visaGuidePath,
  visaGuides,
} from "./guides";
import VisaRouteFactsPanel from "./VisaRouteFactsPanel";
import type { VisaGuideArticle } from "./types";

export default function VisaGuideLayout({
  article,
}: {
  article: VisaGuideArticle;
}) {
  const relatedGuides = visaGuides.filter((g) => g.slug !== article.slug);
  const meta = getVisaGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${visaGuidePath(article.slug)}`;

  // navLabel が無い記事は見出しをそのまま出す(ビザ7本はすべて持つ)。
  const navSections = article.sections.map((sec) => ({
    id: sec.id,
    navLabel: sec.navLabel ?? sec.title,
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={visaGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={visaGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs path="/visa" current={meta?.label ?? article.title} />

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
        <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {article.audience}
        </p>
        <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {article.summary}
        </p>
      </header>

      {/*
        ルートの要件を、本文より先に。ビザ記事は本文が長く、読者が
        最初に確定させたいのは「使えるのか・いくらか・永住に効くか」で、
        そこは5ルートで同じ形をしている。
      */}
      <div className="mt-8">
        {meta?.routeFacts && <VisaRouteFactsPanel facts={meta.routeFacts} />}
      </div>

      {/*
        ルート固有の条件。共通の7項目は routeFacts が持つので、
        ここに残るのはこの記事にしか無い話だけ。
        MarkdownBody に通すのは、以前ここを素の文字列で描いていて
        6本の記事の ** が生のまま読者に出ていたため。
      */}
      {article.atAGlance && article.atAGlance.length > 0 && (
        <section className="mb-8 rounded-xl border border-gray-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-base font-bold">
            {meta?.routeFacts ? "このルート固有の条件" : "このガイドの要点"}
          </h2>
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
        固定の目次ではなく追従ナビにするのは、ビザ記事が申請作業の
        最中に開かれるため。書類を集めながら「必要書類」へ、
        銀行残高を見ながら「資金証明」へと往復する。
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
        免責。ビザは判断を誤ると入国拒否・将来の申請不利につながるため、
        旅行ガイドの「料金は変わります」より一段強い文言を出す。
      */}
      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本記事は情報提供を目的としたもので、法的助言ではありません。英国移民法は
        頻繁に改正され、個別の事情によって適用される規則が変わります。実際の申請にあたっては
        必ず GOV.UK の最新情報を確認し、複雑な事案（過去の却下歴・オーバーステイ・
        犯罪歴がある場合など）では OISC 登録アドバイザーまたは事務弁護士にご相談ください。
      </p>

      {/*
        ほかのガイド。以前は blurb つきのカードを7枚並べていて、
        どの記事の末尾にも同じ長さの尾がついていた。ハブが状況から
        選ばせる形になったので、ここは索引に徹する。スポンサーの
        要否と初期費用だけ添えるのは、その2つで候補が絞れるから。
      */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかのビザガイド</h2>
        <ul className="mt-4 divide-y divide-gray-200 dark:divide-neutral-800">
          {relatedGuides.map((g) => (
            <li key={g.slug}>
              <Link
                href={visaGuidePath(g.slug)}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 transition hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <span className="text-sm font-semibold">{g.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {VISA_CATEGORY_LABELS[g.category]}
                </span>
                {g.routeFacts && (
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {g.routeFacts.sponsor === "none"
                        ? "スポンサー不要"
                        : "スポンサー要"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-neutral-500">
                      {g.routeFacts.upfrontCost}
                    </span>
                  </>
                )}
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
              href={VISA_BASE}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              ビザガイド トップ（自分に必要なビザを診断する）
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
