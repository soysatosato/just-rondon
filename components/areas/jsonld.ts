import { SITE_NAME, SITE_URL } from "@/lib/seo";

// 観光の「エリアガイド」(components/sightseeing/areas/areas.ts の AREAS_BASE =
// /sightseeing/areas)とは別物。あちらは半日の回遊ルート、こちらは街そのものの
// 読みもの。同じ語を使う2つが並ぶので、import するときは必ず出自を確かめる。
export const AREAS_BASE = "/areas";

export const AREAS_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

export function areaPath(slug: string) {
  return `${AREAS_BASE}/${slug}`;
}

export function areaArticleJsonLd(content: {
  title: string;
  engTitle: string | null;
  summary: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
}) {
  const url = `${SITE_URL}${areaPath(content.slug)}`;

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
    /*
      記事が何について書かれているかを Place で明示する。
      街の名前は Brixton / Peckham のように英国内に同名が無いものが多いが、
      Richmond や Greenwich は他国にもあるので、addressRegion まで付けて
      「ロンドンのそれ」だと示す。
    */
    ...(content.engTitle
      ? {
          about: {
            "@type": "Place",
            name: content.engTitle,
            address: {
              "@type": "PostalAddress",
              addressLocality: "London",
              addressCountry: "GB",
            },
          },
        }
      : {}),
    author: AREAS_PUBLISHER,
    publisher: AREAS_PUBLISHER,
  };
}

export function areaListCollectionJsonLd(
  items: { title: string; summary: string | null; slug: string }[]
) {
  const url = `${SITE_URL}${AREAS_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "ロンドンの街｜エリアごとの治安・家賃・歴史と歩き方",
    description:
      "ロンドンのエリアを1つずつ読み解きます。地名の由来、その街がいまの姿になった経緯、警察と土地登記の統計で見る治安と家賃、そして歩くならどこか。",
    inLanguage: "ja",
    publisher: AREAS_PUBLISHER,
    hasPart: items.map((item) => ({
      "@type": "Article",
      name: item.title,
      ...(item.summary ? { description: item.summary } : {}),
      url: `${SITE_URL}${areaPath(item.slug)}`,
    })),
  };
}
