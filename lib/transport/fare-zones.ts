import { distanceKm, type Coords } from "@/lib/sightseeing/geo";
import { STATIONS } from "./stations";

/**
 * スポットの座標から運賃ゾーンを決める。/plan の交通費の見積もりに使う。
 *
 * Attraction.nearestStation は「Greenwich駅 徒歩10分」「目的地によって駅」
 * のような散文で、ゾーンに引き直せない。代わりに座標から一番近い駅を
 * 探し、その駅のゾーンを採る。ゾーンは同心円に近い形をしているので、
 * 最寄り駅と実際に使う駅が違っても、ずれるのは境界の1ゾーンまでにとどまる。
 * 中心部の Zone 1 と Zone 2 は運賃も上限額も同じなので、そのずれは金額に出ない。
 *
 * DBに列を持たせず毎回計算するのは、新しく足したスポットにも自動で
 * ゾーンが付くようにするため。fetchPlanSpots(サーバー)で1度だけ走るので、
 * 駅の表がブラウザに送られることはない。
 */

/** 上限額と片道運賃を持っているゾーン。 */
export type FareZone = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * スポットのゾーン。"outside" は Zone 1-6 の外(ウィンザー、ワトフォード、
 * ビスターなど)で、TfL の上限額で頭打ちにならない鉄道を使う先。
 *
 * Zone 7-9 の駅も "outside" にまとめる。上限額の表(lib/transport/rates.ts)が
 * Zone 1-6 までしか持っていないのと、該当するのがハリー・ポッターの
 * スタジオ(ワトフォード)のような日帰り先だけで、どのみち別枠で扱うため。
 */
export type SpotFareZone = FareZone | "outside";

export function isFareZone(value: unknown): value is FareZone {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 6;
}

/**
 * 一番近い駅より、これだけ遠い駅までは「同じくらい近い」とみなす。
 *
 * 王立天文台は直線では Maze Hill(Zone 3)がいちばん近いが、旅行者は
 * 0.3km 遠いだけの Cutty Sark(Zone 2)で降りる。中心部から来る人は
 * 内側の駅を選ぶので、同じくらい近い駅の中ではゾーンの小さいほうを採る。
 */
const NEAR_TIE_KM = 0.5;

/**
 * スポットのゾーン。採った駅の名前と距離も返す(点検用)。
 *
 * 一番近い駅がゾーン外の駅なら "outside"。ゾーン外の駅を表に残して
 * あるのはこの判定のためで、ゾーン付きの駅だけから探すと、ウィンザー城が
 * 十数km先のヒースロー(Zone 6)に吸い寄せられる。
 */
export function nearestFareZone(coords: Coords): {
  zone: SpotFareZone;
  station: string;
  km: number;
} {
  const measured = STATIONS.map((station) => ({
    station,
    km: distanceKm(coords, { lat: station[1], lng: station[2] }),
  }));
  const nearestKm = Math.min(...measured.map((m) => m.km));

  // ゾーン外は最も外側として比べる。近い駅の中に Zone 1-6 の駅が
  // 1つでもあればそちらが勝ち、無ければ "outside" になる。
  const rank = (zone: number | null) => (isFareZone(zone) ? zone : Infinity);
  let best = measured.find((m) => m.km === nearestKm)!;
  for (const m of measured) {
    if (m.km > nearestKm + NEAR_TIE_KM) continue;
    const better = rank(m.station[3]) - rank(best.station[3]);
    if (better < 0 || (better === 0 && m.km < best.km)) best = m;
  }

  const zone = best.station[3];
  return {
    zone: isFareZone(zone) ? zone : "outside",
    station: best.station[0],
    km: best.km,
  };
}
