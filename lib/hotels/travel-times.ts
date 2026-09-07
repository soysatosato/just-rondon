/**
 * 宿泊エリアから、空港と主要スポットへの実際の所要時間。
 *
 * このページの中心的な主張は「宿はエリアで決まる、なぜなら移動時間が
 * 効くから」だった。ところが本文には所要時間の数字が1つも無く、
 * 「Zone 3 の安い宿は移動時間と交通費で差額が消える」という一番強い
 * 主張が、読者から見れば書き手の断定でしかなかった。ここで実測値を
 * 持つと、その主張は「Stratford から劇場街まで32分、Covent Garden なら
 * 徒歩10分」という反証可能な事実になる。
 *
 * 設計メモ:
 *
 * 1. **表示時に TfL を叩かない。** lib/tfl/nearest-station.ts と同じ方針で、
 *    スクリプトで一度引いて JSON に焼き込み、ページは JSON だけを読む。
 *    路線の改廃が無いかぎり所要時間は年単位で変わらないので、読者を
 *    待たせる理由がない。
 *
 * 2. **JSON はリポジトリにコミットする。** DBにしか無いコンテンツが
 *    消えた事故があったため、生成物であっても本文に相当するものは
 *    git に置く。再生成できることと、失われないことは別の話。
 *
 * 3. **平日10時発に固定する。** 所要時間は時間帯で変わる。固定しないと
 *    再生成のたびに数字が揺れ、「なぜ変わったか」を誰も説明できなくなる。
 *    ラッシュ時ではなく日中を採ったのは、観光客が実際に動く時間帯だから。
 *
 * 4. **起点も行き先も、座標ではなく駅の NaptanId で指定する。**
 *    座標を渡すと TfL は「その座標から駅まで歩く区間」を勝手に足す。
 *    実測では、駅の座標そのものを渡したのに **68m の徒歩に7分** が付き、
 *    全区間が一律に7〜8分水増しされた。行き先側はさらに悪く、空港を
 *    座標指定するとスタンステッドが隣町 Saffron Walden の道路へ徒歩18分、
 *    ヒースローが 723 CROMER ROAD へ徒歩14分という、存在しない徒歩が
 *    足された。駅IDで指定すればこの区間は生じない。
 *
 * 5. **スポットへの徒歩は、乗車と分けて別に測る。**
 *    駅から博物館までの数分は読者が実際に歩くぶんなので含めたい。
 *    ただし乗換を含む経路の一部として引くと、TfL は待ち時間の
 *    ペナルティを乗せ、南ケン→自然史博物館(719m)に18分を付けてくる。
 *    mode=walking で単独に引けば11分で、こちらが実態に近い。
 *    したがって「乗車(駅→駅) + 最寄駅からの徒歩」を別々に測って足す。
 *
 * 6. **直接歩いたほうが速ければ、そちらを採る。**
 *    Russell Square から大英博物館は乗るより歩いたほうが速い(徒歩7分)。
 *    乗車前提で計算すると「乗換1回20分」のような、誰もやらない移動を
 *    提示することになる。両方測って短いほうを出す。徒歩が勝った区間は
 *    walkOnly を立て、分数より先に「徒歩」と表示する——「歩ける」は
 *    分数以上に強い情報で、エリア選びの決め手になるため。
 *
 * 7. **ルートンだけは空港駅が無い。** Luton Airport Parkway から
 *    ターミナルへは DART(自動走行シャトル)で結ばれているが、TfL は
 *    これを知らない。ターミナル座標を指定すると Parkway から
 *    **徒歩82分**という経路を返す。したがって Parkway までを測り、
 *    DART 分は LUTON_DART_MINUTES として別に足す。
 */

/** 生成時に固定する出発日時。平日(火)の日中。 */
export const TRAVEL_TIME_DEPARTURE = {
  /** TfL の date パラメータ書式 (yyyyMMdd)。 */
  date: "20261110",
  /** TfL の time パラメータ書式 (HHmm)。 */
  time: "1000",
  /** 読者に見せる説明。 */
  label: "平日10時台の出発",
} as const;

/**
 * ルートン空港駅 → ターミナルの DART 所要分。
 *
 * TfL の経路には含まれないので、こちらで足して注記する。
 * 出典: London Luton Airport（DART は Parkway 駅とターミナルを約4分で結ぶ）。
 */
export const LUTON_DART_MINUTES = 4;

/**
 * 各エリアの起点駅。
 *
 * エリアは面なので「そのエリアの代表駅」を1つ決めて測る。宿がエリアの
 * 端にあれば数分ずれるが、エリア間の比較という用途では十分。id は
 * components/sightseeing/guides/hotels/content.ts の Area.id と一致させること。
 *
 * naptanId は TfL の StopPoint 検索で、その駅の座標から半径400m以内の
 * 最も近い鉄道駅として引いたもの。駅の統廃合が無いかぎり変わらない。
 */
export type Origin = {
  id: string;
  /** 測定に使った駅。ページに明示して、数字の出どころを分かるようにする。 */
  station: string;
  naptanId: string;
};

