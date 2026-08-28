import type { Musical } from "@prisma/client";

import { SITE_URL } from "@/lib/seo";
export { SITE_URL };

// 一覧に出すのは名前・URL・画像だけ。全カラムを要求すると、
// 呼び出し側が JSON-LD のためだけに description まで取る羽目になる。
export function collectionPageJsonLd(
  musicals: Pick<Musical, "name" | "slug" | "image">[],
) {
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

/** startDate/endDate を出すのに必要な最小限。呼び出し側は
 *  fetchMusicalPerformances の戻り値をそのまま渡せる。 */
type PerformanceForJsonLd = {
  startsAt: Date;
  timeTba: boolean;
  status: string;
};

/**
 * startDate/endDate は MusicalPerformance(Ticketmaster 由来の実際の公演日時)
 * から出す。かつては日程データを持っておらず、捏造した日付を載せるくらいなら
 * リッチリザルト対象外のままにする、という判断で省略していた。いまは
 * TM 同期で実データがあるので、載せない理由のほうが無くなった。
 *
 * 日程が1件も無い作品では従来どおり両方とも省く。startDate は Google の
 * イベントリッチリザルトで必須なので対象外のままだが、
 * 「無いものは名乗らない」方針は変えない。
 *
 * timeTba(開演時刻が未定)の公演は日付だけを出す。時刻を 00:00 として
 * 送ると、確定していない開演時刻を名乗ることになるため。
 */
export function theaterEventJsonLd(
  musical: Musical,
  performances: PerformanceForJsonLd[] = [],
) {
  // 中止・延期は日程として扱わない(fetchMusicalPerformances と同じ基準)。
  const dated = performances
    .filter((p) => !["cancelled", "postponed"].includes(p.status))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const first = dated[0];
  const last = dated[dated.length - 1];

  // 時刻未定なら日付まで、確定していれば ISO8601 の日時ごと出す。
  const stamp = (p: PerformanceForJsonLd) =>
    p.timeTba ? p.startsAt.toISOString().slice(0, 10) : p.startsAt.toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    name: musical.name,
    image: musical.image,
    url: `${SITE_URL}/musicals/${musical.slug}`,
    description: musical.summary,
    ...(first ? { startDate: stamp(first) } : {}),
    ...(last ? { endDate: stamp(last) } : {}),
    // 同期対象は上演中の公演だけなので、個別に中止・延期を除いた時点で
    // 残りは予定どおり上演される公演になる。
    ...(first
      ? { eventStatus: "https://schema.org/EventScheduled" }
      : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
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
