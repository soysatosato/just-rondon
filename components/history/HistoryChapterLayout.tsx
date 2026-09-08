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
import GuideSources from "@/components/guides/GuideSources";
import GuideToc from "@/components/guides/GuideToc";
import ChapterNav from "./ChapterNav";
import ChapterProgress from "./ChapterProgress";
import {
  HISTORY_AS_OF,
  HISTORY_BASE,
  HISTORY_ERA_LABELS,
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
 * 頭を濃い面にしているのは、/history ハブの題字と対にするため。10章が
 * ひと続きの本であることは、章番号を小さく刷るより面ごと変えたほうが早い。
 * 検索から途中の章に落ちてきた読者にも、ここが第何章かが一目で分かる。
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
    <main className="mx-auto max-w-4xl px-4 py-8 text-gray-900 dark:text-gray-100 md:py-10">
      <JsonLd data={chapterBreadcrumbJsonLd(chapter)} />
      <JsonLd data={chapterArticleJsonLd(chapter)} />
      {chapter.faq && chapter.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(chapter.faq, pageUrl)} />
      )}

      <Breadcrumbs
        path="/history"
        current={meta?.label ?? chapter.title}
        className="mb-6"
      />

      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-8 text-white sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-amber-500/25 blur-3xl"
        />

        <div className="relative">
          <p className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
            A History of Britain
            {meta && (
              <>
                <span className="text-white/25">/</span>
                <span className="tracking-[0.2em] text-white/60">
                  {HISTORY_ERA_LABELS[meta.era]}
                </span>
              </>
            )}
          </p>

          <div className="mt-5 flex items-baseline gap-4">
            <span
              aria-hidden
              className="font-serif text-5xl font-black leading-none tabular-nums text-amber-400 sm:text-6xl"
            >
              {String(chapter.number).padStart(2, "0")}
            </span>
            <span className="font-serif text-sm tabular-nums text-white/50 sm:text-base">
              {chapter.period}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
            {chapter.title}
          </h1>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
            {chapter.engTitle}
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {chapter.summary}
          </p>

          <ChapterProgress current={chapter.number} />
        </div>
      </header>

      {/*
        「今も残っている痕跡」を最初に置く。
        通史を時系列で説明し始めると、読者にとっては学校の授業の再生になる。
        今日の疑問から入ると、そのあとの年号に理由がつく。
      */}
      <section className="mt-10">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
          Still here today
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight sm:text-xl">
          今のロンドンに残っているもの
        </h2>

        <div className="mt-4 space-y-3">
          {chapter.legacyToday.map((legacy) => (
            <div
              key={legacy.question}
              className="overflow-hidden rounded-2xl border border-amber-200 bg-white dark:border-amber-900/60 dark:bg-slate-900/70"
            >
              <p className="flex items-start gap-3 border-b border-amber-100 bg-amber-50/70 px-4 py-3 text-[15px] font-bold leading-snug dark:border-amber-950/60 dark:bg-amber-950/30 sm:px-5">
                <span
                  aria-hidden
                  className="shrink-0 font-serif text-xl leading-none text-amber-500/60"
                >
                  ?
                </span>
                {legacy.question}
              </p>
              <div className="px-4 py-3.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:px-5">
                <MarkdownBody>{legacy.answer}</MarkdownBody>
              </div>
            </div>
          ))}
        </div>
      </section>

      {chapter.mainText && (
        <section className="mt-8">
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

      {/*
        年表。章の範囲だけを持たせているので、通史全体の年表にはしない。

        表ではなく縦の並びにしている。列が2〜3しかない表は、狭い画面で
        横に溢れるか、年の列が潰れて折り返すかのどちらかにしかならない。
        年を左に立てて線でつなぐと、そのまま時間の流れとして読める。
      */}
      <section className="mt-12">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
          Timeline
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight sm:text-xl">
          この章の年表
        </h2>
        <p className="mt-1.5 font-serif text-xs tabular-nums text-muted-foreground">
          {chapter.period}
          {hasJapanColumn && "・同じころの日本つき"}
        </p>

        <ol className="relative mt-5 space-y-4 border-l border-amber-200 pl-5 dark:border-amber-900/60 sm:pl-6">
          {chapter.timeline.map((entry) => (
            <li key={`${entry.year}-${entry.event}`} className="relative">
              <span
                aria-hidden
                className="absolute -left-[1.55rem] top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-4 ring-background sm:-left-[1.8rem]"
              />
              <p className="font-serif text-sm font-bold tabular-nums text-amber-700 dark:text-amber-500">
                {entry.year}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{entry.event}</p>
              {entry.japan && (
                <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                  <span className="mr-1.5 font-bold">日本では</span>
                  {entry.japan}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/*
        このセクションの存在理由。
        読める通史はWebに山ほどあるが、立てる場所を持つものは無い。
        /museums・/sightseeing への送客もここが担う。
      */}
      <section className="mt-12">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
          Where to stand
        </p>
        <h2 className="mt-2 text-lg font-bold tracking-tight sm:text-xl">
          この章に立てる場所
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          この時代の物証が、今も実際に見られる場所です。復元やレプリカではなく、
          当時のものが残っている地点だけを挙げています。
        </p>

        <ol className="mt-5 grid gap-3 sm:grid-cols-2">
          {chapter.whereToStand.map((place, i) => (
            <li
              key={place.mapQuery}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex-1 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 font-serif text-[11px] font-bold tabular-nums text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold leading-snug tracking-tight">
                      {place.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {place.engName}
                    </p>
                  </div>
                </div>

                {/*
                  whatYouSee と access は本文に太字を含む。以前は素の文字列と
                  して出していたので「**事前予約推奨**」が生のまま見えていた。
                  マークダウンとして描くが、段落の既定の余白はここでは効かせない。
                */}
                <div className="mt-3 text-slate-700 dark:text-slate-300">
                  <MarkdownBody className="[&>p:first-child]:mt-0">
                    {place.whatYouSee}
                  </MarkdownBody>
                </div>

                <dl className="mt-3 space-y-1.5 text-xs leading-relaxed">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-bold text-amber-700 dark:text-amber-500">
                      最寄り
                    </dt>
                    <dd className="text-slate-600 dark:text-slate-400">
                      {place.nearestStation}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-bold text-amber-700 dark:text-amber-500">
                      見学
                    </dt>
                    <dd className="min-w-0 text-slate-600 dark:text-slate-400">
                      <MarkdownBody className="text-xs [&_p]:my-0">
                        {place.access}
                      </MarkdownBody>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-2.5 text-xs font-bold dark:border-slate-800 sm:px-5">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    place.mapQuery,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                >
                  地図で見る ↗
                </a>
                {place.internalLink && (
                  <Link
                    href={place.internalLink.href}
                    className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                  >
                    {place.internalLink.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {chapter.japanLink && (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60 sm:p-6">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            同じころ、日本では
          </h2>
          <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
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
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-6">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            関連ページ
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {chapter.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        <Link href={HISTORY_BASE} className="text-blue-600 dark:text-blue-400">
          イギリスの歴史 全10章
        </Link>
        {" "}の第{chapter.number}章です。
      </p>
    </main>
  );
}
