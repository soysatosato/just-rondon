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
import GuideSources from "@/components/guides/GuideSources";
import GuideToc from "@/components/guides/GuideToc";
import ChapterNav from "./ChapterNav";
import {
  HISTORY_AS_OF,
  HISTORY_BASE,
  chapterArticleJsonLd,
  chapterBreadcrumbJsonLd,
  chapterPath,
  getChapterMeta,
} from "./chapters";
import type { HistoryChapter } from "./types";

/**
 * 章ページの見た目。TransportGuideLayout が下敷きだが、通史ゆえの差が3つある。
 *
 * - 冒頭が要約表ではなく「今も残る痕跡」。歴史の説明から入らず、
 *   読者が今日ロンドンで見ているものから入る。
 * - 年表を持つ。同時代の日本を併記できる列を用意している。
 * - 末尾が関連記事カードの羅列ではなく前後章ナビ。通史は順に読むため。
 *
 * GuideFreshness は使わない。あれは「運賃はいつ時点か」を示すもので、
 * 1066年の出来事に鮮度バッジを出しても意味がない。
 */
export default function HistoryChapterLayout({
  chapter,
}: {
  chapter: HistoryChapter;
}) {
  const meta = getChapterMeta(chapter.slug);
  const pageUrl = `${SITE_URL}${chapterPath(chapter.slug)}`;
  const hasJapanColumn = chapter.timeline.some((t) => t.japan);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={chapterBreadcrumbJsonLd(chapter)} />
      <JsonLd data={chapterArticleJsonLd(chapter)} />
      {chapter.faq && chapter.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(chapter.faq, pageUrl)} />
      )}

      <Breadcrumbs path="/history" current={meta?.label ?? chapter.title} />

      <header className="mt-6 space-y-3">
        <p className="text-xs font-bold tracking-wide text-amber-700 dark:text-amber-500">
          第{chapter.number}章 ・ {chapter.period}
        </p>
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {chapter.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {chapter.engTitle}
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {chapter.summary}
        </p>
      </header>

      <Separator className="my-6" />

      {/*
        「今も残っている痕跡」を最初に置く。
        通史を時系列で説明し始めると、読者にとっては学校の授業の再生になる。
        今日の疑問から入ると、そのあとの年号に理由がつく。
      */}
      <section className="mb-8 space-y-3">
        <h2 className="text-sm font-bold tracking-wide text-gray-600 dark:text-gray-400">
          今のロンドンに残っているもの
        </h2>
        <div className="space-y-3">
          {chapter.legacyToday.map((legacy) => (
            <div
              key={legacy.question}
              className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/25 sm:p-5"
            >
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {legacy.question}
              </p>
              <div className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <MarkdownBody>{legacy.answer}</MarkdownBody>
              </div>
            </div>
          ))}
        </div>
      </section>

      {chapter.mainText && (
        <section className="mb-8">
          <MarkdownBody>{chapter.mainText}</MarkdownBody>
        </section>
      )}

      <GuideToc sections={chapter.sections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="mt-8 space-y-8">
        {chapter.sections.map((section, i) => (
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
                    覚えておくと効くこと
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

      {/* 年表。章の範囲だけを持たせているので、通史全体の年表にはしない。 */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold">この章の年表</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-neutral-700">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left dark:bg-neutral-800">
                <th className="whitespace-nowrap px-4 py-2 font-semibold">年</th>
                <th className="px-4 py-2 font-semibold">出来事</th>
                {hasJapanColumn && (
                  <th className="px-4 py-2 font-semibold">同じころの日本</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {chapter.timeline.map((entry) => (
                <tr key={`${entry.year}-${entry.event}`}>
                  <td className="whitespace-nowrap px-4 py-3 align-top font-semibold text-amber-700 dark:text-amber-500">
                    {entry.year}
                  </td>
                  <td className="px-4 py-3 align-top leading-relaxed">
                    {entry.event}
                  </td>
                  {hasJapanColumn && (
                    <td className="px-4 py-3 align-top leading-relaxed text-gray-600 dark:text-gray-400">
                      {entry.japan ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/*
        このセクションの存在理由。
        読める通史はWebに山ほどあるが、立てる場所を持つものは無い。
        /museums・/sightseeing への送客もここが担う。
      */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold">この章に立てる場所</h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          この時代の物証が、今も実際に見られる場所です。復元やレプリカではなく、
          当時のものが残っている地点だけを挙げています。
        </p>
        <div className="space-y-3">
          {chapter.whereToStand.map((place) => (
            <Card
              key={place.mapQuery}
              className="border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <CardContent className="space-y-2 p-5">
                <div>
                  <h3 className="text-base font-semibold">{place.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {place.engName}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {place.whatYouSee}
                </p>
                <dl className="grid gap-1 text-xs text-gray-600 dark:text-gray-400 sm:grid-cols-[5rem_1fr]">
                  <dt className="font-semibold">最寄り駅</dt>
                  <dd>{place.nearestStation}</dd>
                  <dt className="font-semibold">見学</dt>
                  <dd>{place.access}</dd>
                </dl>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      place.mapQuery
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                  >
                    地図で見る
                  </a>
                  {place.internalLink && (
                    <Link
                      href={place.internalLink.href}
                      className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                    >
                      {place.internalLink.label}
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {chapter.japanLink && (
        <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            同じころ、日本では
          </h2>
          <div className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <MarkdownBody>{chapter.japanLink}</MarkdownBody>
          </div>
        </section>
      )}

      {chapter.faq && chapter.faq.length > 0 && (
        <GuideFaq items={chapter.faq} />
      )}

      {chapter.sources && chapter.sources.length > 0 && (
        <GuideSources sources={chapter.sources} dataAsOf={HISTORY_AS_OF} />
      )}

      <ChapterNav slug={chapter.slug} />

      {chapter.relatedLinks && chapter.relatedLinks.length > 0 && (
        <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            関連ページ
          </h2>
          <ul className="space-y-2 text-sm">
            {chapter.relatedLinks.map((link) => (
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
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <p className="mt-8 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        <Link href={HISTORY_BASE} className="text-blue-600 dark:text-blue-400">
          イギリスの歴史 全10章
        </Link>
        {" "}の第{chapter.number}章です。
      </p>
    </main>
  );
}
