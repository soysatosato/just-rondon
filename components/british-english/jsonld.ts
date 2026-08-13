import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const BRITISH_ENGLISH_BASE = "/british-english";

export const BRITISH_ENGLISH_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export function britishEnglishPath(slug: string) {
  return `${BRITISH_ENGLISH_BASE}/${slug}`;
}

export function britishEnglishArticleJsonLd(content: {
  title: string;
  summary: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
}) {
  const url = `${SITE_URL}${britishEnglishPath(content.slug)}`;

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
    author: BRITISH_ENGLISH_PUBLISHER,
    publisher: BRITISH_ENGLISH_PUBLISHER,
  };
}

export function britishEnglishBreadcrumbJsonLd(content: {
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
        name: "イギリス英語",
        item: `${SITE_URL}${BRITISH_ENGLISH_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.title,
        item: `${SITE_URL}${britishEnglishPath(content.slug)}`,
      },
    ],
  };
}

export function britishEnglishHubBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "イギリス英語",
        item: `${SITE_URL}${BRITISH_ENGLISH_BASE}`,
      },
    ],
  };
}

export function britishEnglishScenesBreadcrumbJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "イギリス英語",
        item: `${SITE_URL}${BRITISH_ENGLISH_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "場面別フレーズ集",
        item: `${SITE_URL}${BRITISH_ENGLISH_BASE}/scenes`,
      },
    ],
  };
}

export function britishEnglishHubCollectionJsonLd(
  items: { title: string; summary: string | null; slug: string }[]
) {
  const url = `${SITE_URL}${BRITISH_ENGLISH_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "イギリス英語 | フレーズと表現を毎日1つ紹介",
    description:
      "イギリス英語ならではの単語・言い回し・スラングを毎日1つ、由来や使い方とあわせて紹介します。",
    inLanguage: "ja",
    publisher: BRITISH_ENGLISH_PUBLISHER,
    hasPart: items.map((item) => ({
      "@type": "Article",
      name: item.title,
      ...(item.summary ? { description: item.summary } : {}),
      url: `${SITE_URL}${britishEnglishPath(item.slug)}`,
    })),
  };
}
