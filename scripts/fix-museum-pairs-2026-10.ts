/**
 * 観光と美術館の両方に行がある21館の、食い違っていた事実を揃える(2026-10-29)。
 *
 *   npx tsx scripts/fix-museum-pairs-2026-10.ts          # 何を変えるかを出すだけ
 *   npx tsx scripts/fix-museum-pairs-2026-10.ts --apply  # 書き込む
 *
 * ページを美術館側の1本にまとめたとき(lib/museum-attraction-pairs.js)、
 * 21組中12組で料金・所要時間・開館時間が2つの行で違っていた。適用前に
 * backup-db を取ること。適用後は scripts/check-museum-pairs.ts が0件になる。
 *
 * 1. 開館時間と料金は公式で確かめて、誤っていた側を直した(2026-10-29 確認)。
 *    - 大英博物館: 毎日10:00〜17:00、金曜は20:30まで(britishmuseum.org/visit)。
 *      観光側に金曜の夜間開館が無かった。
 *    - ナショナル・ギャラリー: 毎日10:00〜18:00、金曜は21:00まで
 *      (nationalgallery.org.uk の Plan your visit)。同上。
 *    - ブランド博物館: 月〜土10:00〜17:00、日11:00〜17:00
 *      (museumofbrands.com の Key Information)。観光側の18:00が誤り。
 *    - 近衛騎兵博物館: 4〜10月10:00〜18:00、11〜3月10:00〜17:00、最終入場は
 *      閉館1時間前(householdcavalrymuseum.co.uk)。両方が片方の季節だけだった。
 *      曜日ごとの表は季節を持てないので、短い冬の時間を入れる。
 *    - ソーンズ博物館: 水〜日10:00〜17:00、月火休館(soane.org/visit)。
 *      美術館側が月曜を開館にしていた。
 *    - カティサーク: 毎日10:00〜17:00、最終入場16:15。18:00は夏季だけ
 *      (rmg.co.uk)。美術館側が夏の時間だった。
 *    - 王立天文台: 通常10:00〜17:00。美術館側の19:45は夏の夜間開館の時間。
 *      2026-11-02 からの長期休館は lib/christmas/closures.ts と観光側の
 *      closedNote が持つ。
 *    - キングズ・ギャラリー: 10:00〜17:30。9:30開館は7〜9月だけ
 *      (2026年の会期の案内)。会期は2027-04-18まで延長され、週7日開いている
 *      (rct.uk の 2026-05-22 発表)。
 *    - コートールド: 大人£14、寄付込み£16(courtauld.ac.uk の Plan your visit)。
 *      美術館側の£10は古い料金。観光側は先頭の額が寄付込みだったので、
 *      旅行プランの合計が寄付込みで計算されていた。
 *    - ロンドン交通博物館: 大人£27(1年有効の年間パス。ltmuseum.co.uk の
 *      Tickets)。観光側£24.50・美術館側£25はどちらも古い料金。
 * 2. 所要時間は公式の数字が無い目安なので、旅行プランがすでに使っている
 *    観光側の値(parseDurationMinutes の読み方)に美術館側を揃える。
 * 3. 料金も同じく、観光側の値(parsePriceGbp の読み方)に美術館側を揃える。
 * 4. 座標は美術館側の3館が住所と合っていなかった。観光側の値に揃える。
 *    コートールドは経度の符号が逆で、16km 東(テムズ下流)を指していた。
 * 5. 休館曜日を確かめた館は closedDaysCheckedAt を入れる(ファクトバーに
 *    「曜日の休館なし・2026年10月時点」と出る)。すでに入っている館は触らない。
 * 6. 月次号の項目に残っていた旧 URL(/sightseeing/london-museum-smithfield)を
 *    美術館側に直す。転送はあるが、サイト内のリンクは転送を経由させない。
 */

import db from "../utils/db";
import { MUSEUM_ATTRACTION_PAIRS } from "../lib/museum-attraction-pairs";
import {
  parseDurationMinutes,
  parsePriceGbp,
} from "../components/attractions/facts";

