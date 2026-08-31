import { SITE_NAME, SITE_URL, absoluteImage } from "@/lib/seo";
import { britishEnglishOgImage } from "@/lib/og";

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
  engTitle: string | null;
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
    // 挿絵が無い記事のほうが多いので、そのときは共有カードを画像として出す。
    // Article に image が無いと Google の記事カードに画像が付かない。
    image: absoluteImage(content.image || britishEnglishOgImage(content).url),
    author: BRITISH_ENGLISH_PUBLISHER,
    publisher: BRITISH_ENGLISH_PUBLISHER,
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
