import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const COLUMN_BASE = "/column";

export const COLUMN_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export function columnPath(slug: string) {
  return `${COLUMN_BASE}/${slug}`;
}

export function columnArticleJsonLd(content: {
  title: string;
  summary: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
}) {
  const url = `${SITE_URL}${columnPath(content.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: content.title,
    ...(content.summary ? { description: content.summary } : {}),
    inLanguage: "ja",
    mainEntityOfPage: url,
    datePublished: content.createdAt.toISOString(),
    dateModified: content.updatedAt.toISOString(),
    ...(content.image ? { image: content.image } : {}),
    author: COLUMN_PUBLISHER,
    publisher: COLUMN_PUBLISHER,
  };
}

export function columnHubCollectionJsonLd(
  items: { title: string; summary: string | null; slug: string }[]
) {
  const url = `${SITE_URL}${COLUMN_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "コラム | イギリスの歴史・文化・伝統を深掘りする読み物",
    description:
      "イギリスの歴史・文化・伝統・制度にまつわるコラムを毎日更新でお届けします。",
    inLanguage: "ja",
    publisher: COLUMN_PUBLISHER,
    hasPart: items.map((item) => ({
      "@type": "Article",
      name: item.title,
      ...(item.summary ? { description: item.summary } : {}),
      url: `${SITE_URL}${columnPath(item.slug)}`,
    })),
  };
}
