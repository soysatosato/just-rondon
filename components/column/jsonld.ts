import { SITE_NAME, SITE_URL, absoluteImage } from "@/lib/seo";
import { columnOgImage } from "@/lib/og";
import { publishedDateOf } from "@/lib/publish-schedule";

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
  publishedAt: Date | null;
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
    datePublished: publishedDateOf(content).toISOString(),
    dateModified: content.updatedAt.toISOString(),
    // 挿絵の写真と、1200x630 の共有カードの2枚を渡す。Google Discover は
    // 幅1200px以上の画像を求めており、写真は登録時にその幅を検査している
    // (scripts/lib/article-image.ts)。カードは写真の取得に失敗した場合の控え。
    image: [
      ...(content.image ? [absoluteImage(content.image)] : []),
      absoluteImage(columnOgImage(content).url),
    ],
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
