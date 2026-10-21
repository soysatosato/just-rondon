import type { PlanEntry } from "./index";

/**
 * 空のプランから始めるためのひな形。
 *
 * 空の状態がこの道具の最大の離脱点だった。「行きたいスポットを選んでください」
 * と言われても、初めてロンドンへ行く人はその選択そのものができない。
 * 完成したプランを1つ渡してから引き算させるほうが早い。
 *
 * 行き先は /sightseeing/itinerary のモデルコースと同じ地区から選んである。
 * 記事と道具が違うことを言うと、どちらを信じればよいか分からなくなる。
 * 記事の Day 1〜3 を直すときは、ここも合わせて直すこと。
 *
 * ひな形は宿を出る時刻と、行き先ごとの滞在時間を持つ。2026-10 の監査まで
 * slug の並びしか持たず、滞在は掲載値の幅の上限(寺院の「2〜3時間」→3時間)で
 * 積まれていた。その結果、看板の「はじめてのロンドン」は11:00に始まる
 * 衛兵交代式に13:20に着き、ほかのひな形も開館の1時間前に館の前に立っていた。
 * 滞在は記事の値に合わせ、1日目は衛兵交代式の時刻に合わせて記事と順番を
 * 変えてある(記事は寺院のあとホース・ガーズの騎兵の交代を見る流れで、
 * バッキンガム宮殿の式には間に合わない)。
 *
 * どのひな形も、この道具自身の警告に引っかからず、開館前に着いたり
 * 閉館後まで居たりしないことを条件にしている。直したら
 * scripts/check-plan-templates.ts を通すこと。ひな形が自分の警告で
 * 赤くなっていたら、助言として成立しない。
 *
 * 並びはそのまま「その日に回る順」になる。地理的に一筆書きになるよう
 * 並べてあるので、読み込んだ直後に「近い順に並べ替える」を押しても
 * 順番はほぼ変わらない。
 */
export type TemplateStop = {
  slug: string;
  /** 滞在時間(分)。記事の値に合わせる。省略すると掲載値。 */
  minutes?: number;
};

export type PlanTemplate = {
  id: string;
  label: string;
  /** カードに出す日数の表記。 */
  span: string;
  blurb: string;
  /**
   * 宿を出る時刻(0時からの分)。読み込むと、プランの宿を出る時刻もこれになる。
   * ひな形の時刻はこの前提で組んであり、9:00のままだと開館前に着く館がある。
   */
  startMinutes: number;
  /**
   * 想定している曜日(0=月 〜 6=日)。週末の2日のように、ひな形が曜日を前提に
   * しているときだけ持つ。点検スクリプトがこの曜日で休館と催しの実施日を確かめる。
   */
  assumedWeekdays?: number[];
  /** 日ごとの行き先。外側が日、内側が回る順。 */
  days: TemplateStop[][];
};

const SAT = 5;
const SUN = 6;

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "classic-3",
    label: "はじめてのロンドン",
    span: "3日間",
    blurb:
      "モデルコースの Day 1〜3 と同じ地区を、時刻が成り立つ順に並べました。11:00に始まる衛兵交代式(月・水・金)を朝に置き、寺院は午後に。シティとテムズ川、大英博物館まわりで、初回で外せないものが3日に収まります。",
    startMinutes: 9 * 60 + 30,
    days: [
      [
        { slug: "st-jamess-park", minutes: 30 },
        { slug: "changing-the-guard-buckingham-palace", minutes: 75 },
        { slug: "westminster-abbey", minutes: 90 },
        { slug: "national-gallery-london", minutes: 150 },
      ],
      [
        { slug: "tower-of-london", minutes: 150 },
        { slug: "london-tower-bridge", minutes: 60 },
        { slug: "leadenhall-market-london", minutes: 20 },
        { slug: "st-pauls-cathedral", minutes: 75 },
        { slug: "millennium-bridge", minutes: 10 },
      ],
      [
        { slug: "british-museum-london", minutes: 150 },
        { slug: "sir-john-soanes-museum", minutes: 75 },
        { slug: "covent-garden", minutes: 60 },
        { slug: "movie-statue-street-leicester-square", minutes: 30 },
      ],
    ],
  },
  {
    id: "weekend-2",
    label: "週末だけの2日",
    span: "2日間",
    blurb:
      "金曜の夜に着いて日曜に発つ人向け。1日3ヶ所に絞りました。衛兵交代式の無い土曜は寺院と美術館、寺院が礼拝だけになる日曜は塔と橋の日です。詰め込まないぶん、行列に当たっても崩れません。",
    startMinutes: 9 * 60 + 30,
    assumedWeekdays: [SAT, SUN],
    days: [
      [
        { slug: "westminster-abbey", minutes: 90 },
        { slug: "st-jamess-park", minutes: 45 },
        { slug: "national-gallery-london", minutes: 150 },
      ],
      [
        { slug: "tower-of-london", minutes: 150 },
        { slug: "london-tower-bridge", minutes: 60 },
        { slug: "borough-market", minutes: 60 },
      ],
    ],
  },
  {
    id: "with-kids-3",
    label: "子どもと行く3日",
    span: "3日間",
    blurb:
      "大きな館は1日2ヶ所まで。恐竜と体験展示のサウス・ケンジントン、乗り物の交通博物館、動物園と公園。子連れは移動そのものが体力を使うので、間に公園や広場を挟んでいます。",
    startMinutes: 9 * 60 + 30,
    days: [
      [
        { slug: "natural-history-museum", minutes: 150 },
        { slug: "science-museum", minutes: 120 },
      ],
      [
        { slug: "london-transport-museum", minutes: 120 },
        { slug: "covent-garden", minutes: 60 },
        { slug: "london-eye", minutes: 30 },
      ],
      [
        { slug: "london-zoo", minutes: 180 },
        { slug: "regents-park", minutes: 60 },
      ],
    ],
  },
  {
    id: "free-2",
    label: "入場料をかけない2日",
    span: "2日間",
    blurb:
      "ここに並ぶスポットは入場料がかかりません。合計£0で2日が埋まります。ロンドンの名門美術館は常設展が無料で、そこだけで半日が過ぎます。スカイ・ガーデンは無料でも予約制です。",
    startMinutes: 9 * 60 + 30,
    days: [
      [
        { slug: "british-museum-london", minutes: 120 },
        { slug: "movie-statue-street-leicester-square", minutes: 30 },
        { slug: "national-gallery-london", minutes: 150 },
      ],
      [
        { slug: "borough-market", minutes: 60 },
        { slug: "sky-garden-london", minutes: 60 },
        { slug: "tate-modern", minutes: 120 },
        { slug: "millennium-bridge", minutes: 10 },
      ],
    ],
  },
];

/** ひな形を保存できる形に直す。滞在時間は読者が入れた値と同じ扱いで持つ。 */
export function templateEntries(template: PlanTemplate): PlanEntry[] {
  return template.days.flatMap((stops, index) =>
    stops.map((stop) =>
      stop.minutes === undefined
        ? { slug: stop.slug, day: index + 1 }
        : { slug: stop.slug, day: index + 1, minutes: stop.minutes },
    ),
  );
}

/** slug → 滞在時間。カードの合計を出すときに buildDayPlan へ渡す。 */
export function templateOverrides(template: PlanTemplate): Map<string, number> {
  const map = new Map<string, number>();
  for (const stop of template.days.flat()) {
    if (stop.minutes !== undefined) map.set(stop.slug, stop.minutes);
  }
  return map;
}
