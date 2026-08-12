import type { Musical } from "@prisma/client";

import { SITE_URL } from "@/lib/seo";
export { SITE_URL };

export function collectionPageJsonLd(musicals: Musical[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ロンドン観光・ミュージカル・劇場・シアターガイド",
    url: `${SITE_URL}/musicals`,
    hasPart: musicals.map((m) => ({
      "@type": "TheaterEvent",
      name: m.name,
      url: `${SITE_URL}/musicals/${m.slug}`,
      image: m.image,
    })),
  };
}

export function musicalBreadcrumbJsonLd(
  musical: { name: string; slug: string },
  extraCrumbs: { name: string; url: string }[] = [],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ミュージカル",
        item: `${SITE_URL}/musicals`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: musical.name,
        item: `${SITE_URL}/musicals/${musical.slug}`,
      },
      ...extraCrumbs.map((c, i) => ({
        "@type": "ListItem",
        position: 4 + i,
        name: c.name,
        item: c.url,
      })),
    ],
  };
}

/**
 * startDate/endDate は意図的に省略している。DBに公演日程データがなく、
 * 捏造した日付を載せるとGoogleのイベントリッチリザルト要件を満たすためだけの
 * 不正確な構造化データになってしまうため。リッチリザルト対象外になるが、
 * 正直な構造化データとして残す。
 */
export function theaterEventJsonLd(musical: Musical) {
  return {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    name: musical.name,
    image: musical.image,
    url: `${SITE_URL}/musicals/${musical.slug}`,
    description: musical.summary,
    location: {
      "@type": "PerformingArtsTheater",
      name: musical.theatreName,
      address: musical.address,
      geo: {
        "@type": "GeoCoordinates",
        latitude: musical.lat,
        longitude: musical.lng,
      },
    },
    // validFrom は公式サイトの情報を最後に確認した日。チケット販売開始日は
    // DBになく、それより前を名乗ると確認していない期間を保証することになる。
    offers: musical.website
      ? {
          "@type": "Offer",
          url: musical.website,
          availability: "https://schema.org/InStock",
          validFrom: musical.updatedAt.toISOString().slice(0, 10),
        }
      : undefined,
  };
}
