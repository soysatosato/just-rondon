/**
 * 宿泊エリア → 空港・主要スポットの所要時間を TfL から引いて JSON に焼く。
 *
 *   npm run fill-hotel-travel-times
 *
 * 出力先: components/sightseeing/guides/hotels/travel-times.json (コミットする)
 *
 * 走らせるのは路線が変わったときだけでよい。エリザベス線の延伸や
 * 空港アクセスの改廃があったら再実行する。
 *
 * 測り方(理由は lib/hotels/travel-times.ts の設計メモを参照):
 *   空港   … 起点駅 → ターミナル直結駅を1回引く
 *   スポット… 「起点駅 → 最寄駅」の乗車と「最寄駅 → スポット」の徒歩を
 *             別々に引いて足し、さらに「起点駅から直接歩く」場合と比べて
 *             短いほうを採る
 *
 * 座標を渡すと TfL が架空の徒歩区間を足してくるため、駅は必ず NaptanId で
 * 指定している。詳細は設計メモ4。
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  destinations,
  LUTON_DART_MINUTES,
  origins,
  TRAVEL_TIME_DEPARTURE,
  type Destination,
  type Origin,
  type TravelLeg,
  type TravelTimeTable,
} from "../lib/hotels/travel-times";

const OUT_PATH = join(
  process.cwd(),
  "components/sightseeing/guides/hotels/travel-times.json"
);

/** 乗車で使う交通機関。walking は入れない(徒歩は別に測るため)。 */
const TRANSIT_MODES = "tube,dlr,elizabeth-line,overground,national-rail";

/**
 * 429 対策。lib/tfl/nearest-station.ts と同じ考え方で、枠切れと 5xx だけ
 * 指数で待って引き直す。途中で落ちると、どこまで進んだか分からないまま
 * JSON が欠けた状態になる。
 */
const MAX_RETRIES = 4;
const RETRY_BASE_MS = 5000;
/** 区間ごとの待ち。無登録枠は1分50回なので、これで半分程度に収まる。 */
const PACE_MS = 1200;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type TflLeg = { duration?: number; mode?: { id?: string } };
type TflJourney = { duration?: number; legs?: TflLeg[] };

async function tflJson<T>(url: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        // UA が無いと TfL に 403 で弾かれることがある。
        "User-Agent": "just-rondon/1.0 (+https://www.just-rondon.com)",
      },
    });

    if (res.ok) return (await res.json()) as T;

    const retriable = res.status === 429 || res.status >= 500;
    if (!retriable || attempt >= MAX_RETRIES) {
      throw new Error(`TfL API responded ${res.status} for ${url}`);
    }
    await wait(RETRY_BASE_MS * 2 ** attempt);
  }
}

/**
 * 経路を1本引いて、最短の候補を返す。
 *
 * TfL は複数の候補を返すので**最短のものを採る**。読者が知りたいのは
 * 「その気になれば何分で着くか」であって、たまたま先頭に来た経路の
 * 分数ではない。journeyPreference=leasttime を付けたうえで、返ってきた
 * 候補からも最小を選ぶ(preference は候補の並びを保証しない)。
 */
async function journey(
  from: string,
  to: string,
  modes: string,
  timed: boolean
): Promise<{ minutes: number; changes: number } | null> {
  const timing = timed
    ? `date=${TRAVEL_TIME_DEPARTURE.date}&time=${TRAVEL_TIME_DEPARTURE.time}&timeIs=departing&`
    : "";
  const url =
    `https://api.tfl.gov.uk/Journey/JourneyResults/${from}/to/${to}` +
    `?${timing}journeyPreference=leasttime&mode=${modes}`;

  let data: { journeys?: TflJourney[] };
  try {
    data = await tflJson<{ journeys?: TflJourney[] }>(url);
  } catch (error) {
    console.warn(`  ! ${from} -> ${to}: ${(error as Error).message}`);
    return null;
  }

  const journeys = (data.journeys ?? []).filter(
    (j) => typeof j.duration === "number"
  );
  if (journeys.length === 0) return null;

  const best = journeys.reduce((a, b) => (a.duration! <= b.duration! ? a : b));
  const rides = (best.legs ?? []).filter(
    (l) => l.mode?.id && l.mode.id !== "walking"
  );

  return { minutes: best.duration!, changes: Math.max(rides.length - 1, 0) };
}

/** 駅からスポットまでの徒歩。mode=walking で単独に引く(設計メモ5)。 */
async function walkMinutes(
  naptanId: string,
  lat: number,
  lng: number
): Promise<number | null> {
  const result = await journey(naptanId, `${lat},${lng}`, "walking", false);
  return result?.minutes ?? null;
}

