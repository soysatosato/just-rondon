import { historyChapters } from "./chapters";

/**
 * 「1日で2000年を歩く」順路。
 *
 * このセクションの存在理由は、読める通史ではなく歩ける通史であること
 * (types.ts の whereToStand を必須にしているのと同じ理由)。ハブに章を
 * 並べるだけだと、その理由がハブの上で一度も見えない。各章の
 * whereToStand から東西一直線に並ぶ4地点だけを抜いて、順路にする。
 *
 * 地点は必ずどれかの章の whereToStand に実在するものを使うこと。
 * ここだけで新しい場所を足すと、章の本文に裏付けのない案内になる。
 * 並びは地理の東から西。Tower Hill を起点にすると、時代の古い順と
 * 歩く向きがだいたい一致する。
 */

export type WalkStop = {
  /** 表示名。章の whereToStand の name を短くしたもの。 */
  place: string;
  engPlace: string;
  station: string;
  /** ここで何が見えるか。1行で。 */
  see: string;
  /** この地点が受け持つ章。番号は historyChapters と一致させる。 */
  chapters: number[];
  mapQuery: string;
};

export const HISTORY_WALK: WalkStop[] = [
  {
    place: "ロンドン城壁",
    engPlace: "London Wall at Tower Hill",
    station: "Tower Hill",
    see: "下4.4メートルがローマ期、その上は中世。赤い瓦の列が境目になっている。",
    chapters: [1],
    mapQuery: "London Wall Tower Hill",
  },
  {
    place: "ロンドン塔",
    engPlace: "Tower of London",
    station: "Tower Hill",
    see: "征服者が市民を威圧するために建てた白い塔。ローマ城壁の東端でもある。",
    chapters: [3],
    mapQuery: "Tower of London",
  },
  {
    place: "セント・ポール大聖堂",
    engPlace: "St Paul's Cathedral",
    station: "St Paul's",
    see: "大火のあとレンが35年かけて建て直した聖堂と、ブリッツで焼けた周辺の廃墟教会。",
    chapters: [5, 8],
    mapQuery: "St Paul's Cathedral London",
  },
  {
    place: "ウェストミンスター",
    engPlace: "Westminster Abbey & Banqueting House",
    station: "Westminster",
    see: "戴冠式の寺院と、王が処刑台へ出た窓。議会が王に勝った現場。",
    chapters: [2, 4, 5],
    mapQuery: "Westminster Abbey",
  },
];

/**
 * FAQ の答えに出す一行。順路を2箇所に書くと必ず食い違うので、
 * 表示用の帯と同じ配列から組み立てる。
 */
export function walkRouteSentence() {
  return HISTORY_WALK.map(
    (stop) =>
      `${stop.place}（第${stop.chapters.map((n) => `${n}`).join("・")}章）`,
  ).join(" → ");
}

/** 順路が受け持つ章の集合。「10章のうち何章ぶんか」を出すのに使う。 */
export const WALK_CHAPTER_COUNT = new Set(
  HISTORY_WALK.flatMap((stop) => stop.chapters),
).size;

/** 番号から章メタを引く。順路の帯にラベルを出すため。 */
export function chapterByNumber(number: number) {
  return historyChapters.find((c) => c.number === number) ?? null;
}
