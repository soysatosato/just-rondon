/**
 * 観光と美術館の両方に行がある館(lib/museum-attraction-pairs.js)の点検。
 * 読むだけで、DB には書かない。
 *
 *   npx tsx scripts/check-museum-pairs.ts
 *
 * ページは美術館側の1本だが、行は Attraction と Museum の両方に残っている。
 * 料金・所要時間・開館時間の正は Attraction(旅行プランとファクトバーが読む)で、
 * Museum 側の同じ事実は美術館の一覧・館ページの冒頭・地図・金のスタンプが読む。
 * 片方だけ直すと、一覧とページ、ページの中の冒頭とファクトバーが食い違う。
 * 2026-10 にまとめたときには21組中12組が食い違っていた。
 *
 * 見るのは次のとおり。料金や開館時間を直したら、両方を直してから流す。
 *
 * - 両方の行があり、Attraction が公開中か(非公開だと転送先から観光の要素が消える)
 * - 大人料金: priceAdult を旅行プランと同じ読み方(parsePriceGbp)で数にしたものと、
 *   Museum.price・MuseumInfo.admissionFeeAdult
 * - 所要時間: durationText を同じく parseDurationMinutes で分にしたものと、
 *   MuseumInfo.recommendedDuration
 * - 開館時間: openingHours の先頭の「◯:◯〜◯:◯」と、OpeningHours でいちばん多い時間
 * - 休館曜日: closedWeekdays と、OpeningHours で時刻が空の曜日
 * - 座標: 300m 以上離れていないか(地図のピンと、現地で押す金のスタンプの判定)
 *
 * 問題があれば一覧を出して終了コード1で終わる。
 */

import db from "../utils/db";
import { MUSEUM_ATTRACTION_PAIRS } from "../lib/museum-attraction-pairs";
import {
  parseDurationMinutes,
  parsePriceGbp,
} from "../components/attractions/facts";
import { distanceKm } from "../lib/sightseeing/geo";

/** これより離れていたら座標のどちらかが誤り。施設の代表点のずれとしては大きすぎる。 */
const MAX_GAP_KM = 0.3;

/** OpeningHours.dayOfWeek の値。closedWeekdays と同じ 0=月 〜 6=日 の並び。 */
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** "9:30" → "09:30" */
function hhmm(time: string): string {
  const [h, m] = time.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

/** 「10:00〜17:00(金曜は20:30まで)」の先頭の時間帯。書いていなければ null。 */
function leadingHours(text: string | null): string | null {
  const m = text?.match(/(\d{1,2}:\d{2})\s*[〜~～-]\s*(\d{1,2}:\d{2})/);
  return m ? `${hhmm(m[1])}-${hhmm(m[2])}` : null;
}

async function main() {
  const problems: string[] = [];

  for (const pair of MUSEUM_ATTRACTION_PAIRS) {
    const where = pair.museumSlug;
    const [attraction, museum] = await Promise.all([
      db.attraction.findUnique({
        where: { slug: pair.attractionSlug },
        select: {
          isPublished: true,
          priceAdult: true,
          durationText: true,
          openingHours: true,
          closedWeekdays: true,
          lat: true,
          lng: true,
        },
      }),
      db.museum.findUnique({
        where: { slug: pair.museumSlug },
        select: {
          price: true,
          lat: true,
          lng: true,
          museumInfo: {
            select: { admissionFeeAdult: true, recommendedDuration: true },
          },
          openingHours: {
            select: { dayOfWeek: true, openTime: true, closeTime: true },
          },
        },
      }),
    ]);
    if (!attraction) {
      problems.push(`${where}: Attraction ${pair.attractionSlug} がない`);
      continue;
    }
    if (!museum) {
      problems.push(`${where}: Museum がない`);
      continue;
    }
    if (!attraction.isPublished) {
      problems.push(`${where}: Attraction ${pair.attractionSlug} が非公開`);
    }

    const price = parsePriceGbp(attraction.priceAdult);
    if (price !== null) {
      if (museum.price !== price) {
        problems.push(
          `${where}: 料金 Attraction「${attraction.priceAdult}」→ £${price} / Museum.price £${museum.price}`,
        );
      }
      const fee = museum.museumInfo?.admissionFeeAdult ?? null;
      if (fee !== price) {
        problems.push(
          `${where}: 料金 Attraction「${attraction.priceAdult}」→ £${price} / MuseumInfo.admissionFeeAdult ${fee === null ? "なし" : `£${fee}`}`,
        );
      }
    }

    const minutes = parseDurationMinutes(attraction.durationText);
    const recommended = museum.museumInfo?.recommendedDuration ?? null;
    if (minutes !== null && recommended !== minutes) {
      problems.push(
        `${where}: 所要時間 Attraction「${attraction.durationText}」→ ${minutes}分 / MuseumInfo ${recommended ?? "なし"}分`,
      );
    }

    const lead = leadingHours(attraction.openingHours);
    if (lead && museum.openingHours.length > 0) {
      const counts = new Map<string, number>();
      for (const row of museum.openingHours) {
        if (!row.openTime || !row.closeTime) continue;
        const key = `${hhmm(row.openTime)}-${hhmm(row.closeTime)}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const usual = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (usual && usual !== lead) {
        problems.push(
          `${where}: 開館時間 Attraction「${attraction.openingHours}」/ OpeningHours の通常 ${usual}`,
        );
      }

      const museumClosed = museum.openingHours
        .filter((row) => !row.openTime || !row.closeTime)
        .map((row) => DAYS.indexOf(row.dayOfWeek))
        .filter((i) => i >= 0)
        .sort((a, b) => a - b);
      const attractionClosed = [...attraction.closedWeekdays].sort(
        (a, b) => a - b,
      );
      if (museumClosed.join(",") !== attractionClosed.join(",")) {
        const label = (days: number[]) =>
          days.length > 0 ? days.map((i) => DAYS[i].slice(0, 3)).join("・") : "なし";
        problems.push(
          `${where}: 休館曜日 Attraction ${label(attractionClosed)} / OpeningHours ${label(museumClosed)}`,
        );
      }
    }

    const gap = distanceKm(
      { lat: attraction.lat, lng: attraction.lng },
      { lat: museum.lat, lng: museum.lng },
    );
    if (gap > MAX_GAP_KM) {
      problems.push(`${where}: 座標が ${Math.round(gap * 1000)}m 離れている`);
    }
  }

  if (problems.length > 0) {
    console.log(`${problems.length}件の食い違い:\n`);
    for (const p of problems) console.log(`- ${p}`);
    process.exitCode = 1;
  } else {
    console.log(`${MUSEUM_ATTRACTION_PAIRS.length}組とも食い違いなし`);
  }
}

main().finally(() => db.$disconnect());
