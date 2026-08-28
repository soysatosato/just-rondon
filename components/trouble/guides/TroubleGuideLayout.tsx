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
import { EMERGENCY_CONTACTS } from "@/lib/trouble/contacts";
import {
  TROUBLE_BASE,
  getTroubleGuideMeta,
  troubleGuideArticleJsonLd,
  troubleGuideBreadcrumbJsonLd,
  troubleGuidePath,
  troubleGuides,
} from "./guides";
import type { TroubleGuideArticle } from "./types";

export default function TroubleGuideLayout({
  article,
}: {
  article: TroubleGuideArticle;
}) {
  const relatedGuides = troubleGuides.filter((g) => g.slug !== article.slug);
  const meta = getTroubleGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${troubleGuidePath(article.slug)}`;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd data={troubleGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={troubleGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs path="/trouble" current={meta?.label ?? article.title} />

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
        緊急連絡先は全記事の最上部に固定で出す。
        被害直後の読者が目次を読んで該当箇所を探す前提に立たない。

        101 を併記するのは、終わった盗難を 999 にかけて
        「緊急ではない」と切られる経験が多いため。
      */}
      <div className="mt-6 rounded-lg border border-red-300 bg-red-50/80 p-4 dark:border-red-900/60 dark:bg-red-950/25">
        <p className="text-sm font-bold text-red-800 dark:text-red-300">
          いま危険な状況なら
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          身に危険がある、犯人がまだその場にいる、けがをしたなら{" "}
          <strong>{EMERGENCY_CONTACTS.emergency}</strong>。
          すでに終わったことの通報は{" "}
          <strong>{EMERGENCY_CONTACTS.nonEmergency}</strong>
          （緊急でない警察の窓口）。銀行を名乗る不審な連絡は、いったん切って{" "}
          <strong>{EMERGENCY_CONTACTS.bankFraud}</strong> にかけ直します。
        </p>
      </div>

      {/*
        被害直後の手順。目次より前、本文より前に置く。
        このセクションの読者は「読みに来た人」ではなく「困っている人」なので、
        記事構造より先に手を動かす順番を渡す。
      */}
      {article.immediateSteps && article.immediateSteps.length > 0 && (
        <section
          aria-labelledby="immediate-steps"
          className="mt-6 rounded-lg border-2 border-sky-300 bg-sky-50/70 p-5 dark:border-sky-800 dark:bg-sky-950/25"
        >
          <h2
            id="immediate-steps"
            className="text-sm font-bold text-sky-900 dark:text-sky-200"
          >
            まず、この順番でやってください
          </h2>
          <ol className="mt-3 space-y-3">
            {article.immediateSteps.map((step, i) => (
              <li key={step.action} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white dark:bg-sky-500">
                  {i + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    <span className="mr-2 rounded bg-sky-200 px-1.5 py-0.5 text-xs font-bold text-sky-900 dark:bg-sky-900 dark:text-sky-200">
                      {step.timing}
                    </span>
                    {step.action}
                  </p>
                  {step.detail && (
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {step.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
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
        免責。手数料と窓口の運用は改定されるため、
        「ここを読んで終わりにしない」ことを明示する。
      */}
      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本記事は手続きの流れを説明する情報提供であり、法的な助言ではありません。
        警察・大使館・保険会社の運用や手数料は改定されることがあります
        （領事手数料は{" "}
        <span className="font-semibold">毎年4月1日</span>{" "}
        に改定されます）。実際に手続きをする前に、各機関の公式ページで最新の
        必要書類と金額をご確認ください。事件性のある被害や、身の安全に関わる
        状況では、まず警察に相談してください。
      </p>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかのトラブル対応ガイド</h2>
        <div className="mt-4 space-y-3">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={troubleGuidePath(g.slug)} className="block">
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
              href={TROUBLE_BASE}
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              トラブル対応ガイド トップ
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
