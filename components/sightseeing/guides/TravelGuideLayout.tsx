import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "../jsonld";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideSources from "@/components/guides/GuideSources";
import GuideToc from "@/components/guides/GuideToc";
import {
  getTravelGuideMeta,
  itineraryItemListJsonLd,
  travelGuideArticleJsonLd,
  travelGuideBreadcrumbJsonLd,
  travelGuidePath,
  travelGuides,
} from "./guides";
import type { TravelGuideArticle } from "./types";

/** 記事末尾に並べる子ページのカード1枚ぶん。 */
export type TravelGuideChildLink = {
  href: string;
  eyebrow: string;
  label: string;
  blurb: string;
};

export default function TravelGuideLayout({
  article,
  parent,
  childGuides,
  childGuidesHeading = "この記事の分岐版",
  extraJsonLd,
}: {
  article: TravelGuideArticle;
  /** 子ページのとき、1段上のガイド。パンくずと戻り導線に使う。 */
  parent?: { name: string; slug: string };
  /** 親ページなら下にぶら下がる記事、子ページなら自分を含む兄弟の一覧。 */
  childGuides?: TravelGuideChildLink[];
  childGuidesHeading?: string;
  extraJsonLd?: object[];
}) {
  const meta = getTravelGuideMeta(article.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(article.slug)}`;
  const hasDaySections = article.sections.some((s) => /^day-\d+$/.test(s.id));

  /*
    子ページでは「ほかの旅行ガイド」(ETA・宿・交通…)を出さない。
    分岐版を読んでいる人が次に見たいのは同じ分岐の別パターンか親であって、
    トップレベルのガイド5本ではないため。代わりに兄弟ページを出す。
  */
  const siblings = parent
    ? (childGuides ?? []).filter((c) => c.href !== travelGuidePath(article.slug))
    : [];
  const relatedGuides = parent
    ? []
    : travelGuides.filter((g) => g.slug !== article.slug);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(article, parent)} />
      <JsonLd data={travelGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}
      {hasDaySections && <JsonLd data={itineraryItemListJsonLd(article)} />}
      {extraJsonLd?.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      {parent ? (
        <BreadCrumbs
          name="観光ガイド"
          link="sightseeing"
          name2={parent.name}
          link2={`sightseeing/${parent.slug}`}
          name3={meta?.label ?? article.title}
        />
      ) : (
        <BreadCrumbs
          name="観光ガイド"
          link="sightseeing"
          name2={meta?.label ?? article.title}
        />
      )}

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
            <CardContent className="p-4 sm:p-6 space-y-2">
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
        親では分岐版へ降りるカード、子では兄弟の分岐版へ移るカード。
        どちらも FAQ・出典の後、トップレベルのガイド一覧より前に置く。
      */}
      {!parent && childGuides && childGuides.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">{childGuidesHeading}</h2>
          <div className="mt-4 space-y-3">
            {childGuides.map((c) => (
              <GuideCard key={c.href} {...c} />
            ))}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">ほかの分岐版</h2>
          <div className="mt-4 space-y-3">
            {siblings.map((c) => (
              <GuideCard key={c.href} {...c} />
            ))}
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">ほかの旅行ガイド</h2>
          <div className="mt-4 space-y-3">
            {relatedGuides.map((g) => (
              <GuideCard
                key={g.slug}
                href={travelGuidePath(g.slug)}
                eyebrow={g.eyebrow}
                label={g.label}
                blurb={g.blurb}
              />
            ))}
          </div>
        </section>
      )}

      {(parent || (article.relatedLinks && article.relatedLinks.length > 0)) && (
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-4 sm:p-6 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            関連ページ
          </h2>
          <ul className="space-y-2 text-sm">
            {parent && (
              <li>
                <Link
                  href={travelGuidePath(parent.slug)}
                  className="text-blue-600 dark:text-blue-400 hover:opacity-80"
                >
                  {parent.name}
                </Link>
              </li>
            )}
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
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}

function GuideCard({ href, eyebrow, label, blurb }: TravelGuideChildLink) {
  return (
    <Link href={href} className="block">
      <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-emerald-400 dark:hover:border-emerald-500">
        <CardContent className="p-5">
          <span className="block text-xs font-semibold text-emerald-600">
            {eyebrow}
          </span>
          <span className="mt-1 block text-base font-semibold">{label}</span>
          <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {blurb}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
