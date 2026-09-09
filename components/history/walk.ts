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
  /**
   * 帯に出す写真。Commons の解決済みURL。
   *
   * 出典表記が要るので credit / link と3点セットで持たせる。1枚だけ
   * 欠けた帯にならないよう、任意フィールドにしていない。
   */
  image: string;
  imageAlt: string;
  imageCredit: string;
  imageLink: string;
};

export const HISTORY_WALK: WalkStop[] = [
  {
    place: "ロンドン城壁",
    engPlace: "London Wall at Tower Hill",
    station: "Tower Hill",
    see: "下4.4メートルがローマ期、その上は中世。赤い瓦の列が境目になっている。",
    chapters: [1],
    mapQuery: "London Wall Tower Hill",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/London_Roman_Wall_-_surviving_section_by_Tower_Hill_gardens_full_section.jpg/1280px-London_Roman_Wall_-_surviving_section_by_Tower_Hill_gardens_full_section.jpg",
    imageAlt: "タワーヒルに残るロンドン城壁",
    imageCredit: "Jamzze (CC BY-SA 4.0)",
    imageLink:
      "https://commons.wikimedia.org/wiki/File:London_Roman_Wall_-_surviving_section_by_Tower_Hill_gardens_full_section.jpg",
  },
  {
    place: "ロンドン塔",
    engPlace: "Tower of London",
    station: "Tower Hill",
    see: "征服者が市民を威圧するために建てた白い塔。ローマ城壁の東端でもある。",
    chapters: [3],
    mapQuery: "Tower of London",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/South_Face_of_the_White_Tower_at_the_Tower_of_London_%2801%29.jpg/1280px-South_Face_of_the_White_Tower_at_the_Tower_of_London_%2801%29.jpg",
    imageAlt: "ロンドン塔のホワイト・タワー",
    imageCredit: "Ethan Doyle White (CC BY-SA 4.0)",
    imageLink:
      "https://commons.wikimedia.org/wiki/File:South_Face_of_the_White_Tower_at_the_Tower_of_London_(01).jpg",
  },
  {
    place: "セント・ポール大聖堂",
    engPlace: "St Paul's Cathedral",
    station: "St Paul's",
    see: "大火のあとレンが35年かけて建て直した聖堂と、ブリッツで焼けた周辺の廃墟教会。",
    chapters: [5, 8],
    mapQuery: "St Paul's Cathedral London",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/St_Paul%27s_Cathedral_Dome_2020_Exterior_Ground.jpg/1280px-St_Paul%27s_Cathedral_Dome_2020_Exterior_Ground.jpg",
    imageAlt: "セント・ポール大聖堂のドーム",
    imageCredit: "Julian Herzog (CC BY 4.0)",
    imageLink:
      "https://commons.wikimedia.org/wiki/File:St_Paul%27s_Cathedral_Dome_2020_Exterior_Ground.jpg",
  },
  {
    place: "ウェストミンスター",
    engPlace: "Westminster Abbey & Banqueting House",
    station: "Westminster",
    see: "戴冠式の寺院と、王が処刑台へ出た窓。議会が王に勝った現場。",
    chapters: [2, 4, 5],
    mapQuery: "Westminster Abbey",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Westminster_Abbey_-_geograph.org.uk_-_4765272.jpg/1280px-Westminster_Abbey_-_geograph.org.uk_-_4765272.jpg",
    imageAlt: "夜のウェストミンスター寺院",
    imageCredit: "Peter McDermott (CC BY-SA 2.0)",
    imageLink:
      "https://commons.wikimedia.org/wiki/File:Westminster_Abbey_-_geograph.org.uk_-_4765272.jpg",
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
