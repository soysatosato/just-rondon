import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import GuideSources from "@/components/guides/GuideSources";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "../../jsonld";
import GuideAttractionCards from "../GuideAttractionCards";
import {
  travelGuideArticleJsonLd,
  travelGuideBreadcrumbJsonLd,
  travelGuidePath,
  type TravelGuideMetaSource,
} from "../guides";
import { itineraryVariantPath, itineraryVariants } from "../itinerary-variants";
import VariantBlocks from "./VariantBlocks";
import type { VariantSection } from "./blocks";
import type {
  GuideFaqItem,
  GuideRelatedLink,
  GuideSourceLink,
} from "@/components/guides/types";

const PARENT = { name: "ロンドン モデルコース（1〜5日）", slug: "itinerary" };

export type VariantMeta = TravelGuideMetaSource & {
  engTitle: string;
  summary: string;
  dataAsOf: string;
};

/**
 * モデルコースの分岐版3本(雨の日・子連れ・乗り継ぎ)の共通レイアウト。
 *
 * トップレベルの8本と違い、この3本は「制約付きの1日プラン」という
 * 同じ種類の文書なので、1つのレイアウトを共有してよい。中身の形は
 * blocks.ts の語彙で節ごとに変える。
 *
 * 親(itinerary)へ戻る導線と兄弟の分岐版へのカードは、旧
 * TravelGuideLayout の parent / childGuides と同じ位置・同じ役割で残す。
 * 分岐版を読んでいる人が次に見たいのは同じ分岐の別パターンか親であって、
 * トップレベルのガイド8本ではないため、「ほかの旅行ガイド」は出さない。
 */
export default function VariantLayout({
  meta,
  lead,
  sections,
  faq,
  sources,
  relatedLinks,
  attractionSlugs,
}: {
  meta: VariantMeta;
  /** 冒頭のリード。markdown。 */
  lead: string;
  sections: VariantSection[];
  faq: GuideFaqItem[];
  sources: GuideSourceLink[];
  relatedLinks: GuideRelatedLink[];
  attractionSlugs?: string[];
}) {
  const pageUrl = `${SITE_URL}${travelGuidePath(meta.slug)}`;
  const variant = itineraryVariants.find(
    (v) => `itinerary/${v.slug}` === meta.slug
  );
  const siblings = itineraryVariants.filter((v) => v !== variant);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(meta, PARENT)} />
      <JsonLd data={travelGuideArticleJsonLd(meta)} />
      <JsonLd data={faqPageJsonLd(faq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[{ label: PARENT.name, href: `/sightseeing/${PARENT.slug}` }]}
        current={variant?.label ?? meta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {meta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness dataAsOf={meta.dataAsOf} updatedAt={meta.updatedAt} />
        </div>
        <div className="mt-6">
          <MarkdownBody>{lead}</MarkdownBody>
        </div>
      </header>

      {/*
        ナビに渡すのは id と navLabel だけ。VariantSection をそのまま渡すと
        blocks(本文の markdown)ごとクライアント向けの RSC ペイロードに
        直列化され、記事1本ぶんの本文がページに二重で載る。
      */}
      <GuideSectionNav
        sections={sections.map((s) => ({ id: s.id, navLabel: s.navLabel }))}
      />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-20">
            <h2 className="mb-1 flex items-baseline gap-2.5 text-xl font-bold text-gray-900 dark:text-gray-100">
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {i + 1}
              </span>
              {s.label}
            </h2>
            {s.subtitle && (
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {s.subtitle}
              </p>
            )}
            <div className={s.subtitle ? "" : "mt-4"}>
              <VariantBlocks blocks={s.blocks} />
            </div>
          </section>
        ))}
      </div>

      {attractionSlugs && attractionSlugs.length > 0 && (
        <GuideAttractionCards slugs={attractionSlugs} />
      )}

      <GuideFaq items={faq} />
      <GuideSources sources={sources} dataAsOf={meta.dataAsOf} />

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの分岐版</h2>
        <div className="mt-4 space-y-3">
          {siblings.map((v) => (
            <Link
              key={v.slug}
              href={itineraryVariantPath(v.slug)}
              className="block rounded-xl border border-gray-300 p-5 transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
            >
              <span className="block text-xs font-semibold text-emerald-600">
                {v.eyebrow}
              </span>
              <span className="mt-1 block text-base font-bold text-gray-900 dark:text-gray-100">
                {v.label}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {v.blurb}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={travelGuidePath(PARENT.slug)}
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              {PARENT.name}
            </Link>
          </li>
          {relatedLinks.map((link) => (
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
