import type { Souvenir } from "@prisma/client";
import { SITE_URL } from "@/lib/seo";
import { SOUVENIR_BASE, souvenirPath } from "./categories";

/**
 * お土産一覧の ItemList。
 *
 * Product にしないのは、Google が Product に求める price / availability /
 * aggregateRating を1つも持っていないため。実在しない価格を埋めるより、
 * 素直に ItemList として「何をどの順で紹介しているか」だけを渡す。
 */
export function souvenirItemListJsonLd(souvenirs: Souvenir[]) {
  const pageUrl = `${SITE_URL}${SOUVENIR_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    name: "ロンドンで買えるお土産",
    numberOfItems: souvenirs.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: souvenirs.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${SITE_URL}${souvenirPath(s.slug)}`,
    })),
  };
}

/**
 * 品目1件の詳細ページ。
 *
 * 一覧と同じ理由で Product は使わない。価格は「£2〜5」のような幅の
 * 目安であって実売価格ではなく、availability も持っていない。
 * Article として「この品について書かれた記事」を渡すほうが実態に合う。
 */
export function souvenirArticleJsonLd(souvenir: Souvenir) {
  const url = `${SITE_URL}${souvenirPath(souvenir.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: `${souvenir.name}｜ロンドンで買えるお土産`,
    description: souvenir.blurb,
    ...(souvenir.image ? { image: [souvenir.image] } : {}),
    datePublished: souvenir.createdAt.toISOString(),
    dateModified: souvenir.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "just rondon" },
    publisher: { "@type": "Organization", name: "just rondon" },
  };
}
