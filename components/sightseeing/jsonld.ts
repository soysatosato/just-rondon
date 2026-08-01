import type { Attraction } from "@prisma/client";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

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
