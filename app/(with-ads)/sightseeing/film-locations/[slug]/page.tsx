import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MapPin,
  Train,
  Ticket,
  Lightbulb,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  filmWorkBreadcrumbJsonLd,
  filmWorkJsonLd,
  filmWorkPath,
  FILM_LOCATIONS_BASE,
} from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { filmWorks, getFilmWork } from "../data";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return filmWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props) {
  const work = getFilmWork(params.slug);

  if (!work) {
    return {
      title: "ロンドンのロケ地巡り | ジャスト・ロンドン",
      description:
        "ロンドンで撮影された映画・ドラマのロケ地を作品別に紹介します。",
      robots: { index: false, follow: true },
    };
  }

  return buildPageMetadata({
    path: filmWorkPath(work.slug),
    title: `${work.title}のロケ地巡り | ${work.spots.length}か所の行き方と見学の可否 | ジャスト・ロンドン`,
    titleSuffix: false,
    description: `${work.summary} 最寄り駅、公開状況、中に入れるかどうかまで含めて${work.spots.length}か所を紹介します。`,
    type: "article",
    keywords: work.keywords,
  });
}

function googleMapsUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

export default function FilmWorkPage({ params }: Props) {
  const work = getFilmWork(params.slug);

  if (!work) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:py-10 space-y-10">
      <JsonLd data={filmWorkBreadcrumbJsonLd(work)} />
      <JsonLd data={filmWorkJsonLd(work)} />

      <header>
        <p className="text-sm font-medium tracking-wide text-sky-600 dark:text-sky-300 mb-2">
          {work.eyebrow} · {work.years}
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          {work.title}のロケ地巡り
        </h1>
        <p className="text-sm text-muted-foreground italic mb-4">
          {work.engTitle} — {work.routeHint}
        </p>
        <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
          {work.lead.map((paragraph, i) => (
            <div
              key={i}
              className="prose dark:prose-invert max-w-full prose-sm sm:prose-base"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {paragraph}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </header>

      {work.note && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            {work.note}
          </p>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          掲載スポット
        </h2>
        <ul className="list-none space-y-3 border-l border-gray-300 dark:border-gray-700 pl-3">
          {work.spots.map((spot, idx) => (
            <li key={spot.slug} className="leading-tight relative pl-6">
              <span className="absolute left-0 text-gray-500 dark:text-gray-400 text-sm">
                {idx + 1}.
              </span>
              <a
                href={`#${spot.slug}`}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline text-sm font-medium"
              >
                {spot.name}
              </a>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {spot.scene}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {work.spots.map((spot, idx) => (
        <section
          key={spot.slug}
          id={spot.slug}
          className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-8 scroll-mt-20"
        >
          <div>
            <p className="text-xs font-medium tracking-wide text-sky-600 dark:text-sky-300 mb-1">
              {spot.scene}
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {idx + 1}. {spot.name}
            </h2>
            <p className="text-sm text-muted-foreground italic mt-1">
              {spot.engName}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-full prose-sm sm:prose-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {spot.body}
            </ReactMarkdown>
          </div>

          <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/60 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
              <div>
                <dt className="text-xs text-muted-foreground">エリア</dt>
                <dd className="text-gray-800 dark:text-gray-100">{spot.area}</dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Train className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <dt className="text-xs text-muted-foreground">最寄り駅</dt>
                <dd className="text-gray-800 dark:text-gray-100">
                  {spot.nearestStation}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:col-span-2">
              <Ticket className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <dt className="text-xs text-muted-foreground">見学の可否</dt>
                <dd className="text-gray-800 dark:text-gray-100">
                  {spot.access}
                </dd>
              </div>
            </div>

            {spot.tips && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Lightbulb className="h-4 w-4 shrink-0 text-violet-500 mt-0.5" />
                <div>
                  <dt className="text-xs text-muted-foreground">ひとこと</dt>
                  <dd className="text-gray-800 dark:text-gray-100">
                    {spot.tips}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={googleMapsUrl(spot.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300"
            >
              <MapPin className="h-4 w-4" />
              地図で見る
            </a>
            {spot.website && (
              <a
                href={spot.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300"
              >
                <ExternalLink className="h-4 w-4" />
                公式サイト
              </a>
            )}
          </div>

          {idx === 1 && (
            <div className="pt-2">
              <AdSenseUnit slot={AD_SLOTS.inArticle} />
            </div>
          )}
        </section>
      ))}

      <section className="border-t border-slate-200 dark:border-slate-700 pt-8 space-y-4">
        <h2 className="text-xl font-semibold">ほかの作品のロケ地</h2>
        <ul className="space-y-2 text-sm">
          {filmWorks
            .filter((w) => w.slug !== work.slug)
            .map((w) => (
              <li key={w.slug}>
                <Link
                  href={filmWorkPath(w.slug)}
                  className="text-sky-600 hover:underline dark:text-sky-300"
                >
                  {w.title}のロケ地
                </Link>
                <span className="text-muted-foreground"> — {w.routeHint}</span>
              </li>
            ))}
          <li>
            <Link
              href="/sightseeing/harry-potter"
              className="text-sky-600 hover:underline dark:text-sky-300"
            >
              ハリー・ポッターのロケ地
            </Link>
            <span className="text-muted-foreground"> — 市内 + スタジオツアー</span>
          </li>
          <li>
            <Link
              href={FILM_LOCATIONS_BASE}
              className="text-sky-600 hover:underline dark:text-sky-300"
            >
              ロケ地巡りガイド トップ
            </Link>
          </li>
        </ul>
      </section>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} />
    </div>
  );
}
