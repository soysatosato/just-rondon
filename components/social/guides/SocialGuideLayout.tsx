import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
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
import { SAFETY_CONTACTS } from "@/lib/social/facts";
import {
  SOCIAL_BASE,
  getSocialGuideMeta,
  socialGuideArticleJsonLd,
  socialGuideBreadcrumbJsonLd,
  socialGuidePath,
  socialGuides,
} from "./guides";
import type { SocialGuideArticle } from "./types";

export default function SocialGuideLayout({
  article,
}: {
  article: SocialGuideArticle;
}) {
  const relatedGuides = socialGuides.filter((g) => g.slug !== article.slug);
  const meta = getSocialGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${socialGuidePath(article.slug)}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={socialGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={socialGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs path="/social" current={meta?.label ?? article.title} />

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

      {/*
        安全の注意は恋愛カテゴリの記事にだけ出す。
        全記事に出すと警告に慣れて読み飛ばされるため、
        実際に危険が伴う文脈に限定して価値を保つ。
      */}
      {article.showSafetyNotice && (
        <div className="mt-6 rounded-lg border border-red-300 bg-red-50/80 p-4 dark:border-red-900/60 dark:bg-red-950/25">
          <p className="text-sm font-bold text-red-800 dark:text-red-300">
            身の危険を感じたら
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            危険が差し迫っているなら{" "}
            <strong>{SAFETY_CONTACTS.emergency}</strong>。 バーやパブなら、
            店員に <strong>「{SAFETY_CONTACTS.askForAngela}」</strong>{" "}
            と伝えると、事情を説明しなくても安全に店を出る手助けをしてくれます。
            つきまといが続いている場合は{" "}
            <Link
              href="/trouble/stalking-harassment"
              className="text-blue-700 underline hover:opacity-80 dark:text-blue-300"
            >
              専門の相談窓口
            </Link>
            があります。
          </p>
        </div>
      )}

      {/*
        記事の結論を、目次より前・本文より前に置く。
        この読者は緊急事態にはいないが、長く停滞していて
        記事を読み切る気力が落ちていることが多い。
        離脱しても結論だけは持ち帰れるようにする。
      */}
      {article.takeaways && article.takeaways.length > 0 && (
        <section
          aria-labelledby="takeaways"
          className="mt-6 rounded-lg border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25"
        >
          <h2
            id="takeaways"
            className="text-sm font-bold text-sky-900 dark:text-sky-200"
          >
            この記事の結論
          </h2>
          <ul className="mt-3 space-y-3">
            {article.takeaways.map((t) => (
              <li key={t.point} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {t.point}
                  </p>
                  {t.detail && (
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {t.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Separator className="my-6" />

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
                    実務メモ
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
        免責。人付き合いの話に「正解」を持たせないための断り。
        手続きの記事と違い、ここで書けるのは傾向でしかない。
      */}
      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本記事で書いているのは、ロンドンでよく見られる傾向と、
        その背景にある仕組みです。人付き合いの形は人それぞれで、
        ここに書いたとおりに進まないことのほうが普通です。
        当てはまらない相手に出会ったときは、記事ではなく目の前の相手を優先してください。
        マッチングアプリの料金や機能、イベントの日程は変更されることがあります。
      </p>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの出会い・人間関係ガイド</h2>
        <div className="mt-4 space-y-3">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={socialGuidePath(g.slug)} className="block">
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
              href={SOCIAL_BASE}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              出会いと人間関係ガイド トップ
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
