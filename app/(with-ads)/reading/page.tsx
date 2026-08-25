export const revalidate = 60 * 60;

import Link from "next/link";
import type { Content } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import SectionHeader from "@/components/home/SectionHeader";
import ColumnCard from "@/components/column/ColumnCard";
import ModernBritainCard from "@/components/modern-britain/ModernBritainCard";
import BritishEnglishCard from "@/components/british-english/BritishEnglishCard";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import {
  fetchColumns,
  fetchModernBritainEntries,
  fetchBritishEnglishEntries,
} from "@/utils/actions/contents";
import { historyChapters, HISTORY_BASE } from "@/components/history/chapters";

const PAGE_PATH = "/reading";
const PAGE_NAME = "英国を読む";
const TITLE = "英国を読む｜コラム・時事論考・歴史・イギリス英語";
const DESCRIPTION =
  "旅行の実務情報の先にある、じっくり読むコンテンツをまとめました。イギリスの歴史や文化を掘り下げるコラム、最新ニュースを論じる時事論考、ローマ時代から現在までの通史、そしてイギリス英語の言い回し。旅の合間や暮らしのなかで読めるように、日々更新しています。";

export const metadata = buildPageMetadata({
  path: PAGE_PATH,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス コラム",
    "イギリス 歴史",
    "イギリス英語",
    "英国 時事",
    "英国のいま",
  ],
});

