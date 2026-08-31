/**
 * 緯度経度から2点間の距離を出す。ロンドン周辺だけを相手にする平面近似。
 *
 * Haversine を使わないのは、緯度差が1度に満たない範囲では誤差が数十mに
 * とどまり、この誤差が意味を持つ場面がサイト内に無いため。徒歩何分かを
 * 「8分」と丸めて出す用途に、球面三角法の精度は要らない。
 *
 * 掲載スポットは北緯51.33〜51.89・東経-1.16〜0.05 に収まっている
 * (ビスター・ヴィレッジが西の端)。この範囲を超える座標を渡すと
 * 経度の換算係数がずれるので、他都市には流用しないこと。
 */

/** 緯度1度 ≒ 111km。 */
export const KM_PER_LAT_DEG = 111;
/** ロンドン(北緯51.5度)の経度1度 ≒ 69km。 */
export const KM_PER_LNG_DEG_LONDON = 69;

export type Coords = { lat: number; lng: number };

/** 2点間の直線距離(km)。 */
export function distanceKm(a: Coords, b: Coords): number {
  const dLat = (a.lat - b.lat) * KM_PER_LAT_DEG;
  const dLng = (a.lng - b.lng) * KM_PER_LNG_DEG_LONDON;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}
