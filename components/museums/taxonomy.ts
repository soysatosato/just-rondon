/**
 * 全館一覧(/museums/all-museums)の分類軸。
 *
 * DB の Museum は category が全件 "museum" で、館を区別する手がかりは
 * highlights[] の自由記述タグ(47館で125語、大半が出現1回)しかない。
 * これは表示やキーワード検索には効くが、facet としては細かすぎる。
 * そこで「何が置いてあるか」と「どこにあるか」を、ここで slug ごとに
 * 手で与える。
 *
 * 座標や住所から機械的に導かないのは Attraction.area と同じ理由で、
 * サマセット・ハウス(WC2R)はトラファルガー広場から歩けるのに郵便番号は
 * 隣接を示さないし、逆に SE1 は帝国戦争博物館からバンクサイドまで
 * 歩けない距離をひとつにまとめてしまうため。徒歩で回れるかどうかは
 * 編集判断なので、コードに持たせて目で確かめられるようにしている。
 *
 * 館を追加したら MUSEUM_GENRE / MUSEUM_AREA の両方に行を足すこと。
 * 落とすと genre は "curious"、area は "outer" に落ちる。
 */

export type GenreSlug =
  | "art"
  | "history"
  | "science"
  | "design"
  | "house"
  | "transport"
  | "war"
  | "curious";

export type GenreMeta = {
  slug: GenreSlug;
  /** セクション見出し。文章として読ませる長さ。 */
  label: string;
  /**
   * 絞り込みチップ用の短縮名。
   *
   * 見出しの label をそのままチップに使うと、8個並べた時点でスマホでは
   * 6〜7行に折り返して絞り込み欄が画面を埋めてしまう。ここは2〜4文字に切る。
   */
  chip: string;
  /** 見出しの上に出す英字。 */
  eyebrow: string;
  /** セクションの導入。何を期待して入るべき館の群かを1〜2文で。 */
  blurb: string;
};

/**
 * セクションの並び。
 *
 * 絵画・歴史・科学が先頭なのは、初訪問者が挙げる館がほぼこの3つに
 * 入るから。後半は「2回目以降に効く」順に落としてある。
 */
export const GENRES: GenreMeta[] = [
  {
    slug: "art",
    chip: "絵画",
    label: "絵画と彫刻を見る",
    eyebrow: "Art",
    blurb:
      "ロンドンの絵画はほとんど無料で見られます。ゴッホもフェルメールもターナーも、チケット売り場を通らずに目の前にあります。1点だけ決めて20分で出ても、誰にも咎められません。",
  },
  {
    slug: "history",
    chip: "世界史",
    label: "世界史と考古学",
    eyebrow: "History",
    blurb:
      "帝国が世界中から集めたものが、いまも同じ建物に置かれています。見応えと後味の悪さが同居する場所で、そのことを含めて見る価値があります。",
  },
  {
    slug: "science",
    chip: "自然科学",
    label: "自然・科学・宇宙",
    eyebrow: "Science",
    blurb:
      "恐竜の全身骨格、鉱物、標本、望遠鏡。子ども向けに見えて、大人が一番長居してしまう区分です。週末と学校休暇は朝いちに行ってください。",
  },
  {
    slug: "design",
    chip: "デザイン",
    label: "デザインと工芸、ファッション",
    eyebrow: "Design",
    blurb:
      "服、家具、陶磁器、広告、パッケージ。「作られたもの」を主役にした館です。美術館より身近な分、お土産選びの目も変わります。",
  },
  {
    slug: "house",
    chip: "誰かの家",
    label: "誰かが住んでいた家",
    eyebrow: "House",
    blurb:
      "作家や画家、建築家が実際に暮らした家がそのまま残っています。展示室と違って部屋の狭さや天井の低さが伝わるので、1時間で満腹になれます。",
  },
  {
    slug: "transport",
    chip: "乗り物",
    label: "乗り物と、産業とお金",
    eyebrow: "Industry",
    blurb:
      "地下鉄、帆船、運河、郵便、紙幣。街がどう動いてきたかを扱う館です。ロンドンで毎日使っているものの裏側なので、滞在中に見ると効きます。",
  },
  {
    slug: "war",
    chip: "戦争",
    label: "戦争と軍事",
    eyebrow: "War",
    blurb:
      "英国の20世紀は戦争の世紀でした。武器の展示だけでなく、空襲下の市民生活やホロコーストを扱う常設展があり、静かに時間を取られます。",
  },
  {
    slug: "curious",
    chip: "変わり種",
    label: "変わり種と、一点突破の専門館",
    eyebrow: "Curious",
    blurb:
      "扇子、テニス、庭園、女性の体、剥製とオカルト。ひとつの主題だけで館が建っています。有名どころを見終えた2回目以降のロンドンで、いちばん記憶に残るのはこの辺りです。",
  },
];

