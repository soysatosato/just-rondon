/**
 * 観光スポットの「見に行き方」の種類と、種類ごとの言葉づかい。
 *
 * DB の category(historic / garden / shop …)は一覧の章立てのための区分で、
 * 「そこへ行って何をするか」は表していない。同じ historic でも、
 * ロンドン塔は券を買って中を見る場所、アビー・ロードは横断歩道を見に行く
 * 場所で、読者が知りたいことがまるで違う。
 *
 * 2026-11 の見直しまでは、160ページすべてが同じ欄名で出ていた。
 * - マーケットにも「開館時間」「休館日」と出る。レドンホール・マーケットは
 *   「レドンホールマーケット 営業時間」で90日に49回表示されていたが、
 *   ページのどこにも「営業時間」という語が無かった。
 * - 外から見るだけの名所に「料金 無料 / 無料」「休館日 曜日の休館なし」が並ぶ。
 * - 公園の最寄駅が「目的地によって駅」になる(入口が複数あることを表せない)。
 * ここで種類を決め、欄名・見出し・タイトルの語尾を種類から引く。
 *
 * 種類は DB に持たせず、ここで slug ごとに決める。表示の言葉を決めるための
 * もので、一覧の絞り込みや旅程の計算には使わないため。新しく足した
 * スポットは category から既定の種類になる(DEFAULT_BY_CATEGORY)。
 * 既定と違う扱いにしたいときだけ OVERRIDES に足す。
 */

export type SpotKind =
  /** 券を買う・受付を通るなどして、中を見学する場所。城、宮殿、教会、館。 */
  | "attraction"
  /** 外から見る名所・広場・街並み。中に入る前提が無い。 */
  | "landmark"
  /** 公園・庭園。入口が複数あり、開いている時間は日没で決まることが多い。 */
  | "park"
  /** 市場・マーケット。曜日で中身が変わる。 */
  | "market"
  /** 百貨店・店。入るのは無料で、営業時間が要点。 */
  | "store"
  /** 時間指定で入る体験型の施設・展望台・乗り物。 */
  | "experience"
  /** 決まった時刻に出るツアー、スタジアム見学、バス。 */
  | "tour"
  /** 会期のある催し。 */
  | "event"
  /** 決まった日・時刻に行われる儀式(衛兵交代など)。 */
  | "ceremony";

export type SpotKindProfile = {
  kind: SpotKind;
  /** 料金の欄名。 */
  priceLabel: string;
  /** 開いている時間の欄名。検索で実際に使われる語にする(営業時間・開園時間)。 */
  hoursLabel: string;
  /** 休みの曜日の欄名。 */
  closedLabel: string;
  /**
   * 休みが週4日以上あるとき、休みの曜日ではなく開く曜日を出す。そのときの欄名。
   * 「休館日: 月・火・水・木・金・土」より「開館日: 日曜のみ」のほうが一目で分かる。
   */
  openDaysLabel: string;
  /**
   * 無料のときに料金の欄を出さない。店・マーケット・外から見る名所で
   * 「料金 無料 / 無料」を並べても、読者の判断に何も足さない
   * (無料であることは見出しの「無料」の印で伝わる)。
   */
  hidePriceWhenFree: boolean;
  /** 「見どころ」の節の見出しに使う語。 */
  highlightsNoun: string;
  /** 見どころの節の下に添える1文。順番に意味がある種類だけ。 */
  highlightsLead: string | null;
  /** 市外にあり、行き方の案内に重みがあるか。 */
  outOfTown: boolean;
};

type ProfileOverride = Partial<Omit<SpotKindProfile, "kind">> & {
  kind?: SpotKind;
};