// アクセントカラーは各セクション自身の詳細ページ・ナビの色と揃える。
const ACCENTS = {
  violet: {
    badge: "bg-violet-600 hover:bg-violet-600",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-800",
    text: "text-violet-600 dark:text-violet-400",
    stripe: "bg-violet-500",
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  },
  indigo: {
    badge: "bg-indigo-600 hover:bg-indigo-600",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
    text: "text-indigo-600 dark:text-indigo-400",
    stripe: "bg-indigo-500",
    chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  amber: {
    badge: "bg-amber-600 hover:bg-amber-600",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
    text: "text-amber-700 dark:text-amber-500",
    stripe: "bg-amber-500",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  rose: {
    badge: "bg-rose-600 hover:bg-rose-600",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-800",
    text: "text-rose-600 dark:text-rose-400",
    stripe: "bg-rose-500",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
} as const;

type Accent = (typeof ACCENTS)[keyof typeof ACCENTS];

const SECTIONS = [
  {
    href: "/column",
    eyebrow: "Column",
    title: "コラム",
    description: "イギリスの歴史・文化・伝統をじっくり読み解きます。",
    accent: ACCENTS.violet,
  },
  {
    href: "/modern-britain",
    eyebrow: "Britain, Argued",
    title: "英国のいまを論じる",
    description: "最新の英国ニュースを出典付きで紹介し、背景まで掘り下げます。",
    accent: ACCENTS.indigo,
  },
  {
    href: HISTORY_BASE,
    eyebrow: "A History of Britain",
    title: "イギリスの歴史 全10章",
    description: "ローマ帝国のブリタニア征服からEU離脱まで、通史を辿ります。",
    accent: ACCENTS.amber,
  },
  {
    href: "/british-english",
    eyebrow: "British English",
    title: "イギリス英語",
    description: "現地の言い回しやスラングを、由来や使い方とあわせて紹介します。",
    accent: ACCENTS.rose,
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * トップ記事は「読み物3セクション(コラム・いまの英国・イギリス英語)の
 * 最新1本を日付順に並べ、その先頭」。歴史は日々更新されないので混ぜない。
 * セクションを跨いで最新順に並べることで、どのセクションを更新しても
 * ハブの前段が動き、「新しい読み物がある」ことが一目で伝わる。
 */
type Pick = {
  item: Content;
  href: string;
  sectionLabel: string;
  eyebrow: string;
  accent: Accent;
  /** イギリス英語だけ、見出しより英単語のほうが引きが強い */
  display: "title" | "engTitle";
};

function buildFeed(
  columns: Content[],
  modernBritain: Content[],
  britishEnglish: Content[]
): Pick[] {
  const groups: {
    items: Content[];
    base: string;
    sectionLabel: string;
    eyebrow: string;
    accent: Accent;
    display: Pick["display"];
  }[] = [
    {
      items: columns,
      base: "/column",
      sectionLabel: "コラム",
      eyebrow: "Column",
      accent: ACCENTS.violet,
      display: "title",
    },
    {
      items: modernBritain,
      base: "/modern-britain",
      sectionLabel: "英国のいまを論じる",
      eyebrow: "Britain, Argued",
      accent: ACCENTS.indigo,
      display: "title",
    },
    {
      items: britishEnglish,
      base: "/british-english",
      sectionLabel: "イギリス英語",
      eyebrow: "British English",
      accent: ACCENTS.rose,
      display: "engTitle",
    },
  ];

  return groups
    .flatMap(({ items, base, sectionLabel, eyebrow, accent, display }) =>
      items.slice(0, 2).map((item) => ({
        item,
        href: `${base}/${item.slug}`,
        sectionLabel,
        eyebrow,
        accent,
        display,
      }))
    )
    .sort((a, b) => b.item.createdAt.getTime() - a.item.createdAt.getTime());
}

function pickHeading(pick: Pick) {
  return pick.display === "engTitle" && pick.item.engTitle
    ? pick.item.engTitle
    : pick.item.title;
}

function readingHubCollectionJsonLd() {
  const url = `${SITE_URL}${PAGE_PATH}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "ja",
    hasPart: SECTIONS.map((s) => ({
      "@type": "CollectionPage",
      name: s.title,
      description: s.description,
      url: `${SITE_URL}${s.href}`,
    })),
  };
}

export default async function ReadingHubPage() {
  const [latestColumns, latestModernBritain, latestBritishEnglish] =
    await Promise.all([
      fetchColumns(),
      fetchModernBritainEntries(),
      fetchBritishEnglishEntries(),
    ]);

  const columnPicks = latestColumns.slice(0, 3);
  const modernBritainPicks = latestModernBritain.slice(0, 3);
  const britishEnglishPicks = latestBritishEnglish.slice(0, 3);
  const firstChapter = historyChapters[0];

  const feed = buildFeed(
    latestColumns,
    latestModernBritain,
    latestBritishEnglish
  );
  const [lead, ...rest] = feed;
  const alsoNew = rest.slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbJsonLd({ name: PAGE_NAME, path: PAGE_PATH })} />
      <JsonLd data={readingHubCollectionJsonLd()} />

      <BreadCrumbs name={PAGE_NAME} />

      <header className="mt-6 space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Reading Britain
        </p>
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          英国を読む
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          旅行ガイドだけでは伝えきれない、イギリスの歴史・文化・言葉の面白さを、
          旅の合間や暮らしのなかでじっくり読めるコンテンツにまとめました。
        </p>
      </header>

      {/* 前段は全セクション横断の最新記事。まず一本、いま読むべきものを出す。 */}
      {lead && (
        <section className="mt-8">
          <Link href={lead.href} className="group block">
            <Card
              className={`overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60 ${lead.accent.hoverBorder}`}
            >
              <div className={`h-1.5 w-full ${lead.accent.stripe}`} />
              <div className="grid gap-0 md:grid-cols-5">
                {lead.item.image && (
                  <div className="relative h-48 w-full md:order-last md:col-span-2 md:h-full md:min-h-[15rem]">
                    <img
                      src={lead.item.image}
                      alt={lead.item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      fetchPriority="high"
                      decoding="async"
                    />
                  </div>
                )}
                <CardContent
                  className={`p-5 sm:p-7 ${lead.item.image ? "md:col-span-3" : "md:col-span-5"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white ${lead.accent.badge}`}
                    >
                      最新記事
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${lead.accent.chip}`}
                    >
                      {lead.sectionLabel}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(lead.item.createdAt)}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight sm:text-2xl md:text-[28px]">
                    {pickHeading(lead)}
                  </h2>
                  {lead.display === "engTitle" && lead.item.engTitle && (
                    <p className="mt-1.5 text-sm font-semibold text-muted-foreground">
                      {lead.item.title}
                    </p>
                  )}

                  {lead.item.summary && (
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {lead.item.summary}
                    </p>
                  )}

                  <span
                    className={`mt-5 inline-block text-sm font-semibold transition-transform duration-200 group-hover:translate-x-0.5 ${lead.accent.text}`}
                  >
                    この記事を読む →
                  </span>
                </CardContent>
              </div>
            </Card>
          </Link>

          {/* トップ記事の次に新しいものを、セクション横断のまま3本。 */}
          {alsoNew.length > 0 && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {alsoNew.map((pick) => (
                <li key={`${pick.href}`}>
                  <Link href={pick.href} className="group block h-full">
                    <Card
                      className={`h-full border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60 ${pick.accent.hoverBorder}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pick.accent.chip}`}
                          >
                            {pick.sectionLabel}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(pick.item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm font-semibold leading-snug">
                          {pickHeading(pick)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 4区分への入り口。前段で1本読ませたあと、どこを深掘りするかを選んでもらう。 */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          4つの読み物から選ぶ
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="group block">
              <Card
                className={`h-full border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60 ${s.accent.hoverBorder}`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <span
                    className={`mt-1 h-10 w-1 shrink-0 rounded-full ${s.accent.stripe}`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${s.accent.text}`}
                    >
                      {s.eyebrow}
                    </p>
                    <h3 className="mt-1 text-base font-bold leading-snug tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      {/* コラム最新3件 */}
      <section className="mt-4">
        <SectionHeader
          eyebrow="Column"
          title="コラムの新着"
          description="イギリスの歴史・文化・伝統をじっくり読み解きます。"
          accentClassName={ACCENTS.violet.badge}
        />
        {columnPicks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {columnPicks.map((item) => (
              <ColumnCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">近日公開予定です。</p>
        )}
        <div className="mt-6 flex justify-center">
          <Link
            href="/column"
            className="text-sm font-semibold text-violet-600 hover:opacity-80 dark:text-violet-400"
          >
            コラムをすべて見る →
          </Link>
        </div>
      </section>

      {/* 英国のいまを論じる最新3件 */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="Britain, Argued"
          title="英国のいまを論じる、新着"
          description="最新の英国ニュースを出典付きで紹介し、背景・原因・社会への影響まで掘り下げます。"
          accentClassName={ACCENTS.indigo.badge}
        />
        {modernBritainPicks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {modernBritainPicks.map((item, i) => (
              <ModernBritainCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">近日公開予定です。</p>
        )}
        <div className="mt-6 flex justify-center">
          <Link
            href="/modern-britain"
            className="text-sm font-semibold text-indigo-600 hover:opacity-80 dark:text-indigo-400"
          >
            論考をすべて見る →
          </Link>
        </div>
      </section>

      {/* 歴史は日々更新される読み物ではないので、最新3件ではなく
          「全10章のうち第1章」を入口として1枚だけ見せる。 */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="A History of Britain"
          title="イギリスの歴史 全10章"
          description="ローマ帝国のブリタニア征服からEU離脱まで。今のロンドンがなぜこうなっているかを、通して辿ります。"
          accentClassName={ACCENTS.amber.badge}
        />
        <Link href={`${HISTORY_BASE}/${firstChapter.slug}`} className="block">
          <Card className="border-slate-200 bg-white shadow-sm transition hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-amber-800">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-500">
                  第{firstChapter.number}章
                </span>
                <span className="text-xs text-muted-foreground">
                  {firstChapter.period}
                </span>
              </div>
              <p className="mt-1.5 text-base font-semibold leading-snug sm:text-lg">
                {firstChapter.label}
              </p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {firstChapter.blurb}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-amber-700 dark:text-amber-500">
                第1章から読む →
              </span>
            </CardContent>
          </Card>
        </Link>
        <div className="mt-6 flex justify-center">
          <Link
            href={HISTORY_BASE}
            className="text-sm font-semibold text-amber-700 hover:opacity-80 dark:text-amber-500"
          >
            全10章の目次を見る →
          </Link>
        </div>
      </section>

      {/* イギリス英語最新3件 */}
      <section className="mt-12">
        <SectionHeader
          eyebrow="British English"
          title="イギリス英語、新着"
          description="現地の言い回しやスラングを、由来や使い方とあわせて紹介します。"
          accentClassName={ACCENTS.rose.badge}
        />
        {britishEnglishPicks.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {britishEnglishPicks.map((item, i) => (
              <BritishEnglishCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">近日公開予定です。</p>
        )}
        <div className="mt-6 flex justify-center">
          <Link
            href="/british-english"
            className="text-sm font-semibold text-rose-600 hover:opacity-80 dark:text-rose-400"
          >
            イギリス英語をすべて見る →
          </Link>
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-12" />
    </main>
  );
}
