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
import { BEYOND_FARE_BANDS } from "@/lib/beyond-london/rates";
import {
  BEYOND_BASE,
  BEYOND_CATEGORY_LABELS,
  BEYOND_CATEGORY_ORDER,
  beyondArticleJsonLd,
  beyondBreadcrumbJsonLd,
  beyondByCategory,
  beyondDestinationJsonLd,
  beyondPath,
  getBeyondMeta,
} from "./destinations";
import BeyondBreakEven from "./BeyondBreakEven";
import BeyondGettingThere from "./BeyondGettingThere";
import BeyondHighlights from "./BeyondHighlights";
import BeyondStayAndNight from "./BeyondStayAndNight";
import BeyondVerdict from "./BeyondVerdict";
import { isDestination, type BeyondArticle } from "./types";

/**
 * 行き先記事とレール実務記事の共通レイアウト。
 *
 * 並びは、読者が現地で決める順に合わせてある:
 *
 *   行くべきか(verdict) → なぜここか(mainText) → 行けるか(行き方)
 *   → 泊まるなら(宿と夜) → 何が見えるか(見どころ) → どう回るか(本文)
 *
 * 見どころを本文セクションより前に出しているのは、ロンドン外は
 * 読者が現地を全く知らないため。「何が見えるのか」を先に見せないと、
 * 4〜8本の本文セクションが何の話か分からないまま流れていく。
 * ページ唯一の写真がここにあるので、同型カードの連なりも分断される。
 */
export default function BeyondLayout({ article }: { article: BeyondArticle }) {
  const meta = getBeyondMeta(article.slug);
  const pageUrl = `${SITE_URL}${beyondPath(article.slug)}`;
  const destination = isDestination(article) ? article : null;

  // navLabel が無い記事は見出しをそのまま出す(この12本はすべて持つ)。
  const navSections = article.sections.map((s) => ({
    id: s.id,
    navLabel: s.navLabel ?? s.title,
  }));

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={beyondBreadcrumbJsonLd(article)} />
      <JsonLd data={beyondArticleJsonLd(article)} />
      {destination && (
        <JsonLd
          data={beyondDestinationJsonLd({
            slug: destination.slug,
            title: destination.title,
            engTitle: destination.engTitle,
            summary: destination.summary,
            county: destination.county,
          })}
        />
      )}
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={faqPageJsonLd(article.faq, pageUrl)} />
      )}

      <Breadcrumbs
        path="/beyond-london"
        current={meta?.label ?? article.title}
      />

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
        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {article.summary}
        </p>
      </header>

      {/*
        行き先記事は判断材料を先に出す。以前ここには atAGlance の
        灰色の表があり、6行のうち3行前後を下の「行き方」と
        「見どころ」が繰り返していた。
      */}
      {destination && (
        <div className="mt-8">
          <BeyondVerdict
            verdict={destination.verdict}
            meta={meta}
            county={destination.county}
          />
        </div>
      )}

      {/* レール実務記事の要点表。こちらは行き方の表と重複しない。 */}
      {article.kind === "railHowTo" && article.atAGlance && (
        <section className="mt-8 mb-8 overflow-hidden rounded-lg border border-gray-300 dark:border-neutral-700">
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

      {destination && (
        <BeyondGettingThere
          gettingThere={destination.gettingThere}
          onArrival={destination.onArrival}
          meta={meta}
        />
      )}

      {/*
        1泊圏は「どう行くか」の次に「どこに泊まって夜どうするか」が来る。
        見どころより先に決まる判断なので、この位置に置く。
      */}
      {destination?.stayAndNight && (
        <BeyondStayAndNight data={destination.stayAndNight} />
      )}

      {/* 損得記事は結論を同じ位置に置く。 */}
      {!destination && article.kind === "railHowTo" && article.breakEven && (
        <BeyondBreakEven data={article.breakEven} />
      )}

      {destination && <BeyondHighlights highlights={destination.highlights} />}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      {/*
        目次を固定の一覧ではなく追従ナビにしているのは、この記事が
        現地で開かれるため。城の入口で入場料の節へ、駅で切符の節へと
        飛ぶので、そのたびに冒頭へ戻らせない。
      */}
      <GuideSectionNav sections={navSections} />

      <div className="space-y-8">
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
        ほかの記事。以前は blurb つきのカードを11枚並べていて、
        どの記事の末尾にも同じ長さの尾がついていた。ハブを
        絞り込み式に作り直したので、ここは一覧ではなく索引に徹する。
        駅・所要・運賃だけを1行で出し、比較はハブでさせる。
      */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの行き先</h2>
        <div className="mt-4 space-y-5">
          {BEYOND_CATEGORY_ORDER.map((category) => {
            const items = beyondByCategory(category).filter(
              (d) => d.slug !== article.slug
            );
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {BEYOND_CATEGORY_LABELS[category]}
                </h3>
                <ul className="mt-2 divide-y divide-gray-200 dark:divide-neutral-800">
                  {items.map((d) => {
                    const fare = BEYOND_FARE_BANDS[d.slug];
                    return (
                      <li key={d.slug}>
                        <Link
                          href={beyondPath(d.slug)}
                          className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 transition hover:text-teal-700 dark:hover:text-teal-400"
                        >
                          <span className="text-sm font-semibold">
                            {d.label}
                          </span>
                          {d.fromStation && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {d.fromStation}
                            </span>
                          )}
                          {d.journeyTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {d.journeyTime}
                            </span>
                          )}
                          {fare && (
                            <span className="text-xs text-gray-400 dark:text-neutral-500">
                              Advance {fare.advanceFrom}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-8 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={BEYOND_BASE}
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              Beyond London トップ｜空いている時間から行き先を絞り込む
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