const BASE: Record<SpotKind, Omit<SpotKindProfile, "kind" | "outOfTown">> = {
  attraction: {
    priceLabel: "入場料",
    hoursLabel: "開館時間",
    closedLabel: "休館日",
    openDaysLabel: "開館日",
    hidePriceWhenFree: false,
    highlightsNoun: "見どころ",
    highlightsLead: "着いてから見ていく順に並べています。",
  },
  landmark: {
    priceLabel: "料金",
    hoursLabel: "見られる時間",
    closedLabel: "休み",
    openDaysLabel: "見られる日",
    hidePriceWhenFree: true,
    highlightsNoun: "見どころ",
    highlightsLead: null,
  },
  park: {
    priceLabel: "入園料",
    hoursLabel: "開園時間",
    closedLabel: "休園日",
    openDaysLabel: "開園日",
    hidePriceWhenFree: false,
    highlightsNoun: "見どころ",
    highlightsLead: null,
  },
  market: {
    priceLabel: "入場",
    hoursLabel: "営業時間",
    closedLabel: "定休日",
    openDaysLabel: "営業日",
    hidePriceWhenFree: true,
    highlightsNoun: "見どころ",
    highlightsLead: null,
  },
  store: {
    priceLabel: "入店",
    hoursLabel: "営業時間",
    closedLabel: "定休日",
    openDaysLabel: "営業日",
    hidePriceWhenFree: true,
    highlightsNoun: "見どころ",
    highlightsLead: null,
  },
  experience: {
    priceLabel: "料金",
    hoursLabel: "営業時間",
    closedLabel: "休業日",
    openDaysLabel: "営業日",
    hidePriceWhenFree: false,
    highlightsNoun: "体験の流れと見どころ",
    highlightsLead: null,
  },
  tour: {
    priceLabel: "料金",
    hoursLabel: "催行時間",
    closedLabel: "催行しない日",
    openDaysLabel: "催行日",
    hidePriceWhenFree: false,
    highlightsNoun: "ツアーの流れと見どころ",
    highlightsLead: null,
  },
  event: {
    priceLabel: "料金",
    hoursLabel: "開催日時",
    closedLabel: "休み",
    openDaysLabel: "開催日",
    hidePriceWhenFree: false,
    highlightsNoun: "見どころ",
    highlightsLead: null,
  },
  ceremony: {
    priceLabel: "観覧",
    hoursLabel: "実施時刻",
    closedLabel: "行われない曜日",
    openDaysLabel: "行われる曜日",
    hidePriceWhenFree: false,
    highlightsNoun: "見どころと見る場所",
    highlightsLead: null,
  },
};

/**
 * category から決まる既定の種類。ここに無い category は attraction。
 */
const DEFAULT_BY_CATEGORY: Record<string, SpotKind> = {
  architecture: "landmark",
  entertainment: "experience",
  garden: "park",
  historic: "attraction",
  museum: "attraction",
  royal: "attraction",
  seasonal: "event",
  shop: "store",
  tour: "tour",
};

/**
 * category の既定と違う扱いにするスポット。
 *
 * 決め方: 読者がそこで最初にすることで分ける。券を買って入るなら
 * attraction、外から見るなら landmark。迷ったものには理由を書いた。
 */
