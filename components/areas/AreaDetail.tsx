import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Content, ContentSection } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { areaFacts, areaTagLabel } from "@/lib/area-taxonomy";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import AttractionSpotRail, {
  type RailSpot,
} from "@/components/sightseeing/AttractionSpotRail";
import { AREA_SEARCH_TERMS } from "@/lib/hotels/booking-link";
import {
  areaGuidePath,
  areaGuideSlugs,
} from "@/components/sightseeing/areas/areas";
import type { AdjacentContent } from "@/utils/actions/contents";

// 太字は数字と地名の強調に使うので、色は付けず字面の太さだけで効かせる。
const proseClass =
  "prose prose-sm sm:prose-base max-w-full dark:prose-invert prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-foreground prose-li:marker:text-indigo-400 prose-table:text-sm";

// 本文はMarkdownで管理しているので、記法側では target を指定できない。
// 出典は警察・土地登記・国家統計局など外部なので、別タブで開く。
const markdownComponents = {
  // node は react-markdown が渡す内部プロパティ。DOMに流すと
  // node="[object Object]" という属性が出力されるので捨てる。
  a: ({
    href,
    children,
    node: _node,
    ...rest
  }: React.ComponentPropsWithoutRef<"a"> & { node?: unknown }) => {
    const isExternal = /^https?:\/\//.test(href ?? "");
    return (
      <a
        href={href}
        {...rest}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

type AreaWithSections = Content & { sections: ContentSection[] };

export default function AreaDetail({
  content,
  prev = null,
  next = null,
  spots = [],
}: {
  content: AreaWithSections;
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
  /** この街にある観光スポット(ContentAttraction)。無ければ枠ごと出ない。 */
  spots?: RailSpot[];
}) {
  const sections = content.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const facts = areaFacts(content);
  const hasFacts = Boolean(facts.borough || facts.zone || facts.access);

  /*
    宿の検索と半日ルートは、対応するエリアが既存ガイドにあるときだけ出す。
    Content.route に入れた宿エリアID(lib/area-taxonomy.ts)を突き合わせる。
    ブリクストンやペッカムのように宿ガイドに無い街も多いので、無ければ
    その行を黙って落とす。
  */
  const areaId = content.route?.trim() || null;
  const hasHotelArea = Boolean(areaId && AREA_SEARCH_TERMS[areaId]);
  const hasGuideRoute = Boolean(
    areaId && (areaGuideSlugs as string[]).includes(areaId),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <Breadcrumbs path="/reading/areas" current={content.title} />

      <header className="relative mt-6 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-background to-cyan-50 px-6 py-9 dark:border-indigo-900/50 dark:from-indigo-950/25 dark:via-background dark:to-cyan-950/15 sm:px-10 sm:py-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
        />

        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              {content.engTitle ?? "London Neighbourhood"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(content.createdAt)}
            </span>
          </div>

          <h1 className="text-xl font-bold leading-snug tracking-tight sm:text-3xl">
            {content.title}
          </h1>

          {/* 区・ゾーン・所要時間。読者が最初に確かめる3つで、
              本文を読まずに済ませたい人はここだけ見て帰る。 */}
          {hasFacts && (
            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs">
              {facts.borough && (
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground">行政区</dt>
                  <dd className="font-semibold">{facts.borough}</dd>
                </div>
              )}
              {facts.zone && (
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground">ゾーン</dt>
                  <dd className="font-semibold">{facts.zone}</dd>
                </div>
              )}
              {facts.access && (
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground">中心部から</dt>
                  <dd className="font-semibold">{facts.access}</dd>
                </div>
              )}
            </dl>
          )}

          {content.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:bg-slate-900/60 dark:text-indigo-300"
                >
                  {areaTagLabel(tag)}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {content.summary && (
        <div className="mt-8 rounded-2xl border-l-4 border-indigo-500 bg-muted/50 px-5 py-4">
          <div
            className={`${proseClass} prose-p:my-0 text-[15px] font-medium leading-relaxed`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {content.summary}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {content.image && (
        <div className="relative mt-8 h-56 w-full overflow-hidden rounded-2xl sm:h-72 md:h-80">
          <img
            src={content.image}
            alt={content.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      {content.mainText && (
        <section className={`mt-8 ${proseClass}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.inArticle} />
      </div>

      {/* 節は「由来 → 歴史 → いまの数字 → 歩き方」の順に並ぶ約束なので、
          通し番号を振る。時事論考と違って節ごとに性格が変わらないため、
          見た目は全節そろえて、番号だけで現在位置を示す。 */}
      <div className="mt-10 space-y-8">
        {sections.map((sec, i) => (
          <section
            key={sec.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-7"
          >
            <div className="mb-4 flex items-start gap-3">
              <span
                aria-hidden
                className="mt-1 h-8 w-1.5 shrink-0 rounded-full bg-indigo-500"
              />
              <div className="min-w-0">
                <span className="mb-1.5 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-lg font-bold leading-snug tracking-tight sm:text-2xl">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sec.subtitle}
                  </p>
                )}
              </div>
            </div>

            {sec.description && (
              <div className={proseClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {sec.description}
                </ReactMarkdown>
              </div>
            )}

            {sec.image && (
              <figure className="mt-5">
                <div className="relative h-52 w-full overflow-hidden rounded-xl sm:h-64">
                  <img
                    src={sec.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
                {sec.imageSummary && (
                  <figcaption className="mt-2 text-xs text-muted-foreground">
                    {sec.imageSummary}
                  </figcaption>
                )}
              </figure>
            )}
          </section>
        ))}
      </div>

      {/* この街にある観光スポットへ。読み終えた直後に置く。 */}
      <AttractionSpotRail
        heading="この街の観光スポット"
        description="街のなかにある場所の見どころ・料金・アクセスは観光ガイドにまとめています。"
        spots={spots}
      />

      {/* 実務のページへ渡す。街を読んで「泊まれるのか」「住めるのか」を
          考え始めた読者を、比較表と手続きのガイドに引き継ぐ。 */}
      {(hasHotelArea || hasGuideRoute) && (
        <section className="mt-10 rounded-2xl border border-slate-200 bg-muted/40 p-5 dark:border-slate-800 sm:p-7">
          <h2 className="text-base font-bold tracking-tight sm:text-lg">
            この街に泊まる・住む・歩く
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {hasHotelArea && (
              <li>
                <Link
                  href={`/sightseeing/hotels#${areaId}`}
                  className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                >
                  宿泊エリアとしての比較
                </Link>
                <span className="text-muted-foreground">
                  ——他エリアとの値段・治安・交通の比較と、宿の探し方
                </span>
              </li>
            )}
            {hasGuideRoute && (
              <li>
                <Link
                  href={areaGuidePath(areaId as string)}
                  className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                >
                  半日で歩く回遊ルート
                </Link>
                <span className="text-muted-foreground">
                  ——このエリアを歩く順路と所要時間
                </span>
              </li>
            )}
            <li>
              <Link
                href="/housing/where-to-live"
                className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
              >
                住むエリアの選び方
              </Link>
              <span className="text-muted-foreground">
                ——家賃の相場感と、内見から契約までの実務
              </span>
            </li>
          </ul>
        </section>
      )}

      <div className="mt-10">
        <AdjacentContentNav
          basePath="/reading/areas"
          prev={prev}
          next={next}
          accent="indigo"
        />
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 px-6 py-7 text-center dark:border-indigo-900/60 dark:bg-indigo-950/20">
        <p className="text-sm font-bold">もう一つの街を、読む。</p>
        <Link
          href="/reading/areas"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          ← 街の一覧へ
        </Link>
      </div>
    </div>
  );
}
