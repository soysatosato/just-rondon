import type { PlanEntry } from "./index";

/**
 * 空のプランから始めるためのひな形。
 *
 * 空の状態がこの道具の最大の離脱点だった。「行きたいスポットを選んでください」
 * と言われても、初めてロンドンへ行く人はその選択そのものができない。
 * 完成したプランを1つ渡してから引き算させるほうが早い。
 *
 * 中身は /sightseeing/itinerary のモデルコースと揃えてある。記事と道具が
 * 違う順路を出すと、どちらを信じればよいか分からなくなる。記事の Day 1〜3 を
 * 直すときは、ここも合わせて直すこと。
 *
 * 並びはそのまま「その日に回る順」になる。地理的に一筆書きになるよう
 * 並べてあるので、読み込んだ直後に「近い順に並べ替える」を押しても
 * 順番は変わらない(押しても何も起きないボタンは出ない)。
 *
 * どのひな形も、この道具自身の警告に引っかからないことを条件にしている。
 * 滞在2時間以上の施設は1日2ヶ所まで、1日の合計は9時間以内。
 * ひな形が自分の警告で赤くなっていたら、助言として成立しない。
 */
export type PlanTemplate = {
  id: string;
  label: string;
  /** カードに出す日数の表記。 */
  span: string;
  blurb: string;
  /** 日ごとの slug。外側が日、内側が回る順。 */
  days: string[][];
};

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "classic-3",
    label: "はじめてのロンドン",
    span: "3日間",
    blurb:
      "モデルコースの Day 1〜3 をそのまま。ウェストミンスターの王道、シティとテムズ川、大英博物館まわり。初回で外せないものが3日に収まります。",
    days: [
      [
        "westminster-abbey",
        "st-jamess-park",
        "changing-the-guard-buckingham-palace",
        "national-gallery-london",
      ],
      [
        "tower-of-london",
        "london-tower-bridge",
        "leadenhall-market-london",
        "st-pauls-cathedral",
        "millennium-bridge",
      ],
      [
        "british-museum-london",
        "sir-john-soanes-museum",
        "covent-garden",
        "movie-statue-street-leicester-square",
      ],
    ],
  },
  {
    id: "weekend-2",
    label: "週末だけの2日",
    span: "2日間",
    blurb:
      "金曜の夜に着いて日曜に発つ人向け。1日3ヶ所に絞り、王室まわりと塔・橋だけを押さえます。詰め込まないぶん、行列に当たっても崩れません。",
    days: [
      [
        "westminster-abbey",
        "changing-the-guard-buckingham-palace",
        "national-gallery-london",
      ],
      ["tower-of-london", "london-tower-bridge", "borough-market"],
    ],
  },
  {
    id: "with-kids-3",
    label: "子どもと行く3日",
    span: "3日間",
    blurb:
      "1日2ヶ所まで。恐竜と体験展示のサウス・ケンジントン、乗り物の交通博物館、動物園と公園。子連れは移動そのものが体力を使うので、間に公園を挟んでいます。",
    days: [
      ["natural-history-museum", "science-museum"],
      ["london-transport-museum", "covent-garden", "london-eye"],
      ["london-zoo", "regents-park"],
    ],
  },
  {
    id: "free-2",
    label: "入場料をかけない2日",
    span: "2日間",
    blurb:
      "ここに並ぶスポットは入場料がかかりません。合計£0で2日が埋まります。ロンドンの名門美術館は常設展が無料で、そこだけで半日が過ぎます。",
    days: [
      [
        "british-museum-london",
        "movie-statue-street-leicester-square",
        "national-gallery-london",
      ],
      [
        "sky-garden-london",
        "borough-market",
        "tate-modern",
        "millennium-bridge",
      ],
    ],
  },
];

/** ひな形を保存できる形に直す。 */
export function templateEntries(template: PlanTemplate): PlanEntry[] {
  return template.days.flatMap((slugs, index) =>
    slugs.map((slug) => ({ slug, day: index + 1 })),
  );
}