const OVERRIDES: Record<string, ProfileOverride> = {
  // --- 外から見る名所(category は historic / royal / entertainment)
  "abbey-road-beatles": { kind: "landmark" },
  "bt-tower-london": { kind: "landmark" },
  "bbc-television-centre": { kind: "landmark" },
  "the-fourth-plinth-trafalgar-square": { kind: "landmark" },
  "movie-statue-street-leicester-square": { kind: "landmark" },
  "little-venice-london": { kind: "landmark" },
  // 公開していない宮殿。外観と周辺の儀式を見に行く場所。
  "st-jamess-palace": { kind: "landmark" },
  // 時計塔の内部見学はあるが、訪れる人の大半は外から見る。料金の欄は
  // 内部見学のものなので、欄名で何の料金かを言う。
  "big-ben": { kind: "landmark", priceLabel: "内部見学" },

  // --- 公園(category は historic)
  "postmans-park": { kind: "park" },

  // --- 入場して見る場所(category は garden / entertainment / tour)
  // 無料だが予約制で、公開日が決まっている温室。
  "barbican-conservatory": { kind: "attraction", hoursLabel: "公開日時" },
  // 無料だが予約制の展望庭園。
  "sky-garden-london": { kind: "attraction", priceLabel: "入場料" },
  // 無料だが日時指定の予約制の展望ギャラリー(category は architecture)。
  "horizon-22": { kind: "attraction", priceLabel: "入場料" },
  "barbican-centre": { kind: "attraction" },
  "sea-life-london-aquarium": { kind: "attraction" },
  "madame-tussauds-london": { kind: "attraction" },
  "london-zoo": {
    kind: "attraction",
    priceLabel: "入園料",
    hoursLabel: "開園時間",
    closedLabel: "休園日",
    openDaysLabel: "開園日",
  },
  "twickenham-world-rugby-museum": { kind: "attraction" },
  "highgate-cemetery": {
    kind: "attraction",
    hoursLabel: "開園時間",
    closedLabel: "休園日",
    openDaysLabel: "開園日",
  },
  "royal-albert-hall": { kind: "attraction", priceLabel: "見学ツアー", hoursLabel: "見学ツアー" },
  "royal-ballet-opera-london": { kind: "attraction" },
  "mansion-house-london": { kind: "attraction", hoursLabel: "見学" },
  "houses-of-parliament-self-guided-audio-tour": {
    kind: "attraction",
    hoursLabel: "見学できる日時",
  },

  // --- 体験・乗り物
  "ifs-cloud-cable-car-london": { kind: "experience", hoursLabel: "運行時間", closedLabel: "運休日" },
  "abba-voyage": { kind: "experience", hoursLabel: "公演", openDaysLabel: "公演日", closedLabel: "公演の無い曜日" },
  "58th-street-london": { kind: "experience", hoursLabel: "公演", openDaysLabel: "公演日", closedLabel: "公演の無い曜日" },
  "london-bridge-experience-and-tombs": { kind: "experience" },
  "peter-harrison-planetarium-greenwich": { kind: "experience" },
  "the-view-from-the-shard": { kind: "experience" },

  // --- ツアー(category は entertainment)
  "shakespeares-globe-guided-tour": { kind: "tour", hoursLabel: "ツアーの時間" },
  "wee-toast-tours": { kind: "tour" },
  "afternoon-tea-bus-london": { kind: "tour" },

  // --- 催し(category は garden)
  "rhs-chelsea-flower-show": { kind: "event", priceLabel: "入場料" },

  // --- 儀式
  "changing-the-guard-buckingham-palace": { kind: "ceremony" },
  "horse-guards-london": { kind: "ceremony" },

  // --- マーケット(category は shop。既定は store)
  "old-spitalfields-market": { kind: "market" },
  "portobello-road-market": { kind: "market" },
  "borough-market": { kind: "market" },
  "leadenhall-market-london": { kind: "market" },
  "columbia-road-flower-market": { kind: "market" },
  "covent-garden": { kind: "market" },
  "camden-lock-market": { kind: "market" },
  "greenwich-market": { kind: "market" },

  // --- ロンドンの外(行き方の案内に重みがある)
  "windsor-castle": { outOfTown: true },
  "legoland-windsor": { outOfTown: true },
  "chessington-world-of-adventures": { outOfTown: true },
  "warner-bros-studio-tour-harry-potter": { outOfTown: true },
  "bicester-village": { outOfTown: true },
  "down-house-charles-darwin": { outOfTown: true },
  "hampton-court-palace": { outOfTown: true },
};

export function spotKindProfile(spot: {
  slug: string;
  category: string;
}): SpotKindProfile {
  const override = OVERRIDES[spot.slug] ?? {};
  const kind =
    override.kind ?? DEFAULT_BY_CATEGORY[spot.category] ?? "attraction";
  return {
    kind,
    outOfTown: false,
    ...BASE[kind],
    ...override,
  };
}
