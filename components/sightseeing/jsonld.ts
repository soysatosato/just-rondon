import type { Attraction } from "@prisma/client";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const SIGHTSEEING_BASE = "/sightseeing";

export function attractionPath(slug: string) {
  return `/sightseeing/${slug}`;
}

/**
 * 住所文字列を PostalAddress に格上げする。
 * DBの address は自由文字列なので streetAddress にそのまま入れ、
 * ロンドン/英国だけは確実に言えるので補う。
 */
function postalAddress(address: string) {
  return {
    "@type": "PostalAddress",
    streetAddress: address,
    addressLocality: "London",
    addressCountry: "GB",
  };
}

export function attractionJsonLd(attraction: Attraction) {
  const url = `${SITE_URL}${attractionPath(attraction.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": url,
    url,
    name: attraction.name,
    ...(attraction.engName ? { alternateName: attraction.engName } : {}),
    ...(attraction.summary ? { description: attraction.summary } : {}),
    image: attraction.image,
    address: postalAddress(attraction.address),
    geo: {
      "@type": "GeoCoordinates",
      latitude: attraction.lat,
      longitude: attraction.lng,
    },
    isAccessibleForFree: attraction.isFree,
    ...(attraction.website ? { sameAs: [attraction.website] } : {}),
  };
}

export function attractionBreadcrumbJsonLd(attraction: {
  name: string;
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
        name: "観光ガイド",
        item: `${SITE_URL}/sightseeing`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: attraction.name,
        item: `${SITE_URL}${attractionPath(attraction.slug)}`,
      },
    ],
  };
}

/**
 * クリスマスマーケット等の Content ベースの観光ページ用。
 *
 * Event 型は使わない。DBに信頼できる startDate / endDate が無く、
 * リッチリザルト要件を満たすためだけに日付を捏造することになるため
 * (components/musicals/jsonld.ts と同じ方針)。
 */
export function contentAttractionJsonLd(content: {
  title: string;
  engTitle: string | null;
  slug: string;
  summary: string | null;
  image: string | null;
  website: string | null;
}) {
  const url = `${SITE_URL}/sightseeing/christmas-markets/${content.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": url,
    url,
    name: content.title,
    ...(content.engTitle ? { alternateName: content.engTitle } : {}),
    ...(content.summary ? { description: content.summary } : {}),
    ...(content.image ? { image: content.image } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "London",
      addressCountry: "GB",
    },
    ...(content.website ? { sameAs: [content.website] } : {}),
  };
}

export function christmasMarketBreadcrumbJsonLd(content: {
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
        name: "観光ガイド",
        item: `${SITE_URL}/sightseeing`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "クリスマスマーケット",
        item: `${SITE_URL}/sightseeing/christmas-markets`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: content.title,
        item: `${SITE_URL}/sightseeing/christmas-markets/${content.slug}`,
      },
    ],
  };
}

export const SIGHTSEEING_PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
};

/**
 * ホーム → 観光ガイド → (任意の下層) のパンくず。
 * trail には /sightseeing より下の階層だけを渡す。
 */
export function sightseeingBreadcrumbJsonLd(
  trail: { name: string; path: string }[] = []
) {
  const base = [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "観光ガイド",
      item: `${SITE_URL}${SIGHTSEEING_BASE}`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...base,
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: base.length + i + 1,
        name: t.name,
        item: `${SITE_URL}${t.path}`,
      })),
    ],
  };
}

/**
 * FAQ の構造化データと markdown 除去は /visa でも同じものを使うので
 * lib/jsonld.ts に移した。ここは既存の import を壊さないための再輸出。
 */
export { faqPageJsonLd, stripInlineMarkdown } from "@/lib/jsonld";

/** /sightseeing ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function sightseeingHubCollectionJsonLd(
  guides: { slug: string; label: string; blurb: string }[],
  meta: { name: string; description: string }
) {
  const url = `${SITE_URL}${SIGHTSEEING_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    hasPart: guides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${SIGHTSEEING_BASE}/${g.slug}`,
    })),
  };
}

/* -----------------------------------------------------
   ロケ地巡り(/sightseeing/film-locations)
----------------------------------------------------- */