async function measureAirport(
  origin: Origin,
  dest: Destination
): Promise<TravelLeg | null> {
  const ride = await journey(origin.naptanId, dest.naptanId, TRANSIT_MODES, true);
  if (!ride) {
    console.warn(`  ! ${origin.id} -> ${dest.id}: 経路なし`);
    return null;
  }
  // ルートンだけ、TfL が知らない DART 区間を足す(設計メモ7)。
  const extra = dest.id === "ltn" ? LUTON_DART_MINUTES : 0;
  return {
    destinationId: dest.id,
    minutes: ride.minutes + extra,
    changes: ride.changes,
    walkOnly: false,
  };
}

async function measureLandmark(
  origin: Origin,
  dest: Destination,
  stationWalk: number
): Promise<TravelLeg | null> {
  // 起点駅がそのままスポットの最寄駅なら、乗る意味がない。
  if (origin.naptanId === dest.naptanId) {
    return {
      destinationId: dest.id,
      minutes: stationWalk,
      changes: 0,
      walkOnly: true,
      walkMinutes: stationWalk,
    };
  }

  const direct = await walkMinutes(origin.naptanId, dest.lat!, dest.lng!);
  await wait(PACE_MS);
  const ride = await journey(origin.naptanId, dest.naptanId, TRANSIT_MODES, true);

  const byTrain = ride ? ride.minutes + stationWalk : null;

  // 直接歩いたほうが速ければそちらを採る(設計メモ6)。
  if (direct !== null && (byTrain === null || direct <= byTrain)) {
    return {
      destinationId: dest.id,
      minutes: direct,
      changes: 0,
      walkOnly: true,
      walkMinutes: direct,
    };
  }
  if (byTrain !== null && ride) {
    return {
      destinationId: dest.id,
      minutes: byTrain,
      changes: ride.changes,
      walkOnly: false,
      // 乗車が勝っても徒歩値は捨てない。「歩ける」は決め手になる。
      ...(direct !== null ? { walkMinutes: direct } : {}),
    };
  }

  console.warn(`  ! ${origin.id} -> ${dest.id}: 経路なし`);
  return null;
}

async function main() {
  const landmarks = destinations.filter((d) => d.kind === "landmark");
  const airports = destinations.filter((d) => d.kind === "airport");

  // スポットの「最寄駅からの徒歩」は起点によらず一定なので、先に一度だけ測る。
  console.log("スポットの最寄駅からの徒歩を測ります:");
  const stationWalks = new Map<string, number>();
  for (const d of landmarks) {
    const m = await walkMinutes(d.naptanId, d.lat!, d.lng!);
    if (m === null) throw new Error(`${d.id}: 最寄駅からの徒歩が引けませんでした`);
    stationWalks.set(d.id, m);
    console.log(`  ${d.label}: 徒歩${m}分`);
    await wait(PACE_MS);
  }

  console.log(
    `\n${origins.length}エリア × ${destinations.length}行き先を測ります` +
      `（出発 ${TRAVEL_TIME_DEPARTURE.date} ${TRAVEL_TIME_DEPARTURE.time}）\n`
  );

  const areas: Record<string, TravelLeg[]> = {};
  let failures = 0;

  for (const origin of origins) {
    const legs: TravelLeg[] = [];

    for (const dest of landmarks) {
      const leg = await measureLandmark(origin, dest, stationWalks.get(dest.id)!);
      if (leg) legs.push(leg);
      else failures++;
      await wait(PACE_MS);
    }
    for (const dest of airports) {
      const leg = await measureAirport(origin, dest);
      if (leg) legs.push(leg);
      else failures++;
      await wait(PACE_MS);
    }

    areas[origin.id] = legs;
    console.log(
      `${origin.id.padEnd(14)} ` +
        legs
          .map(
            (l) =>
              `${l.destinationId} ${l.minutes}分${l.walkOnly ? "(徒歩)" : ""}`
          )
          .join(" / ")
    );
  }

  /**
   * 大量に欠けたら書かない。バックアップと同じ考え方で、壊れた結果で
   * 正常な JSON を上書きするほうが、古いままより害が大きい。
   */
  const total = origins.length * destinations.length;
  if (failures > total / 4) {
    console.error(
      `\n中止: ${total}区間中 ${failures}件が取得できませんでした。既存のJSONは残します。`
    );
    process.exit(1);
  }

  const table: TravelTimeTable = {
    generatedAt: new Date().toISOString(),
    departure: { ...TRAVEL_TIME_DEPARTURE },
    areas,
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(table, null, 2)}\n`, "utf8");
  console.log(`\n書き出しました: ${OUT_PATH}`);
  if (failures > 0) console.log(`（${failures}件は取得できず省略）`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
