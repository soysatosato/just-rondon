export const revalidate = 60 * 60;

import Link from "next/link";
import type { Content } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import {
  fetchColumns,
  fetchModernBritainEntries,
  fetchBritishEnglishEntries,
  fetchPopularReadingContents,
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

/**
 * カテゴリの見た目定義。色は各セクションの詳細ページ・ナビと揃える。
 * ハブ内では「どのセクションの記事か」を色だけで判別させるので、
 * 4色は最後まで一貫して使う。
 */
const CATEGORY = {
  column: {
    base: "/column",
    label: "コラム",
    eyebrow: "Column",
    blurb: "イギリスの歴史・文化・伝統をじっくり読み解きます。",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-600",
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    ring: "hover:border-violet-400 dark:hover:border-violet-700",
    glow: "from-violet-500/15",
  },
  "modern-britain": {
    base: "/modern-britain",
    label: "英国のいま",
    eyebrow: "Britain, Argued",
    blurb: "最新の英国ニュースを出典付きで紹介し、背景まで掘り下げます。",
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-600",
    chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    ring: "hover:border-indigo-400 dark:hover:border-indigo-700",
    glow: "from-indigo-500/15",
  },
  "british-english": {
    base: "/british-english",
    label: "イギリス英語",
    eyebrow: "British English",
    blurb: "現地の言い回しやスラングを、由来や使い方とあわせて紹介します。",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-600",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    ring: "hover:border-rose-400 dark:hover:border-rose-700",
    glow: "from-rose-500/15",
  },
} as const;

type CategoryKey = keyof typeof CATEGORY;

const HISTORY_STYLE = {
  label: "イギリスの歴史",
  eyebrow: "A History of Britain",
  text: "text-amber-700 dark:text-amber-500",
  bg: "bg-amber-600",
  chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  ring: "hover:border-amber-400 dark:hover:border-amber-700",
};

function isCategoryKey(value: string): value is CategoryKey {
  return value in CATEGORY;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** 「3日前」のような相対表記。新着であることを日付より強く伝える。 */
function relativeDays(date: Date, now: number) {
  const days = Math.floor((now - date.getTime()) / 86_400_000);
  if (days <= 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  return formatDate(date);
}

type Entry = {
  item: Content;
  href: string;
  cat: (typeof CATEGORY)[CategoryKey];
  /** イギリス英語は見出しより英単語のほうが引きが強い */
  isEnglish: boolean;
};

function toEntry(item: Content): Entry | null {
  if (!isCategoryKey(item.category)) return null;
  const cat = CATEGORY[item.category];
  return {
    item,
    href: `${cat.base}/${item.slug}`,
    cat,
    isEnglish: item.category === "british-english",
  };
}

function headingOf(entry: Entry) {
  return entry.isEnglish && entry.item.engTitle
    ? entry.item.engTitle
    : entry.item.title;
}

function readingHubCollectionJsonLd() {
  const url = `${SITE_URL}${PAGE_PATH}`;
  const parts = [
    ...Object.values(CATEGORY).map((c) => ({
      "@type": "CollectionPage" as const,
      name: c.label,
      description: c.blurb,
      url: `${SITE_URL}${c.base}`,
    })),
    {
      "@type": "CollectionPage" as const,
      name: "イギリスの歴史 全10章",
      description:
        "ローマ帝国のブリタニア征服からEU離脱まで、通史を辿ります。",
      url: `${SITE_URL}${HISTORY_BASE}`,
    },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "ja",
    hasPart: parts,
  };
}

export default async function ReadingHubPage() {
  const [columns, modernBritain, britishEnglish, popular] = await Promise.all([
    fetchColumns(),
    fetchModernBritainEntries(),
    fetchBritishEnglishEntries(),
    fetchPopularReadingContents(5),
  ]);

  const now = Date.now();

  // 「いま読まれている」。views 最大の1本を主役に据える。
  const popularEntries = popular
    .map(toEntry)
    .filter((e): e is Entry => e !== null);
  const lead = popularEntries[0];
  const ranked = popularEntries.slice(1, 5);

  // 「新着」。カテゴリを跨いで createdAt の降順。views とは別軸なので、
  // 主役と重複しても構わない（別の切り口で同じ記事が出るのは自然）。
  const timeline = [...columns, ...modernBritain, ...britishEnglish]
    .map(toEntry)
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => b.item.createdAt.getTime() - a.item.createdAt.getTime())
    .slice(0, 8);

  const firstChapter = historyChapters[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbJsonLd({ name: PAGE_NAME, path: PAGE_PATH })} />
      <JsonLd data={readingHubCollectionJsonLd()} />

      <Breadcrumbs path="/reading" />

      {/* 新聞の題字のように、罫線で挟んだヘッダ。 */}
      <header className="mt-6 border-y-2 border-foreground/80 py-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Reading Britain
            </p>
            <h1 className="mt-1.5 text-3xl font-bold leading-none tracking-tight md:text-5xl">
              英国を読む
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            ガイドブックが終わるところから、イギリスは面白くなる。
            <br className="hidden sm:block" />
            歴史を辿り、いまを論じ、言葉を味わう。
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          前段。左に「いま最も読まれている1本」、右に新着タイムライン。
          views と createdAt という別軸を横に並べることで、
          「定番から入る / 新しいものから入る」の二択をひと画面で見せる。
         ------------------------------------------------------------------ */}
      <section className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* 主役: views 最大 */}
        {lead && (
          <div className="min-w-0 lg:col-span-7">
            <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
              Most Read ・ いま最も読まれている
            </p>

            <Link href={lead.href} className="group block">
              <article
                className={`relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 ${lead.cat.ring}`}
              >
                {lead.item.image ? (
                  <div className="relative h-56 w-full sm:h-72">
                    <img
                      src={lead.item.image}
                      alt={lead.item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      fetchPriority="high"
                      decoding="async"
                    />
                    {/* 画像の上に見出しを重ねる。カード内に文字を置くより、
                        雑誌の表紙に近い密度が出る。 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${lead.cat.bg}`}
                        >
                          {lead.cat.label}
                        </span>
                        <span className="text-[11px] font-medium text-white/80">
                          {formatDate(lead.item.createdAt)}
                        </span>
                      </div>
                      <h2 className="mt-2.5 break-words text-xl font-bold leading-snug tracking-tight text-white drop-shadow sm:text-3xl">
                        {headingOf(lead)}
                      </h2>
                      {lead.isEnglish && lead.item.engTitle && (
                        <p className="mt-1 text-sm font-semibold text-white/85">
                          {lead.item.title}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`bg-gradient-to-br ${lead.cat.glow} to-transparent p-6`}
                  >
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${lead.cat.bg}`}
                    >
                      {lead.cat.label}
                    </span>
                    <h2 className="mt-3 break-words text-xl font-bold leading-snug tracking-tight sm:text-3xl">
                      {headingOf(lead)}
                    </h2>
                  </div>
                )}

                {lead.item.summary && (
                  <div className="p-5 sm:p-6">
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {lead.item.summary}
                    </p>
                    <span
                      className={`mt-4 inline-block text-sm font-bold transition-transform duration-200 group-hover:translate-x-1 ${lead.cat.text}`}
                    >
                      この記事を読む →
                    </span>
                  </div>
                )}
              </article>
            </Link>

            {/* 2〜5位。順位を数字で見せて、主役との連続性を出す。 */}
            {ranked.length > 0 && (
              <ol className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60">
                {ranked.map((entry, i) => (
                  <li key={entry.href} className="min-w-0">
                    <Link
                      href={entry.href}
                      className="group flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <span className="w-5 shrink-0 text-center text-lg font-black tabular-nums text-slate-300 dark:text-slate-700 sm:w-6">
                        {i + 2}
                      </span>
                      {/* 狭い画面ではチップと見出しを2段にする。1行に並べると
                          日本語の見出しが truncate で数文字しか残らない。 */}
                      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <span
                          className={`w-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${entry.cat.chip}`}
                        >
                          {entry.cat.label}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug line-clamp-2 sm:truncate">
                          {headingOf(entry)}
                        </span>
                      </span>
                      <span
                        className={`hidden shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100 sm:inline ${entry.cat.text}`}
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* 新着タイムライン: createdAt 降順、カテゴリ横断。
            縦線に沿って点を打つことで、一覧ではなく「更新の流れ」に見せる。 */}
        <div className={`min-w-0 ${lead ? "lg:col-span-5" : "lg:col-span-12"}`}>
          <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            Latest ・ 新着順
          </p>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
            <ul className="relative ml-1 space-y-4 border-l border-dashed border-slate-300 pl-5 dark:border-slate-700">
              {timeline.map((entry) => (
                <li key={entry.href} className="relative min-w-0">
                  <span
                    className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${entry.cat.bg}`}
                  />
                  <Link href={entry.href} className="group block min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold ${entry.cat.text}`}>
                        {entry.cat.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {relativeDays(entry.item.createdAt, now)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-foreground/70">
                      {headingOf(entry)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      {/* ------------------------------------------------------------------
          4つの読み物への入り口。カードを並べるのではなく、
          各セクションの最新1本を「窓」として見せることで、
          リンク集ではなく中身のプレビューにする。
         ------------------------------------------------------------------ */}
      <section>
        <div className="mb-5 border-b border-foreground/20 pb-2">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            4つの読み物
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(CATEGORY) as CategoryKey[]).map((key) => {
            const cat = CATEGORY[key];
            const items =
              key === "column"
                ? columns
                : key === "modern-britain"
                  ? modernBritain
                  : britishEnglish;
            const newest = items[0] ? toEntry(items[0]) : null;

            return (
              <Card
                key={key}
                className={`overflow-hidden border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60 ${cat.ring}`}
              >
                <CardContent className="p-0">
                  <Link
                    href={cat.base}
                    className="group block border-b border-slate-100 p-5 dark:border-slate-800"
                  >
                    <p
                      className={`break-words text-[10px] font-bold uppercase tracking-[0.2em] ${cat.text}`}
                    >
                      {cat.eyebrow}
                    </p>
                    <h3 className="mt-1 text-lg font-bold tracking-tight">
                      {cat.label}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {cat.blurb}
                    </p>
                  </Link>

                  {newest && (
                    <Link
                      href={newest.href}
                      className="group flex items-start gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      {newest.item.image && (
                        <img
                          src={newest.item.image}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-md object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          最新
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-sm font-semibold leading-snug">
                          {headingOf(newest)}
                        </span>
                      </span>
                    </Link>
                  )}

                  <Link
                    href={cat.base}
                    className={`block border-t border-slate-100 px-5 py-2.5 text-right text-xs font-bold dark:border-slate-800 ${cat.text}`}
                  >
                    {cat.label}をすべて見る →
                  </Link>
                </CardContent>
              </Card>
            );
          })}

          {/* 歴史だけは新着でも人気順でもなく「第1章から順に読む」ものなので、
              他の3つと同じ形にせず、全10章の並びそのものを見せる。 */}
          <Card
            className={`overflow-hidden border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60 md:col-span-2 ${HISTORY_STYLE.ring}`}
          >
            <CardContent className="p-0">
              <Link
                href={HISTORY_BASE}
                className="block border-b border-slate-100 p-5 dark:border-slate-800"
              >
                <p
                  className={`break-words text-[10px] font-bold uppercase tracking-[0.2em] ${HISTORY_STYLE.text}`}
                >
                  {HISTORY_STYLE.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight">
                  イギリスの歴史 全10章
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  ローマ帝国のブリタニア征服からEU離脱まで。今のロンドンがなぜこうなっているかを、通して辿ります。
                </p>
              </Link>

              {/* 章を横スクロールの帯にして、通史の長さを体感させる。 */}
              <div className="overflow-x-auto">
                <ol className="flex min-w-max gap-2 p-4">
                  {historyChapters.map((ch) => (
                    <li key={ch.slug}>
                      <Link
                        href={`${HISTORY_BASE}/${ch.slug}`}
                        className="group flex h-full w-40 flex-col rounded-lg border border-slate-200 p-3 transition hover:border-amber-400 hover:bg-amber-50/50 dark:border-slate-800 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
                      >
                        <span
                          className={`text-[10px] font-bold ${HISTORY_STYLE.text}`}
                        >
                          第{ch.number}章
                        </span>
                        <span className="mt-0.5 text-[10px] text-muted-foreground">
                          {ch.period}
                        </span>
                        <span className="mt-1.5 line-clamp-3 text-xs font-semibold leading-snug">
                          {ch.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>

              <Link
                href={`${HISTORY_BASE}/${firstChapter.slug}`}
                className={`block border-t border-slate-100 px-5 py-2.5 text-right text-xs font-bold dark:border-slate-800 ${HISTORY_STYLE.text}`}
              >
                第1章から読む →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-12" />
    </main>
  );
}
