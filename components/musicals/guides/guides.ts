import type { MusicalGuideArticle } from "./types";

export const SITE_URL = "https://www.just-rondon.com";
export const MUSICALS_BASE = "/musicals";

export type GuideMeta = {
  slug: string;
  label: string;
  blurb: string;
};

/**
 * ガイド記事の並び。next-sitemap.config.js の staticPages、
 * および /musicals トップページのカード表示順と一致させること。
 */
export const guides: GuideMeta[] = [
  {
    slug: "west-end-tickets",
    label: "チケットの買い方・お得な料金ガイド",
    blurb:
      "公式ボックスオフィスとTodayTixの使い分け、TKTS半額ブースやday seatsでの節約術、料金相場の目安をまとめました。",
  },
  {
    slug: "west-end-etiquette",
    label: "劇場の楽しみ方・マナーガイド",
    blurb:
      "服装や開演時間の目安、劇場街へのアクセス、撮影・遅刻時の対応、チップの慣習など、当日に知っておきたいことを解説。",
  },
];

export function guidePath(slug: string) {
  return `${MUSICALS_BASE}/${slug}`;
}

export function getGuideMeta(slug: string) {
  return guides.find((g) => g.slug === slug) ?? null;
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は必ず自分の実URLを指す。
 */
export function buildMetadata(article: MusicalGuideArticle) {
  const url = `${SITE_URL}${guidePath(article.slug)}`;

  return {
    title: `${article.title} | ジャスト・ロンドン`,
    description: article.description,
    keywords: article.keywords,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: "ジャスト・ロンドン",
      locale: "ja_JP",
      type: "article" as const,
    },
  };
}

export function breadcrumbJsonLd(article: MusicalGuideArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ミュージカル",
        item: `${SITE_URL}${MUSICALS_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}${guidePath(article.slug)}`,
      },
    ],
  };
}

export function articleJsonLd(article: MusicalGuideArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${guidePath(article.slug)}`,
    publisher: {
      "@type": "Organization",
      name: "ジャスト・ロンドン",
      url: SITE_URL,
    },
  };
}