export const GENRE_BY_SLUG: Record<GenreSlug, GenreMeta> = Object.fromEntries(
  GENRES.map((g) => [g.slug, g]),
) as Record<GenreSlug, GenreMeta>;

/** slug → ジャンル。1館は1ジャンルに置く(複数タグにすると絞り込みの結果が読めなくなる)。 */
export const MUSEUM_GENRE: Record<string, GenreSlug> = {
  // 絵画と彫刻
  "national-gallery": "art",
  "tate-britain": "art",
  "tate-modern": "art",
  "courtauld-gallery": "art",
  "the-wallace-collection": "art",
  "national-portrait-gallery": "art",
  "kings-gallery": "art",
  "whitechapel-gallery": "art",

  // 世界史と考古学
  "british-museum": "history",
  "british-library": "history",
  "london-mithraeum": "history",
  "london-museum-docklands": "history",
  "clink-prison-museum": "history",
  "foundling-museum": "history",

  // 自然・科学・宇宙
  "natural-history-museum": "science",
  "science-museum": "science",
  "wellcome-collection": "science",
  "horniman-museum": "science",
  "royal-observatory-greenwich": "science",

  // デザインと工芸
  "victoria-and-albert-museum": "design",
  "design-museum": "design",
  "fashion-and-textile-museum": "design",
  "museum-of-brands": "design",
  "japan-house-london": "design",

  // 誰かが住んでいた家
  "sherlock-holmes-museum": "house",
  "leighton-house-museum": "house",
  "freud-museum": "house",
  "sir-john-soanes-museum": "house",
  "charles-dickens-museum": "house",
  "keats-house": "house",
  "apsley-house": "house",

  // 乗り物と産業
  "london-transport-museum": "transport",
  "national-maritime-museum": "transport",
  "cutty-sark": "transport",
  "london-canal-museum": "transport",
  "postal-museum": "transport",
  "bank-of-england-museum": "transport",

  // 戦争と軍事
  "imperial-war-museum": "war",
  "royal-air-force-museum": "war",
  "national-army-museum": "war",
  "household-cavalry-museum": "war",

  // 変わり種
  "victor-wynd-museum": "curious",
  "vagina-museum": "curious",
  "garden-museum": "curious",
  "wimbledon-lawn-tennis-museum": "curious",
  "young-va": "curious",
  "fan-museum": "curious",
};

export function genreOf(slug: string): GenreSlug {
  return MUSEUM_GENRE[slug] ?? "curious";
}

/**
 * エリア。
 *
 * 「その日どこを歩くか」の単位なので、行政区ではなく徒歩圏で切っている。
 * 中心部から順に並べ、最後の outer は互いに離れた単独館の受け皿。
 */
export type AreaSlug =
  | "bloomsbury"
  | "trafalgar"
  | "south-kensington"
  | "westminster"
  | "mayfair"
  | "southbank"
  | "city"
  | "west"
  | "east"
  | "greenwich"
  | "outer";

export type AreaMeta = { slug: AreaSlug; label: string; note: string };