export const FILM_LOCATIONS_BASE = `${SIGHTSEEING_BASE}/film-locations`;

export function filmWorkPath(slug: string) {
  return `${FILM_LOCATIONS_BASE}/${slug}`;
}

export function filmLocationsHubJsonLd(
  works: { slug: string; title: string; summary: string }[]
) {
  const url = `${SITE_URL}${FILM_LOCATIONS_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "ロンドン 映画・ドラマのロケ地巡り",
    description:
      "ロンドンで撮影された映画・ドラマのロケ地を作品別にたどるガイド。実際に訪ねられる場所だけを、行き方と公開状況つきで紹介します。",
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    hasPart: works.map((w) => ({
      "@type": "Article",
      name: `${w.title}のロケ地`,
      description: w.summary,
      url: `${SITE_URL}${filmWorkPath(w.slug)}`,
    })),
  };
}

export function filmWorkBreadcrumbJsonLd(work: { slug: string; title: string }) {
  return sightseeingBreadcrumbJsonLd([
    { name: "ロケ地巡り", path: FILM_LOCATIONS_BASE },
    { name: work.title, path: filmWorkPath(work.slug) },
  ]);
}

/**
 * ロケ地の一覧を ItemList として出す。
 *
 * 各スポットを Place ではなく ListItem 内の名前として出しているのは、
 * 番地を持たない方針(data.ts のコメント参照)で PostalAddress を
 * 埋められないため。住所の無い Place を並べても構造化データとしての
 * 価値が無いので、記事内の順序付きリストとしてだけ伝える。
 */
export function filmWorkJsonLd(work: {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  spots: { name: string; scene: string }[];
}) {
  const url = `${SITE_URL}${filmWorkPath(work.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${work.title}のロケ地巡り`,
    description: work.summary,
    inLanguage: "ja",
    mainEntityOfPage: url,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
    about: {
      "@type": "CreativeWork",
      name: work.engTitle,
      alternateName: work.title,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: work.spots.length,
      itemListElement: work.spots.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        description: s.scene,
      })),
    },
  };
}

/* -----------------------------------------------------
   ブループラーク巡り(/sightseeing/blue-plaques)
----------------------------------------------------- */

export const BLUE_PLAQUES_BASE = `${SIGHTSEEING_BASE}/blue-plaques`;

export function plaqueAreaPath(slug: string) {
  return `${BLUE_PLAQUES_BASE}/${slug}`;
}

export function bluePlaquesHubJsonLd(
  areas: { slug: string; title: string; summary: string }[]
) {
  const url = `${SITE_URL}${BLUE_PLAQUES_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "ロンドン ブループラーク巡り",
    description:
      "English Heritage の公式ブループラークをエリア別にたどるガイド。作家・音楽家・政治家・科学者ゆかりの建物を、行き方と見学の可否つきで紹介します。",
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    hasPart: areas.map((a) => ({
      "@type": "Article",
      name: `${a.title}のブループラーク`,
      description: a.summary,
      url: `${SITE_URL}${plaqueAreaPath(a.slug)}`,
    })),
  };
}

export function plaqueAreaBreadcrumbJsonLd(area: { slug: string; title: string }) {
  return sightseeingBreadcrumbJsonLd([
    { name: "ブループラーク巡り", path: BLUE_PLAQUES_BASE },
    { name: area.title, path: plaqueAreaPath(area.slug) },
  ]);
}

/**
 * プレートの一覧を ItemList として出す。
 *
 * 各人物を Person ではなく ListItem 内の名前として出しているのは、
 * film-locations の spots と同じ理由。住所自体は持たせているが、
 * 生没年などの裏取りが必要な構造化データまでは踏み込まない。
 */
export function plaqueAreaJsonLd(area: {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  plaques: { name: string; title: string }[];
}) {
  const url = `${SITE_URL}${plaqueAreaPath(area.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${area.title}のブループラーク巡り`,
    description: area.summary,
    inLanguage: "ja",
    mainEntityOfPage: url,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
    about: {
      "@type": "Place",
      name: area.engTitle,
      alternateName: area.title,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: area.plaques.length,
      itemListElement: area.plaques.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        description: p.title,
      })),
    },
  };
}
