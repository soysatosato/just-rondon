export const revalidate = 60 * 60;

import Link from "next/link";
import type { Content } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import JsonLd from "@/components/seo/JsonLd";
import {
  fetchColumns,
  fetchModernBritainEntries,
  fetchBritishEnglishEntries,
  fetchPopularReadingContents,
  fetchWeeklyPopularReadingContents,
} from "@/utils/actions/contents";
import { historyChapters, HISTORY_BASE } from "@/components/history/chapters";
import HubMasthead from "@/components/reading/HubMasthead";
import ContentRankingTabs from "@/components/rankings/ContentRankingTabs";
import { toReadingRankingEntries } from "@/lib/reading-ranking";

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
  // 既定のロゴ(810x665)ではなく、ハブごとの生成カードを配る。
  images: [hubOgImage("reading")],
});

/**
 * カテゴリの見た目定義。色は各セクションのハブ・詳細ページ・ナビと揃える
 * (lib/reading-accent.ts と同じ割り当て)。読者は色で「どのセクションか」を
 * 判断しているので、飛び先と違う色をここで塗らない。
 *
 * 紫はこのハブ自身の色なので、どのカテゴリにも使わない。
 */
const CATEGORY = {
  column: {
    base: "/column",
    label: "コラム",
    eyebrow: "Column",
    blurb: "イギリスの歴史・文化・伝統をじっくり読み解きます。",
    text: "text-amber-700 dark:text-amber-400",
    ring: "hover:border-amber-400 dark:hover:border-amber-700",
  },
  "modern-britain": {
    base: "/modern-britain",
    label: "英国のいま",
    eyebrow: "Britain, Argued",
    blurb: "最新の英国ニュースを出典付きで紹介し、背景まで掘り下げます。",
    text: "text-indigo-600 dark:text-indigo-400",
    ring: "hover:border-indigo-400 dark:hover:border-indigo-700",
  },
  "british-english": {
    base: "/british-english",
    label: "イギリス英語",
    eyebrow: "British English",
    blurb: "現地の言い回しやスラングを、由来や使い方とあわせて紹介します。",
    text: "text-rose-600 dark:text-rose-400",
    ring: "hover:border-rose-400 dark:hover:border-rose-700",
  },
} as const;

type CategoryKey = keyof typeof CATEGORY;

/*
  歴史は Content ではなく静的な全10章なので、上の3つと同じ形にしない。
  色は /history 自身と揃えた琥珀。コラムと同じ色になるが、飛び先と違う色を
  ここで塗るほうが読者を惑わせる。並びの上でも、コラムは2列グリッドの
  カード・歴史は全幅の章立てレールと形が違うので取り違えにくい。
*/
const HISTORY_STYLE = {
  eyebrow: "A History of Britain",
  text: "text-amber-700 dark:text-amber-500",
  ring: "hover:border-amber-400 dark:hover:border-amber-700",
};

/**
 * 棚の各面に並べる本数。
 *
 * セクションのハブ(7本)より多いのは、ここが3セクションの総合だから。
 * 1セクションあたり2〜3本が載る本数にしておかないと、週によっては
 * 特定のセクションが1本も出ない面になる。
 */
const RANK_TAKE = 9;

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
      description: "ローマ帝国のブリタニア征服からEU離脱まで、通史を辿ります。",
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
  const [columns, modernBritain, britishEnglish, popular, weekly] =
    await Promise.all([
      fetchColumns(),
      fetchModernBritainEntries(),
      fetchBritishEnglishEntries(),
      fetchPopularReadingContents(RANK_TAKE),
      fetchWeeklyPopularReadingContents(RANK_TAKE),
    ]);

  const now = Date.now();

  // 「新着」。カテゴリを跨いで createdAt の降順。views とは別軸なので、
  // ランキングと重複しても構わない（別の切り口で同じ記事が出るのは自然）。
  const latest = [...columns, ...modernBritain, ...britishEnglish].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const newest = latest[0] ?? null;

  // 題字に出す総数。歴史(全10章)は静的なページなので別に数える。
  const readingCount =
    columns.length + modernBritain.length + britishEnglish.length;

  const firstChapter = historyChapters[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbJsonLd({ name: PAGE_NAME, path: PAGE_PATH })} />
      <JsonLd data={readingHubCollectionJsonLd()} />

      <Breadcrumbs path="/reading" className="mb-6" />

      <HubMasthead
        accent="reading"
        eyebrow="Reading Britain"
        kicker="毎日更新"
        titleLead="英国を"
        titleAccent="読む"
        description={
          <>
            ガイドブックが終わるところから、イギリスは面白くなる。
            <br className="hidden sm:block" />
            歴史を辿り、いまを論じ、言葉を味わう。
          </>
        }
        image={newest?.image}
        stats={[
          { label: "読み物", value: `${readingCount}`, unit: "本" },
          { label: "通史", value: `${historyChapters.length}`, unit: "章" },
          ...(newest
            ? [
                {
                  label: "最終更新",
                  value: relativeDays(newest.createdAt, now),
                },
              ]
            : []),
        ]}
      />

      {/* ------------------------------------------------------------------
          新着・週間・総合を切り替える棚。3つの軸を1画面に並べていたのを
          タブに畳んだ。1軸ぶんの面積が3倍になるので、順位表に要約まで
          載せられる。セクションのハブと同じ部品を使い、同じ手つきで
          読めるようにする。

          ただし、ここはセクションのハブではなく3つの総合なので、同じ顔で
          置かない。色で二段にする——棚の枠とタブは親の紫、1件ずつの帯と
          チップは出身セクションの色。上端の細い帯は琥珀(コラム)から
          薔薇(イギリス英語)を経て藍(英国のいま)へ流れる。3つが1つの棚に
          注ぎ込んでいることを、説明文を1行も足さずに見せるための帯。

          淡い面を敷いているのも同じ理由で、本文の白から浮かせて
          「このページの主役はここ」と分かるようにしている。
         ------------------------------------------------------------------ */}
      <section className="relative mt-8 overflow-hidden rounded-3xl border border-violet-200/70 bg-gradient-to-b from-violet-50/80 via-transparent to-transparent px-4 py-6 dark:border-violet-900/50 dark:from-violet-950/40 sm:px-7 sm:py-8">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500"
        />
        <ContentRankingTabs
          title="まずはこの一本から"
          eyebrow="All Sections"
          kicker="3セクション横断"
          theme="reading"
          weekly={toReadingRankingEntries(weekly)}
          allTime={toReadingRankingEntries(popular)}
          latest={toReadingRankingEntries(latest.slice(0, RANK_TAKE))}
        />
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
