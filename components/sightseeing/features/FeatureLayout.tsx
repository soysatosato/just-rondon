import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import ExpandableText from "@/components/card/ExpandableText";
import { getSpotsBySlugs } from "@/utils/areas";
import {
  featureBreadcrumbJsonLd,
  featureItemListJsonLd,
  getFeatureMeta,
} from "./features";
import type { FeatureArticle, FeatureItem } from "./types";

/**
 * 特集ページの共通レイアウト。types.ts の経緯を参照。
 *
 * 項目の描画を2通りに分けているのが、このレイアウトの要点。
 *
 *   - 詳細ページを持つ項目(ロンドン塔、エミレーツ・スタジアム等)は
 *     要約と料金・所要時間・最寄駅だけを出して詳細へ送る。旧実装は
 *     本文を丸ごと展開していたため、詳細ページと同じ文章が一覧にも
 *     並び、同じ内容が2つのURLにある状態になっていた。
 *   - 詳細ページを持たない項目(クルーズの各プラン、ロケ地の駅など)は
 *     本文をその場に出す。ここでしか読めない文章なので、要約に
 *     畳んでしまうと行き場が無くなる。
 *
 * どちらかは DB 照合で決める。データ側に「詳細ページの有無」を
 * 手で書かせると、スポットを公開・非公開にしたときに必ず食い違う。
 *
 * 詳細ページのある項目のカードだけを Link で包んでいる。本文を出す側を
 * 包まないのは、markdown 内のリンクが <a> の入れ子になるため——旧実装は
 * ReactMarkdown を含むカード全体を Link で包んでいて、これが起きていた。
 */
