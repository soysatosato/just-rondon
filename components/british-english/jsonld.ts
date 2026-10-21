import { SITE_NAME, SITE_URL, absoluteImage } from "@/lib/seo";
import {
  OG_PHOTO_RATIOS,
  britishEnglishOgImage,
  readingPhotoOgImage,
} from "@/lib/og";
import { modifiedDateOf, publishedDateOf } from "@/lib/publish-schedule";

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
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  revisedAt: Date | null;
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
    datePublished: publishedDateOf(content).toISOString(),
    // 画面の「更新」の日付と同じ値(components/reading/ArticleDates.tsx)。
    dateModified: modifiedDateOf(content).toISOString(),
    // 挿絵(幅1200px以上。scripts/lib/article-image.ts で登録時に検査)の
    // ある記事は、それを 16:9・4:3・1:1 に切り抜いた文字なしの3枚。
    // 挿絵の無い記事はその語を大きく組んだ共有カードだけになる。Article に
    // image が無いと Google の記事カードにも Discover にも画像が付かない。
    image: content.image
      ? OG_PHOTO_RATIOS.map((ratio) =>
          absoluteImage(
            readingPhotoOgImage("british-english", content, ratio).url,
          ),
        )
      : [absoluteImage(britishEnglishOgImage(content).url)],
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
    name: "イギリス英語 | フレーズと表現を1つずつ紹介",
    description:
      "イギリス英語ならではの単語・言い回し・スラングを1つずつ、由来や使い方とあわせて紹介します。",
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