const APPLY = process.argv.includes("--apply");
const CHECKED_AT = new Date("2026-10-29T00:00:00Z");

/** 観光側の文言の訂正。キーは Attraction.slug。 */
const ATTRACTION_FIXES: Record<
  string,
  { openingHours?: string; priceAdult?: string; checkedClosedDays?: boolean }
> = {
  "british-museum-london": {
    openingHours: "10:00〜17:00（金曜は20:30まで）",
    checkedClosedDays: true,
  },
  "national-gallery-london": {
    openingHours: "10:00〜18:00（金曜は21:00まで）",
    checkedClosedDays: true,
  },
  "museum-of-brands-london": {
    openingHours: "10:00〜17:00（日曜は11:00から）",
    checkedClosedDays: true,
  },
  "household-cavalry-museum": {
    openingHours: "10:00〜17:00（4〜10月は18:00まで。最終入場は閉館の1時間前）",
    checkedClosedDays: true,
  },
  "sir-john-soanes-museum": { checkedClosedDays: true },
  "cutty-sark": { checkedClosedDays: true },
  "kings-gallery-buckingham-palace": { checkedClosedDays: true },
  "courtauld-gallery": {
    priceAdult: "£14〜（寄付込みは£16）",
    checkedClosedDays: true,
  },
  "london-transport-museum": { priceAdult: "£27" },
};

/** 美術館側の曜日ごとの時間の訂正。null は休館。キーは Museum.slug。 */
const MUSEUM_HOURS: Record<string, Record<string, [string, string] | null>> = {
  "sir-john-soanes-museum": { Monday: null },
  "royal-observatory-greenwich": everyDay(["10:00", "17:00"]),
  "kings-gallery": everyDay(["10:00", "17:30"]),
  "cutty-sark": everyDay(["10:00", "17:00"]),
};

/** 座標を観光側に揃える館(Museum.slug)。 */
const MOVE_TO_ATTRACTION_COORDS = [
  "courtauld-gallery",
  "cutty-sark",
  "museum-of-brands",
];

function everyDay(hours: [string, string]) {
  return Object.fromEntries(
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => [day, hours]),
  );
}

