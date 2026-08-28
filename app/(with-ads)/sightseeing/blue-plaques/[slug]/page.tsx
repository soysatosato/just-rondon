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
  plaqueAreaBreadcrumbJsonLd,
  plaqueAreaJsonLd,
  plaqueAreaPath,
  BLUE_PLAQUES_BASE,
} from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import ImageCredit from "@/components/shared/ImageCredit";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { plaqueAreas, getPlaqueArea, type Plaque } from "../data";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return plaqueAreas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const area = getPlaqueArea(params.slug);

  if (!area) {
    return {
      title: "ロンドンのブループラーク巡り | ジャスト・ロンドン",
      description:
        "English Heritage の公式ブループラークをエリア別に紹介します。",
      robots: { index: false, follow: true },
    };
  }

  return buildPageMetadata({
    path: plaqueAreaPath(area.slug),
    title: `${area.title}のブループラーク巡り | ${area.plaques.length}件の行き方と見学の可否 | ジャスト・ロンドン`,
    titleSuffix: false,
    description: `${area.summary} 最寄り駅、見学の可否まで含めて${area.plaques.length}件を紹介します。`,
    type: "article",
    keywords: area.keywords,
  });
}

function googleMapsUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
}

function PlaqueMedia({ plaque }: { plaque: Plaque }) {
  if (plaque.imageSource === "instagram" && plaque.instagramUrl) {
    return (
      <div>
        <InstagramEmbed url={plaque.instagramUrl} className="mx-auto max-w-md" />
      </div>
    );
  }

  if (plaque.image) {
    return (
      <div className="space-y-1.5">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
          <img
            src={plaque.image}
            alt={plaque.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
        <ImageCredit
          source={plaque.imageSource ?? null}
          credit={plaque.imageCredit ?? null}
          link={plaque.imageLink ?? null}
        />
      </div>
    );
  }

  return null;
}

export default function PlaqueAreaPage({ params }: Props) {
  const area = getPlaqueArea(params.slug);

  if (!area) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:py-10 space-y-10">
      <JsonLd data={plaqueAreaBreadcrumbJsonLd(area)} />
      <JsonLd data={plaqueAreaJsonLd(area)} />

      <Breadcrumbs path="/sightseeing/blue-plaques" current={area.title} />

      <header>
        <p className="text-sm font-medium tracking-wide text-sky-600 dark:text-sky-300 mb-2">
          {area.eyebrow}
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          {area.title}のブループラーク巡り
        </h1>
        <p className="text-sm text-muted-foreground italic mb-4">
          {area.engTitle} — {area.routeHint}
        </p>
        <div className="space-y-3 text-gray-700 dark:text-gray-300 leading-relaxed">
          {area.lead.map((paragraph, i) => (
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

      {area.note && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            {area.note}
          </p>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          掲載プラーク
        </h2>
        <ul className="list-none space-y-3 border-l border-gray-300 dark:border-gray-700 pl-3">
          {area.plaques.map((plaque, idx) => (
            <li key={plaque.slug} className="leading-tight relative pl-6">
              <span className="absolute left-0 text-gray-500 dark:text-gray-400 text-sm">
                {idx + 1}.
              </span>
              <a
                href={`#${plaque.slug}`}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline text-sm font-medium"
              >
                {plaque.name}
              </a>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {plaque.title}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {area.plaques.map((plaque, idx) => (
        <section
          key={plaque.slug}
          id={plaque.slug}
          className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-8 scroll-mt-20"
        >
          <div>
            <p className="text-xs font-medium tracking-wide text-sky-600 dark:text-sky-300 mb-1">
              {plaque.title} · {plaque.years}
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold">
              {idx + 1}. {plaque.name}
            </h2>
            <p className="text-sm text-muted-foreground italic mt-1">
              {plaque.engName}
            </p>
          </div>

          <PlaqueMedia plaque={plaque} />

          <div className="prose dark:prose-invert max-w-full prose-sm sm:prose-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {plaque.body}
            </ReactMarkdown>
          </div>

          <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/60 sm:grid-cols-2">
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 text-sky-500 mt-0.5" />
              <div>
                <dt className="text-xs text-muted-foreground">住所</dt>
                <dd className="text-gray-800 dark:text-gray-100">
                  {plaque.address}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Train className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <dt className="text-xs text-muted-foreground">最寄り駅</dt>
                <dd className="text-gray-800 dark:text-gray-100">
                  {plaque.nearestStation}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Ticket className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <dt className="text-xs text-muted-foreground">見学の可否</dt>
                <dd className="text-gray-800 dark:text-gray-100">
                  {plaque.access}
                </dd>
              </div>
            </div>

            {plaque.tips && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Lightbulb className="h-4 w-4 shrink-0 text-violet-500 mt-0.5" />
                <div>
                  <dt className="text-xs text-muted-foreground">ひとこと</dt>
                  <dd className="text-gray-800 dark:text-gray-100">
                    {plaque.tips}
                  </dd>
                </div>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href={googleMapsUrl(plaque.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300"
            >
              <MapPin className="h-4 w-4" />
              地図で見る
            </a>
            {plaque.website && (
              <a
                href={plaque.website}
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
        <h2 className="text-xl font-semibold">ほかのエリアのブループラーク</h2>
        <ul className="space-y-2 text-sm">
          {plaqueAreas
            .filter((a) => a.slug !== area.slug)
            .map((a) => (
              <li key={a.slug}>
                <Link
                  href={plaqueAreaPath(a.slug)}
                  className="text-sky-600 hover:underline dark:text-sky-300"
                >
                  {a.title}のブループラーク
                </Link>
                <span className="text-muted-foreground"> — {a.routeHint}</span>
              </li>
            ))}
          <li>
            <Link
              href={BLUE_PLAQUES_BASE}
              className="text-sky-600 hover:underline dark:text-sky-300"
            >
              ブループラーク巡りガイド トップ
            </Link>
          </li>
        </ul>
      </section>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} />
    </div>
  );
}
