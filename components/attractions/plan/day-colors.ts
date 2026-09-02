/**
 * 日ごとの色。
 *
 * 全日程を1枚の地図に載せると、ピンだけでは「どれが2日目か」が読めない。
 * 番号を振っても、日ごとに1から振り直すので同じ「1」が10個並ぶ。
 * 日を色で分けると、地図を見ただけで「2日目と4日目が同じ地区に固まって
 * いる」ことが分かり、それがこの道具で唯一まとめて直せる無駄になる。
 *
 * 色は日のカードの見出し・帯・地図のピン・日程チップで共通に使う。
 * 地図のピンは Leaflet の divIcon に文字列で埋め込むので、Tailwind の
 * クラスではなく16進で持つ。表示側も同じ値を style で当てる——
 * 動的なクラス名は Tailwind の走査に載らず、本番ビルドで色が消える。
 *
 * 並びは隣り合う日ができるだけ離れて見えるようにしてある(青→緑→橙→桃)。
 * 明度は light/dark のどちらの地に置いても白抜き文字が読める範囲に
 * 揃えてあり、色を落として見る人のために番号と日付は常に文字でも出す。
 */
export const DAY_COLORS = [
  "#4f46e5", // indigo
  "#0d9488", // teal
  "#d97706", // amber
  "#db2777", // pink
  "#2563eb", // blue
  "#65a30d", // lime
  "#c026d3", // fuchsia
  "#0891b2", // cyan
  "#ea580c", // orange
  "#7c3aed", // violet
] as const;

/** 何日目かに対応する色。1始まり。上限を越えたら巡回させる。 */
export function dayColor(day: number): string {
  const index = (Math.max(1, Math.round(day)) - 1) % DAY_COLORS.length;
  return DAY_COLORS[index];
}