export const origins: Origin[] = [
  { id: "westminster", station: "Victoria", naptanId: "910GVICTRIC" },
  { id: "covent-garden", station: "Covent Garden", naptanId: "940GZZLUCGN" },
  { id: "south-ken", station: "South Kensington", naptanId: "940GZZLUSKS" },
  { id: "bloomsbury", station: "Russell Square", naptanId: "940GZZLURSQ" },
  { id: "kings-cross", station: "King's Cross St Pancras", naptanId: "940GZZLUKSX" },
  { id: "paddington", station: "Paddington", naptanId: "910GPADTON" },
  { id: "city", station: "Liverpool Street", naptanId: "940GZZLULVT" },
  { id: "southbank", station: "Waterloo", naptanId: "910GWATRLMN" },
  { id: "marylebone", station: "Baker Street", naptanId: "940GZZLUBST" },
  { id: "shoreditch", station: "Old Street", naptanId: "940GZZLUODS" },
  { id: "bayswater", station: "Bayswater", naptanId: "940GZZLUBWT" },
  { id: "greenwich", station: "Cutty Sark", naptanId: "940GZZDLCUT" },
  { id: "stratford", station: "Stratford", naptanId: "940GZZLUSTD" },
];

/**
 * 行き先。
 *
 * 空港はターミナル直結駅を終点にする(そこから先は空港の中)。
 * スポットは最寄駅を終点にしたうえで、駅からスポットまでの徒歩を
 * 別に測って足す(設計メモ5)。lat/lng はその徒歩を測るためにある。
 */
export type Destination = {
  id: string;
  label: string;
  kind: "airport" | "landmark";
  /** 終点の駅。空港はターミナル直結駅、スポットは最寄駅。 */
  naptanId: string;
  /** スポットのみ。最寄駅からの徒歩を測る先。 */
  lat?: number;
  lng?: number;
  /** 数字に付ける但し書き。DART のように経路に含まれない区間がある場合。 */
  note?: string;
};

export const destinations: Destination[] = [
  // --- 空港。到着日と出発日の負担を決める。 ---
  { id: "lhr", label: "ヒースロー空港", kind: "airport", naptanId: "910GHTRWAPT" },
  { id: "lgw", label: "ガトウィック空港", kind: "airport", naptanId: "920GLGW0" },
  { id: "stn", label: "スタンステッド空港", kind: "airport", naptanId: "920GSTN1" },
  {
    id: "ltn",
    label: "ルートン空港",
    kind: "airport",
    naptanId: "910GLUTOAPY",
    note: `Parkway 駅まで。ターミナルへは DART で約${LUTON_DART_MINUTES}分`,
  },
  { id: "lcy", label: "ロンドン・シティ空港", kind: "airport", naptanId: "940GZZDLLCA" },

  // --- スポット。滞在中に何度も往復する場所を選ぶ。 ---
  {
    id: "british-museum",
    label: "大英博物館",
    kind: "landmark",
    naptanId: "940GZZLUHBN",
    lat: 51.5194,
    lng: -0.1269,
  },
  {
    id: "westminster-abbey",
    label: "ウェストミンスター寺院",
    kind: "landmark",
    naptanId: "940GZZLUWSM",
    lat: 51.4993,
    lng: -0.1273,
  },
  {
    id: "west-end",
    label: "劇場街（ウエストエンド）",
    kind: "landmark",
    naptanId: "940GZZLULSQ",
    lat: 51.513264,
    lng: -0.130695,
  },
  {
    id: "tower-of-london",
    label: "ロンドン塔",
    kind: "landmark",
    naptanId: "940GZZLUTWH",
    lat: 51.5081,
    lng: -0.0759,
  },
  {
    id: "natural-history-museum",
    label: "自然史博物館",
    kind: "landmark",
    naptanId: "940GZZLUSKS",
    lat: 51.4967,
    lng: -0.1764,
  },
];

/** 1区間の測定結果。 */
export type TravelLeg = {
  destinationId: string;
  /** 合計の所要分。乗車＋最寄駅からの徒歩、または直接徒歩の短いほう。 */
  minutes: number;
  /** 乗換回数。徒歩のみの経路は 0。 */
  changes: number;
  /** 全区間が徒歩だったか。「歩ける」は分数以上に強い情報なので分けて持つ。 */
  walkOnly: boolean;
  /**
   * 起点駅から直接歩いた場合の分数。TfL が徒歩経路を引けた場合だけ入る。
   *
   * 乗ったほうが速い区間でも捨てずに持っておく。Covent Garden から
   * 大英博物館は乗車13分・徒歩14分で、数字上は乗車が勝つが、読者に
   * とっては「歩ける」ことのほうが決め手になる。1分差で乗車だけを
   * 見せると、その事実が消えてしまう。
   */
  walkMinutes?: number;
};

export type TravelTimeTable = {
  /** 生成日時(ISO)。鮮度表示に使う。 */
  generatedAt: string;
  departure: { date: string; time: string; label: string };
  /** エリアid -> 行き先ごとの所要時間。 */
  areas: Record<string, TravelLeg[]>;
};

/** 行き先idからラベルと但し書きを引く。 */
export function destinationById(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}