async function main() {
  const changes: string[] = [];

  for (const pair of MUSEUM_ATTRACTION_PAIRS) {
    const attraction = await db.attraction.findUniqueOrThrow({
      where: { slug: pair.attractionSlug },
      select: {
        id: true,
        priceAdult: true,
        durationText: true,
        openingHours: true,
        closedDaysCheckedAt: true,
        lat: true,
        lng: true,
      },
    });
    const museum = await db.museum.findUniqueOrThrow({
      where: { slug: pair.museumSlug },
      select: {
        id: true,
        price: true,
        lat: true,
        lng: true,
        museumInfo: {
          select: { id: true, admissionFeeAdult: true, recommendedDuration: true },
        },
        openingHours: {
          select: { id: true, dayOfWeek: true, openTime: true, closeTime: true },
        },
      },
    });

    // 1・5. 観光側の文言
    const fix = ATTRACTION_FIXES[pair.attractionSlug];
    const attractionData: {
      openingHours?: string;
      priceAdult?: string;
      closedDaysCheckedAt?: Date;
    } = {};
    if (fix?.openingHours && fix.openingHours !== attraction.openingHours) {
      attractionData.openingHours = fix.openingHours;
      changes.push(
        `${pair.attractionSlug} openingHours「${attraction.openingHours}」→「${fix.openingHours}」`,
      );
    }
    if (fix?.priceAdult && fix.priceAdult !== attraction.priceAdult) {
      attractionData.priceAdult = fix.priceAdult;
      changes.push(
        `${pair.attractionSlug} priceAdult「${attraction.priceAdult}」→「${fix.priceAdult}」`,
      );
    }
    if (fix?.checkedClosedDays && !attraction.closedDaysCheckedAt) {
      attractionData.closedDaysCheckedAt = CHECKED_AT;
      changes.push(`${pair.attractionSlug} closedDaysCheckedAt → 2026-10-29`);
    }
    if (APPLY && Object.keys(attractionData).length > 0) {
      await db.attraction.update({
        where: { id: attraction.id },
        data: attractionData,
      });
    }

    // 2・3. 美術館側の料金と所要時間を観光側の値に揃える
    const priceText = attractionData.priceAdult ?? attraction.priceAdult;
    const price = parsePriceGbp(priceText);
    const minutes = parseDurationMinutes(attraction.durationText);
    if (price !== null && museum.price !== price) {
      changes.push(`${pair.museumSlug} price £${museum.price} → £${price}`);
      if (APPLY) {
        await db.museum.update({ where: { id: museum.id }, data: { price } });
      }
    }
    const info = museum.museumInfo;
    if (info) {
      const infoData: { admissionFeeAdult?: number; recommendedDuration?: number } = {};
      if (price !== null && info.admissionFeeAdult !== price) {
        infoData.admissionFeeAdult = price;
        changes.push(
          `${pair.museumSlug} admissionFeeAdult ${info.admissionFeeAdult ?? "なし"} → ${price}`,
        );
      }
      if (minutes !== null && info.recommendedDuration !== minutes) {
        infoData.recommendedDuration = minutes;
        changes.push(
          `${pair.museumSlug} recommendedDuration ${info.recommendedDuration ?? "なし"} → ${minutes}`,
        );
      }
      if (APPLY && Object.keys(infoData).length > 0) {
        await db.museumInfo.update({ where: { id: info.id }, data: infoData });
      }
    }

    // 1. 美術館側の曜日ごとの時間
    for (const [day, hours] of Object.entries(MUSEUM_HOURS[pair.museumSlug] ?? {})) {
      const row = museum.openingHours.find((r) => r.dayOfWeek === day);
      const openTime = hours?.[0] ?? null;
      const closeTime = hours?.[1] ?? null;
      if (!row) throw new Error(`${pair.museumSlug} に ${day} の行がない`);
      if (row.openTime === openTime && row.closeTime === closeTime) continue;
      changes.push(
        `${pair.museumSlug} ${day} ${row.openTime ?? "休"}-${row.closeTime ?? "休"} → ${openTime ?? "休"}-${closeTime ?? "休"}`,
      );
      if (APPLY) {
        await db.openingHours.update({
          where: { id: row.id },
          data: { openTime, closeTime },
        });
      }
    }

    // 4. 座標
    if (
      MOVE_TO_ATTRACTION_COORDS.includes(pair.museumSlug) &&
      (museum.lat !== attraction.lat || museum.lng !== attraction.lng)
    ) {
      changes.push(
        `${pair.museumSlug} 座標 ${museum.lat},${museum.lng} → ${attraction.lat},${attraction.lng}`,
      );
      if (APPLY) {
        await db.museum.update({
          where: { id: museum.id },
          data: { lat: attraction.lat, lng: attraction.lng },
        });
      }
    }
  }

  // 6. 月次号の旧 URL
  const items = await db.monthlyChangeItem.findMany({
    where: { sitePath: { startsWith: "/sightseeing/" } },
    select: { id: true, sitePath: true },
  });
  for (const item of items) {
    const slug = item.sitePath!.replace(/^\/sightseeing\//, "");
    const pair = MUSEUM_ATTRACTION_PAIRS.find((p) => p.attractionSlug === slug);
    if (!pair) continue;
    const next = `/museums/${pair.museumSlug}`;
    changes.push(`MonthlyChangeItem ${item.id} sitePath ${item.sitePath} → ${next}`);
    if (APPLY) {
      await db.monthlyChangeItem.update({
        where: { id: item.id },
        data: { sitePath: next },
      });
    }
  }

  console.log(changes.map((c) => `- ${c}`).join("\n"));
  console.log(
    `\n${changes.length}件${APPLY ? "を書き込みました" : "(--apply で書き込みます)"}`,
  );
}

main().finally(() => db.$disconnect());
