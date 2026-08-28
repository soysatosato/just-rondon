import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import type { Theatre } from "@prisma/client";

import { SITE_URL, buildPageMetadata } from "@/lib/seo";

export { SITE_URL };

export const MUSICALS_BASE = "/musicals";
export const THEATRES_BASE = `${MUSICALS_BASE}/theatres`;
export const THEATRES_SECTION_NAME = "劇場ガイド";

export const MUSICALS_PUBLISHER = {
  "@type": "Organization",
  name: "ジャスト・ロンドン",
  url: SITE_URL,
} as const;

export function theatrePath(slug: string) {
  return `${THEATRES_BASE}/${slug}`;
}

/**
 * 劇場グループごとの公式チケット販売サイト。
 *
 * operator を出すのは会社名を知らせるためではなく、「どこで買えば
 * 公式か」を読者に渡すため。検索結果の上位に転売サイトが並ぶことは
 * /musicals/west-end-tickets でも警告しているが、警告だけでは
 * 読者は正解にたどり着けない。劇場ページから公式の入口を直接指す。
 *
 * ここに無い operator(独立系・小規模な運営会社)は劇場ごとに窓口が
 * 違うため、URL を持たせず名前だけ出す。誤った販売先を指すくらいなら
 * 作品ページの website に委ねるほうが安全。
 */
const OPERATOR_SITES: Record<string, string> = {
  "ATG Tickets": "https://www.atgtickets.com/",
  "LW Theatres": "https://lwtheatres.co.uk/",
  "Delfont Mackintosh Theatres": "https://www.delfontmackintosh.co.uk/",
  "Nimax Theatres": "https://www.nimaxtheatres.com/",
};

export function operatorSite(operator: string): string | null {
  return OPERATOR_SITES[operator] ?? null;
}

/**
 * 劇場ページの metadata。
 *
 * タイトルに英語名を必ず入れる。読者が検索するのは "Sondheim Theatre 座席"
 * のような英語名で、日本語名(ソンドハイム劇場)単独ではほぼ引かれない。
 */
export function buildTheatreMetadata(
  theatre: Pick<Theatre, "slug" | "name" | "nameJa" | "address">,
  onShowNames: string[],
) {
  const showing =
    onShowNames.length > 0
      ? `上演中は『${onShowNames.join("』『")}』。`
      : "";

  return buildPageMetadata({
    path: theatrePath(theatre.slug),
    title: `${theatre.name}（${theatre.nameJa}）｜アクセス・座席・上演作品`,
    titleSuffix: false,
    description: `ロンドン・${theatre.name}のアクセスと座席の選び方、上演中の作品をまとめました。${showing}住所は${theatre.address}。`,
    keywords: [
      theatre.name,
      `${theatre.name} 座席`,
      `${theatre.name} アクセス`,
      theatre.nameJa,
      "ロンドン 劇場",
      "ウエストエンド 劇場",
    ],
    type: "article",
  });
}

export function theatreBreadcrumbJsonLd(
  theatre: Pick<Theatre, "slug" | "name" | "nameJa">,
) {
  return breadcrumbListJsonLd({
    path: "/musicals/theatres",
    current: theatre.nameJa,
    currentHref: theatrePath(theatre.slug),
  });
}

/**
 * 劇場そのものを PerformingArtsTheater として出す。
 *
 * 作品ページの TheaterEvent が location として同じ劇場を指すので、
 * @id を揃えて同一の実体だと示す。
 */
export function theatreJsonLd(
  theatre: Pick<
    Theatre,
    "slug" | "name" | "nameJa" | "address" | "lat" | "lng" | "capacity"
  >,
) {
  const url = `${SITE_URL}${theatrePath(theatre.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    "@id": `${url}#theatre`,
    url,
    name: theatre.name,
    alternateName: theatre.nameJa,
    address: {
      "@type": "PostalAddress",
      streetAddress: theatre.address,
      addressLocality: "London",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: theatre.lat,
      longitude: theatre.lng,
    },
    ...(theatre.capacity ? { maximumAttendeeCapacity: theatre.capacity } : {}),
  };
}

/** /musicals/theatres ハブの CollectionPage。 */
export function theatresHubJsonLd(
  theatres: Pick<Theatre, "slug" | "name" | "nameJa" | "address">[],
) {
  const url = `${SITE_URL}${THEATRES_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "ロンドン・ウエストエンドの劇場ガイド",
    description:
      "ウエストエンドの主要劇場のアクセス、座席の選び方、上演中の作品をまとめた一覧です。",
    inLanguage: "ja",
    publisher: MUSICALS_PUBLISHER,
    hasPart: theatres.map((t) => ({
      "@type": "PerformingArtsTheater",
      name: t.name,
      alternateName: t.nameJa,
      url: `${SITE_URL}${theatrePath(t.slug)}`,
    })),
  };
}
