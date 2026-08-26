import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { ShoppingGuideArticle } from "./types";

export { SITE_URL };

export const SHOPPING_BASE = "/shopping";
export const SHOPPING_SECTION_NAME = "ロンドンの買い物";

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const SHOPPING_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const SHOPPING_UPDATED_AT = "2026-08-26";

/**
 * ハブでの分類。
 *
 * 「どこで買うか → 買い方の前提」の2段。
 *
 * /brands と /souvenirs が「何を買うか」を既に持っているので、
 * このセクションは意図的に場所と制度だけを扱う。品目の話を
 * ここに書き始めたら、それは /souvenirs に足すべきというサイン。
 */
export type ShoppingCategory = "places" | "rules";

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  places: "どこで買うか",
  rules: "買い方の前提",
};

export const SHOPPING_CATEGORY_BLURBS: Record<ShoppingCategory, string> = {
  places:
    "市場とデパート。どちらも「行けば買える」場所ではなく、曜日と時間で中身が変わります。",
  rules:
    "免税、セール、支払い。知らないまま行くと、必ず同じところでつまずく制度の話。",
};

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = ["places", "rules"];

export type ShoppingGuideMeta = {
  slug: string;
  category: ShoppingCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 買い物ガイドの並び。
 *
 * 先頭が市場なのは、曜日を外すと「行ったのに何も無かった」という
 * 取り返しのつかない失敗になるから。デパートや制度の話は、
 * 知らなくても買い物自体は成立する。
 *
 * next-sitemap.config.js の staticPages と、/shopping ハブの
 * カード表示順をこのリストと一致させること。
 */
export const shoppingGuides: ShoppingGuideMeta[] = [
  {
    slug: "markets",
    category: "places",
    eyebrow: "Markets",
    label: "ロンドンのマーケット — 曜日で別物になる",
    blurb:
      "同じ場所でも、行く曜日で売っているものが変わります。日曜だけの花市場、土曜だけのアンティーク、木曜は昼で終わる通り。主要5market の曜日と、外したときに何が起きるか。",
  },
  {
    slug: "department-stores",
    category: "places",
    eyebrow: "Department Stores",
    label: "デパート — 買う店ではなく、見る店として",
    blurb:
      "ハロッズ、リバティ、フォートナム&メイソン、セルフリッジズ。建物と売り場そのものが観光地です。買わなくても行く価値がある店と、日曜に6時間しか開かない法律の話。",
  },
  {
    slug: "bicester-village",
    category: "places",
    eyebrow: "Bicester Village",
    label: "ビスター・ヴィレッジ — 丸1日使う価値があるか",
    blurb:
      "ロンドンから列車で約1時間のアウトレット。最大40%引きですが、往復と滞在で1日が消えます。元が取れる条件と、タッチ決済が使えない区間であることについて。",
  },
  {
    slug: "vat-refund",
    category: "rules",
    eyebrow: "VAT Refund",
    label: "免税は使えない — 2021年に廃止された",
    blurb:
      "空港で書類にスタンプをもらって20%戻る、という手続きは今のイギリスに存在しません。それでも現地が安い理由と、唯一残っている免税の抜け道について。",
  },
];

export function shoppingGuidePath(slug: string) {
  return `${SHOPPING_BASE}/${slug}`;
}

export function getShoppingGuideMeta(slug: string) {
  return shoppingGuides.find((g) => g.slug === slug) ?? null;
}

export function shoppingGuidesByCategory(category: ShoppingCategory) {
  return shoppingGuides.filter((g) => g.category === category);
}

export const shoppingGuideSlugs = shoppingGuides.map((g) => g.slug);

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildShoppingGuideMetadata(article: ShoppingGuideArticle) {
  return buildPageMetadata({
    path: shoppingGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function shoppingGuideBreadcrumbJsonLd(article: ShoppingGuideArticle) {
  const meta = getShoppingGuideMeta(article.slug);

  return breadcrumbJsonLd(
    { name: SHOPPING_SECTION_NAME, path: SHOPPING_BASE },
    [
      {
        name: meta?.label ?? article.title,
        path: shoppingGuidePath(article.slug),
      },
    ],
  );
}

export function shoppingGuideArticleJsonLd(article: ShoppingGuideArticle) {
  const url = `${SITE_URL}${shoppingGuidePath(article.slug)}`;

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

/** /shopping ハブが持つ記事の一覧を CollectionPage として出す。 */
export function shoppingHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${SHOPPING_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SITE_PUBLISHER,
    hasPart: shoppingGuides.map((g) => ({
      "@type": "Article",
      headline: g.label,
      description: g.blurb,
      url: `${SITE_URL}${shoppingGuidePath(g.slug)}`,
    })),
  };
}