export default async function FeatureLayout({
  article,
}: {
  article: FeatureArticle;
}) {
  const meta = getFeatureMeta(article.slug);

  /*
   * href を明示していない項目だけ DB に当てる。明示してある項目
   * (christmas-markets の専用ルート等)は照合しても意味がない。
   */
  const lookupSlugs =
    article.lookupFacts === false
      ? []
      : article.items.filter((item) => !item.href).map((item) => item.slug);
  const facts = await getSpotsBySlugs(lookupSlugs);

  const hrefOf = (item: FeatureItem) =>
    item.href ?? (facts.has(item.slug) ? `/sightseeing/${item.slug}` : null);

  const hrefs = new Map<string, string>();
  for (const item of article.items) {
    const href = hrefOf(item);
    if (href) hrefs.set(item.slug, href);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <JsonLd data={featureBreadcrumbJsonLd(article)} />
      <JsonLd data={featureItemListJsonLd(article, hrefs)} />

      <Breadcrumbs path="/sightseeing" current={meta?.label ?? article.title} />

      {/* 見出しは左揃え。旧実装は6本とも中央揃えだったが、中央寄せの
          見出し+説明は導入が3段落あると読み出しの位置が毎行変わる。 */}
      <header className="mt-6 max-w-3xl">
        {meta && (
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className={`h-3 w-0.5 shrink-0 rounded-full ${meta.stripe}`} />
            {meta.eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {article.title}
        </h1>
        {article.engTitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            {article.engTitle}
          </p>
        )}
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {article.intro.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </header>

      <div className="my-8 flex justify-center">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      {article.notes && article.notes.length > 0 && (
        <section className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-neutral-700 dark:bg-neutral-800/60">
          {article.notes.map((note) => (
            <div key={note.title}>
              <h2 className="text-sm font-bold">{note.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {note.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* 目次。項目名が長いのでチップ状には並べず、2段の番号付きリストにする。 */}
      <nav aria-label="目次" className="mt-8">
        <h2 className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
          この特集で紹介する{article.items.length}件
        </h2>
        <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {article.items.map((item, idx) => (
            <li key={item.slug} className="flex gap-2 text-sm">
              <span className="shrink-0 tabular-nums text-gray-400">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <a
                href={`#${item.slug}`}
                className="min-w-0 text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-6">
        {article.items.map((item) => (
          <FeatureItemBlock
            key={item.slug}
            item={item}
            href={hrefOf(item)}
            fact={facts.get(item.slug) ?? null}
          />
        ))}
      </div>

      {article.related && article.related.length > 0 && (
        <section className="mt-14 rounded-lg border border-gray-200 p-5 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">あわせて読みたい</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {article.related.map((rel) => (
              <li key={rel.href}>
                <Link
                  href={rel.href}
                  className="text-blue-700 hover:underline dark:text-blue-400"
                >
                  {rel.label}
                </Link>
                {rel.note && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {" "}
                    — {rel.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

/*
 * 項目に添える補足(所要時間・場所・見どころ)の描画。
 *
 * ここを素のテキストで出すと、住所に埋めてある地図リンクが
 * [Victoria Embankment...](https://...) のまま記号で表示される。
 * 短い断片なので MarkdownBody は重すぎ、リンクと段落だけ定義する。
 */
const SECTION_MARKDOWN = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="[&+p]:mt-1">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
    >
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="ml-5 list-disc space-y-0.5">{children}</ul>
  ),
};

type Fact = Awaited<ReturnType<typeof getSpotsBySlugs>> extends Map<
  string,
  infer V
>
  ? V
  : never;

/** 料金・所要時間・最寄駅。埋まっている項目だけを中黒で繋ぐ。 */
function factLine(fact: Fact | null) {
  if (!fact) return null;
  const parts = [
    fact.priceAdult ? `料金 ${fact.priceAdult}` : null,
    fact.durationText ? `所要 ${fact.durationText}` : null,
    fact.nearestStation,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("・") : null;
}

function FeatureItemBlock({
  item,
  href,
  fact,
}: {
  item: FeatureItem;
  href: string | null;
  fact: Fact | null;
}) {
  const facts = factLine(fact) ?? item.factsText ?? null;
  const image = item.image ?? fact?.image ?? null;

  // 詳細ページがある項目。要約と事実だけ出して送り出す。
  if (href) {
    return (
      <article id={item.slug} className="scroll-mt-24">
        <Link
          href={href}
          className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-md dark:border-neutral-700 sm:flex-row"
        >
          {image && (
            <div className="relative aspect-[16/9] w-full shrink-0 bg-muted sm:aspect-auto sm:w-56">
              <img
                src={image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </div>
          )}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            {item.engTitle && (
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.engTitle}
              </p>
            )}
            <h2 className="mt-1 text-base font-bold leading-snug decoration-1 underline-offset-2 group-hover:underline">
              {item.title}
            </h2>
            {facts && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {facts}
              </p>
            )}
            {item.summary && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {item.summary}
              </p>
            )}
            <p className="mt-3 text-xs font-semibold text-blue-700 dark:text-blue-400">
              詳しく見る →
            </p>
          </div>
        </Link>
      </article>
    );
  }

  // 詳細ページが無い項目。ここが唯一の本文なので、その場に出す。
  return (
    <article
      id={item.slug}
      className="scroll-mt-24 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700"
    >
      {image && (
        <img
          src={image}
          alt={item.title}
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      )}
      <div className="p-4 sm:p-6">
        {item.engTitle && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.engTitle}
          </p>
        )}
        <h2 className="mt-1 text-base font-bold leading-snug sm:text-lg">
          {item.title}
        </h2>
        {item.summary && (
          <p className="mt-2 text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
            {item.summary}
          </p>
        )}
        {item.mainText && (
          <ExpandableText text={item.mainText} maxLines={4} className="mt-3" />
        )}

        {item.sections && item.sections.length > 0 && (
          <div className="mt-5 space-y-4">
            {item.sections.map((section) => (
              <div
                key={section.title}
                className="border-l-2 border-gray-300 pl-4 dark:border-neutral-600"
              >
                <h3 className="text-sm font-semibold">{section.title}</h3>
                {section.description && (
                  <div className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={SECTION_MARKDOWN}
                    >
                      {section.description}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {item.website && (
          <a
            href={item.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-xs font-semibold text-blue-700 hover:underline dark:text-blue-400"
          >
            公式サイト →
          </a>
        )}
      </div>
    </article>
  );
}
