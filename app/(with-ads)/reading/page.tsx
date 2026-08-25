export const revalidate = 60 * 60;

import Link from "next/link";
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
  },
  indigo: {
    badge: "bg-indigo-600 hover:bg-indigo-600",
    hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-800",
  },
  amber: {
    badge: "bg-amber-600 hover:bg-amber-600",
    hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
  },
  rose: {
    badge: "bg-rose-600 hover:bg-rose-600",
    hoverBorder: "hover:border-rose-300 dark:hover:border-rose-800",
  },
} as const;

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbJsonLd({ name: PAGE_NAME, path: PAGE_PATH })} />
      <JsonLd data={readingHubCollectionJsonLd()} />

      <BreadCrumbs name={PAGE_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          英国を読む
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          旅行ガイドだけでは伝えきれない、イギリスの歴史・文化・言葉の面白さを、
          旅の合間や暮らしのなかでじっくり読めるコンテンツにまとめました。
        </p>
      </header>

      {/* 4区分への入り口。まずどこから読むかを選んでもらう。 */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="block">
            <Card
              className={`h-full border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60 ${s.accent.hoverBorder}`}
            >
              <CardContent className="p-5">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white ${s.accent.badge}`}
                >
                  {s.eyebrow}
                </span>
                <h2 className="mt-3 text-lg font-bold leading-snug tracking-tight">
                  {s.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
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
