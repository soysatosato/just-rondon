import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import { RESTAURANT_BASE, RESTAURANT_SECTION_NAME } from "../meta";
import type { RestaurantGuideArticle } from "./types";

export { SITE_URL, RESTAURANT_BASE, RESTAURANT_SECTION_NAME };

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const RESTAURANT_GUIDE_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const RESTAURANT_GUIDE_UPDATED_AT = "2026-08-13";

export type RestaurantGuideMeta = {
  slug: string;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * レストラン／パブのガイド。
 *
 * 「店をどう選ぶか」ではなく「店でどう振る舞うか」を扱う。
 * 料理別の店選びは /restaurants のトップが担当している。
 *
 * next-sitemap.config.js の staticPages と、/restaurants ハブの
 * カード表示順をこのリストと一致させること。
 */
export const restaurantGuides: RestaurantGuideMeta[] = [
  {
    slug: "must-visit",
    eyebrow: "Must-Visit",
    label: "絶対行くべき超人気店",
    blurb:
      "予約が取れない、行列が絶えない。そう言われる店の多くは、仕組みを知っていれば入れます。予約が開放される曜日と時刻、アプリで並ぶ行列、レストランが満席でもバーなら入れる店まで、7軒ぶんの攻略法をまとめました。",
  },
  {
    slug: "pub-etiquette",
    eyebrow: "Pub Etiquette",
    label: "パブの作法",
    blurb:
      "カウンターで注文して先払い。席で待っていても、誰も注文を取りに来ません。入店から会計まで、日本の居酒屋との違いを順を追って解説します。",
  },
];

export function restaurantGuidePath(slug: string) {
  return `${RESTAURANT_BASE}/${slug}`;
}

export function getRestaurantGuideMeta(slug: string) {
  return restaurantGuides.find((g) => g.slug === slug) ?? null;
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildRestaurantGuideMetadata(article: RestaurantGuideArticle) {
  return buildPageMetadata({
    path: restaurantGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function restaurantGuideBreadcrumbJsonLd(
  article: RestaurantGuideArticle,
) {
  const meta = getRestaurantGuideMeta(article.slug);
  return breadcrumbJsonLd(
    { name: RESTAURANT_SECTION_NAME, path: RESTAURANT_BASE },
    [
      {
        name: meta?.label ?? article.title,
        path: restaurantGuidePath(article.slug),
      },
    ],
  );
}

export function restaurantGuideArticleJsonLd(article: RestaurantGuideArticle) {
  const url = `${SITE_URL}${restaurantGuidePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: article.updatedAt,
    author: SITE_PUBLISHER,
    publisher: SITE_PUBLISHER,
  };
}
