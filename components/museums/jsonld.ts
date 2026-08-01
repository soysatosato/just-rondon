import { SITE_NAME, SITE_URL } from "@/lib/seo";

export function museumPath(slug: string) {
  return `/museums/${slug}`;
}

/**
 * OpeningHours.dayOfWeek は Prisma 上ただの String で、値の保証が無い。
 * components/museums/MuseumHero.tsx が en-US の weekday:"long" と比較しているので
 * 実データは "Monday" 形式だが、表記ゆれで壊れた構造化データを出さないよう
 * マッピングできない行は落とす。
 */
const DAY_OF_WEEK: Record<string, string> = {
  monday: "https://schema.org/Monday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
  thursday: "https://schema.org/Thursday",
  friday: "https://schema.org/Friday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
  月: "https://schema.org/Monday",
  火: "https://schema.org/Tuesday",
  水: "https://schema.org/Wednesday",
  木: "https://schema.org/Thursday",
  金: "https://schema.org/Friday",
  土: "https://schema.org/Saturday",
  日: "https://schema.org/Sunday",
};

type OpeningHoursRow = {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
};

function openingHoursSpecification(rows: OpeningHoursRow[]) {
  const specs = rows
    .map((row) => {
      const day = DAY_OF_WEEK[row.dayOfWeek.trim().toLowerCase()];
      // 曜日が特定できない / 時刻が欠けている行は出力しない
      if (!day || !row.openTime || !row.closeTime) return null;
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens: row.openTime,
        closes: row.closeTime,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return specs.length > 0 ? specs : undefined;
}

type MuseumForJsonLd = {
  name: string;
  engName: string | null;
  slug: string;
  summary: string | null;
  description: string | null;
  image: string;
  address: string;
  lat: number;
  lng: number;
  website: string | null;
  price: number;
  openingHours?: OpeningHoursRow[];
};

export function museumJsonLd(museum: MuseumForJsonLd) {
  const url = `${SITE_URL}${museumPath(museum.slug)}`;
  const hours = museum.openingHours
    ? openingHoursSpecification(museum.openingHours)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["Museum", "TouristAttraction"],
    "@id": url,
    url,
    name: museum.name,
    ...(museum.engName ? { alternateName: museum.engName } : {}),
    ...(museum.summary || museum.description
      ? { description: museum.summary ?? museum.description }
      : {}),
    image: museum.image,
    address: {
      "@type": "PostalAddress",
      streetAddress: museum.address,
      addressLocality: "London",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: museum.lat,
      longitude: museum.lng,
    },
    // 無料と断定できるときだけ true。不明な場合は出力しない。
    ...(museum.price === 0 ? { isAccessibleForFree: true } : {}),
    ...(hours ? { openingHoursSpecification: hours } : {}),
    ...(museum.website ? { sameAs: [museum.website] } : {}),
  };
}

export function museumBreadcrumbJsonLd(
  museum: { name: string; slug: string },
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
        name: "美術館・博物館",
        item: `${SITE_URL}/museums`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: museum.name,
        item: `${SITE_URL}${museumPath(museum.slug)}`,
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

type ArtworkForJsonLd = {
  id: string;
  title: string;
  engTitle: string | null;
  artist: string | null;
  year: string | null;
  description: string | null;
  image: string | null;
};

export function artworkJsonLd(
  artwork: ArtworkForJsonLd,
  museum: { name: string; slug: string },
) {
  const url = `${SITE_URL}${museumPath(museum.slug)}/artworks/${artwork.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": url,
    url,
    name: artwork.title,
    ...(artwork.engTitle ? { alternateName: artwork.engTitle } : {}),
    ...(artwork.artist
      ? { creator: { "@type": "Person", name: artwork.artist } }
      : {}),
    ...(artwork.year ? { dateCreated: artwork.year } : {}),
    ...(artwork.description ? { description: artwork.description } : {}),
    ...(artwork.image ? { image: artwork.image } : {}),
    // 所蔵館
    holdingArchive: {
      "@type": "Museum",
      name: museum.name,
      url: `${SITE_URL}${museumPath(museum.slug)}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
