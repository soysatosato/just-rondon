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
import AreaWalkRoute from "./AreaWalkRoute";
import AreaSpotList from "./AreaSpotList";
import {
  AREAS_BASE,
  AREA_CATEGORY_LABELS,
  AREA_CATEGORY_ORDER,
  AREAS_SECTION_NAME,
  areaGuidePath,
  areaGuideArticleJsonLd,
  areaGuideBreadcrumbJsonLd,
  areaGuidesByCategory,
  getAreaMeta,
} from "./areas";
import type { AreaGuideArticle } from "./types";
import type { AreaSpot } from "@/utils/areas";

export default function AreaGuideLayout({
  article,
  spots,
  walkSpots,
}: {
  article: AreaGuideArticle;
  /** このエリアの全スポット。DB から。 */
  spots: AreaSpot[];
  /** 回遊ルートが参照するスポット。DB に無いものは含まれない。 */
  walkSpots: Map<string, AreaSpot>;
}) {
  const meta = getAreaMeta(article.slug);
  const pageUrl = `${SITE_URL}${areaGuidePath(article.slug)}`;

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={areaGuideBreadcrumbJsonLd(article)} />
      <JsonLd data={areaGuideArticleJsonLd(article)} />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <BreadCrumbs
        name="観光ガイド"
        link="sightseeing"
        name2={AREAS_SECTION_NAME}
        link2="sightseeing/areas"
        name3={meta?.label ?? article.title}
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
        要約表。エリアの記事では「最寄駅はどこで、何時間みておくか」が
        最初の関門なので、目次より前に置く。
      */}
      {article.atAGlance && article.atAGlance.length > 0 && (
        <section className="mb-8 overflow-hidden rounded-lg border border-gray-300 dark:border-neutral-700">
          <h2 className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800">
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

      {/*
        回遊ルートは目次より前。このセクションが記事の主役で、
        スポット一覧では代替できない部分なので、読者が最初に
        目にする位置に置く。
      */}
      {article.walk && (
        <AreaWalkRoute walk={article.walk} spots={walkSpots} />
      )}

      <GuideToc sections={article.sections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="mt-8 space-y-8">
        {article.sections.map((section, i) => (
          <Card
            key={section.id}
            id={section.id}
            className="scroll-mt-24 border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <CardContent className="space-y-2 p-4 sm:p-6">
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
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
                  <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
                    実務メモ
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
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

      {/* エリア内の全スポット。DB から引くので記事側の更新が要らない。 */}
      <AreaSpotList spots={spots} areaLabel={meta?.label ?? article.title} />

      {article.faq && article.faq.length > 0 && (
        <GuideFaq items={article.faq} />
      )}

      {article.sources && article.sources.length > 0 && (
        <GuideSources sources={article.sources} dataAsOf={article.dataAsOf} />
      )}

      {/*
        ほかのエリアはカテゴリ見出しごと出す。
        「中心部」と「少し足を延ばす」では移動時間の前提が違うので、
        フラットに6枚並べると滞在日数に対する判断がつかなくなる。
      */}
      <section className="mt-12 space-y-6">
        <h2 className="text-lg font-semibold">ほかのエリア</h2>
        {AREA_CATEGORY_ORDER.map((category) => {
          const areas = areaGuidesByCategory(category).filter(
            (a) => a.slug !== article.slug,
          );
          if (areas.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {AREA_CATEGORY_LABELS[category]}
              </h3>
              {areas.map((a) => (
                <Link key={a.slug} href={areaGuidePath(a.slug)} className="block">
                  <Card className="border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                    <CardContent className="p-5">
                      <span className="block text-xs font-semibold text-emerald-600">
                        {a.eyebrow}
                      </span>
                      <span className="mt-1 block text-base font-semibold">
                        {a.label}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {a.blurb}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          );
        })}
      </section>

      <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={AREAS_BASE}
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンのエリアガイド トップ
            </Link>
          </li>
          {article.relatedLinks?.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-blue-600 hover:opacity-80 dark:text-blue-400"
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