export const AREAS: AreaMeta[] = [
  {
    slug: "bloomsbury",
    label: "ブルームズベリー〜キングス・クロス",
    note: "大英博物館を中心に徒歩20分圏。小さな館が多く、はしごしやすい一帯です。",
  },
  {
    slug: "trafalgar",
    label: "トラファルガー広場〜コヴェント・ガーデン",
    note: "広場の周りに国立館が並びます。移動時間がほぼゼロで2〜3館回れます。",
  },
  {
    slug: "south-kensington",
    label: "サウス・ケンジントン",
    note: "3館が隣接し、駅から地下通路でつながっています。雨の日の避難先。",
  },
  {
    slug: "westminster",
    label: "ウェストミンスター〜ピムリコ",
    note: "官庁街と王室関連。観光の動線に自然に挟み込めます。",
  },
  {
    slug: "mayfair",
    label: "メイフェア〜マリルボン",
    note: "買い物のついでに寄れる立地。どれも1時間半あれば足ります。",
  },
  {
    slug: "southbank",
    label: "サウスバンク〜バンクサイド",
    note: "テムズ川の南岸。川沿いを歩く前提なら館と館の間も退屈しません。",
  },
  {
    slug: "city",
    label: "シティ",
    note: "金融街。平日昼が本領で、週末は周辺の店ごと静まり返ります。",
  },
  {
    slug: "west",
    label: "ケンジントン〜ノッティング・ヒル",
    note: "ハイストリート沿いと住宅街。1館だけ目当てに行く使い方が向きます。",
  },
  {
    slug: "east",
    label: "イースト・ロンドン",
    note: "現代アートと個性の強い小館。マーケットと組み合わせる日に。",
  },
  {
    slug: "greenwich",
    label: "グリニッジ",
    note: "4館が公園と一体。船で行って半日たっぷり使う場所です。",
  },
  {
    slug: "outer",
    label: "少し足を延ばす",
    note: "中心部から電車で20〜40分。それぞれ単独で目的地になる館です。",
  },
];

export const AREA_BY_SLUG: Record<AreaSlug, AreaMeta> = Object.fromEntries(
  AREAS.map((a) => [a.slug, a]),
) as Record<AreaSlug, AreaMeta>;

export const MUSEUM_AREA: Record<string, AreaSlug> = {
  "british-museum": "bloomsbury",
  "british-library": "bloomsbury",
  "postal-museum": "bloomsbury",
  "charles-dickens-museum": "bloomsbury",
  "foundling-museum": "bloomsbury",
  "london-canal-museum": "bloomsbury",
  "wellcome-collection": "bloomsbury",

  "national-gallery": "trafalgar",
  "national-portrait-gallery": "trafalgar",
  "courtauld-gallery": "trafalgar",
  "london-transport-museum": "trafalgar",
  "sir-john-soanes-museum": "trafalgar",

  "victoria-and-albert-museum": "south-kensington",
  "natural-history-museum": "south-kensington",
  "science-museum": "south-kensington",

  "tate-britain": "westminster",
  "kings-gallery": "westminster",
  "household-cavalry-museum": "westminster",

  "the-wallace-collection": "mayfair",
  "sherlock-holmes-museum": "mayfair",
  "apsley-house": "mayfair",

  "tate-modern": "southbank",
  "imperial-war-museum": "southbank",
  "clink-prison-museum": "southbank",
  "fashion-and-textile-museum": "southbank",
  "garden-museum": "southbank",

  "london-mithraeum": "city",
  "bank-of-england-museum": "city",

  "design-museum": "west",
  "japan-house-london": "west",
  "leighton-house-museum": "west",
  "museum-of-brands": "west",

  "victor-wynd-museum": "east",
  "young-va": "east",
  "vagina-museum": "east",
  "whitechapel-gallery": "east",
  "london-museum-docklands": "east",

  "national-maritime-museum": "greenwich",
  "cutty-sark": "greenwich",
  "royal-observatory-greenwich": "greenwich",
  "fan-museum": "greenwich",

  "freud-museum": "outer",
  "keats-house": "outer",
  "royal-air-force-museum": "outer",
  "horniman-museum": "outer",
  "wimbledon-lawn-tennis-museum": "outer",
  "national-army-museum": "outer",
};

export function areaOf(slug: string): AreaSlug {
  return MUSEUM_AREA[slug] ?? "outer";
}

/**
 * 滞在時間の目安。MuseumInfo.recommendedDuration(分)を3段に丸める。
 *
 * 「半日空いている」「乗り継ぎまで1時間」という現地での判断に直結する軸で、
 * 47館中25館が60分の館。この層が見えないと、小さい館は永久に選ばれない。
 */
export type DurationSlug = "short" | "half" | "long";

export const DURATIONS: { slug: DurationSlug; label: string }[] = [
  { slug: "short", label: "1時間で回れる" },
  { slug: "half", label: "1〜2時間" },
  { slug: "long", label: "半日かける" },
];

export function durationBucket(minutes: number | null): DurationSlug {
  if (minutes === null) return "half";
  if (minutes <= 60) return "short";
  if (minutes < 180) return "half";
  return "long";
}

/** 「90分」ではなく「1時間30分」で出す。分表記は現地で暗算させることになる。 */
export function formatDuration(minutes: number | null): string | null {
  if (minutes === null || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}
