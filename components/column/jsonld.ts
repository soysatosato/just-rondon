import {
  EDITORIAL_NAME,
  EDITORIAL_PATH,
  SITE_NAME,
  SITE_URL,
  absoluteImage,
} from "@/lib/seo";
import { OG_PHOTO_RATIOS, columnOgImage, readingPhotoOgImage } from "@/lib/og";
import { modifiedDateOf, publishedDateOf } from "@/lib/publish-schedule";
import { parseSources } from "@/lib/reading-sources";

export const COLUMN_BASE = "/column";

export const COLUMN_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

/** 記事ページの署名と同じ名義。発行者はサイト、書き手は編集部。 */
export const COLUMN_AUTHOR = {
  "@type": "Organization",
  name: EDITORIAL_NAME,
  url: `${SITE_URL}${EDITORIAL_PATH}`,
};

export function columnPath(slug: string) {
  return `${COLUMN_BASE}/${slug}`;
}

export function columnArticleJsonLd(content: {
  title: string;
  summary: string | null;
  slug: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  revisedAt: Date | null;
  image: string | null;
  sources?: unknown;
}) {
  const url = `${SITE_URL}${columnPath(content.slug)}`;
  const sources = parseSources(content.sources);

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
    // 写真のある記事は、写真を 16:9・4:3・1:1 に切り抜いた3枚(文字なし)。
    // Discover は幅1200px以上で文字の少ない画像を求めていて、見出しを組んだ
    // 共有カードはそれに当たらない。写真は登録時に幅を検査している
    // (scripts/lib/article-image.ts)。写真の無い記事だけカードを渡す。
    image: content.image
      ? OG_PHOTO_RATIOS.map((ratio) =>
          absoluteImage(readingPhotoOgImage("column", content, ratio).url),
        )
      : [absoluteImage(columnOgImage(content).url)],
    author: COLUMN_AUTHOR,
    publisher: COLUMN_PUBLISHER,
    // 記事末尾の参考資料欄と同じもの。欄の無い記事には付けない。
    ...(sources.length > 0
      ? {
          citation: sources.map((s) => ({
            "@type": "CreativeWork",
            name: s.title,
            ...(s.url ? { url: s.url } : {}),
            // 「1855(第2版)」のような表記は日付として渡さない。
            ...(s.year && /^\d{4}$/.test(s.year)
              ? { datePublished: s.year }
              : {}),
            publisher: { "@type": "Organization", name: s.publisher },
          })),
        }
      : {}),
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
