import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const MODERN_BRITAIN_BASE = "/modern-britain";

export const MODERN_BRITAIN_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export function modernBritainPath(slug: string) {
  return `${MODERN_BRITAIN_BASE}/${slug}`;
}

export function modernBritainArticleJsonLd(content: {
  title: string;
  summary: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
}) {
  const url = `${SITE_URL}${modernBritainPath(content.slug)}`;

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
    author: MODERN_BRITAIN_PUBLISHER,
    publisher: MODERN_BRITAIN_PUBLISHER,
  };
}

export function modernBritainBreadcrumbJsonLd(content: {
  title: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "英国のいまを論じる",
        item: `${SITE_URL}${MODERN_BRITAIN_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.title,
        item: `${SITE_URL}${modernBritainPath(content.slug)}`,
      },
    ],
  };
}

export function modernBritainHubBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "英国のいまを論じる",
        item: `${SITE_URL}${MODERN_BRITAIN_BASE}`,
      },
    ],
  };
}

export function modernBritainHubCollectionJsonLd(
  items: { title: string; summary: string | null; slug: string }[]
) {
  const url = `${SITE_URL}${MODERN_BRITAIN_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "英国のいまを論じる | 最新ニュースの背景を掘り下げる時事コラム",
    description:
      "最新の英国ニュースを出典付きで紹介し、その背景・原因・英国社会への影響、制度や歴史との関係まで掘り下げて論じます。",
    inLanguage: "ja",
    publisher: MODERN_BRITAIN_PUBLISHER,
    hasPart: items.map((item) => ({
      "@type": "Article",
      name: item.title,
      ...(item.summary ? { description: item.summary } : {}),
      url: `${SITE_URL}${modernBritainPath(item.slug)}`,
    })),
  };
}
