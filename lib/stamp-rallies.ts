import {
  areaGuidePath,
  areaGuides,
} from "@/components/sightseeing/areas/areas";
import { MUSEUM_ATTRACTION_PAIRS } from "@/lib/museum-attraction-pairs";
import type { StampTitle, StampType } from "@/lib/stamps";

/**
 * スタンプラリーの台紙。
 *
 * 押せる場所は観光スポットだけで184ある。分母が184のままだと、12個押した
 * 人の進捗は6%で、何個押しても「まだ始まったばかり」にしか見えない。
 * そこで、エリアやテーマで区切った10前後の台紙に分ける。台紙ごとに
 * 「あと2か所で制覇」が見え、制覇という区切りが旅行1回の中で何度も来る。
 *
 * 1つのスタンプは、当てはまる台紙すべてに効く(ビッグベンは定番・
 * ウェストミンスター・王室の3枚が同時に進む)。
 *
 * ここは純粋な計算だけを置く。DB から読むのは lib/stamp-progress.ts。
 * クライアント(スタンプボタン)は型だけを import すること——実体を
 * import するとエリアガイドの定義ごとバンドルに入る。
 */

/** 台紙の欄になる場所。3種を同じ形にそろえたもの。 */
export type StampPlace = {
  type: StampType;
  id: string;
  slug: string;
  name: string;
  engName: string;
  image: string;
  /** Attraction.category。美術館・ミュージカルは null。 */
  category: string | null;
  /** Attraction.area。エリアガイドの slug。 */
  area: string | null;
  mustSee: boolean;
  recommendLevel: number;
  /** ミュージカルが上演中か。観光スポット・美術館は常に true。 */
  isOnShow: boolean;
  views: number;
};

/** 押してあるスタンプ1個。台紙の欄を埋める側。 */
export type StampMark = {
  /** 押した場所の placeKey。 */
  key: string;
  /** Stamp.id。印面の傾きとかすれ方の種にも使う。 */
  stampId: string;
  type: StampType;
  /** 印面に彫る名前と絵柄。押した場所のもの。 */
  engName: string;
  category: string | null;
  /** ISO 文字列。 */
  stampedAt: string;
  onSite: boolean;
};

export function placeKey(place: { type: StampType; id: string }): string {
  return `${place.type}:${place.id}`;
}

export type RallyGroup = "classic" | "area" | "theme";

export const RALLY_GROUPS: readonly {
  key: RallyGroup;
  label: string;
  eng: string;
}[] = [
  { key: "classic", label: "まずはここから", eng: "The Classics" },
  { key: "area", label: "エリアを歩く", eng: "Neighbourhoods" },
  { key: "theme", label: "テーマで巡る", eng: "Themes" },
];

export type Rally = {
  slug: string;
  group: RallyGroup;
  /** 欄になる場所の種別。1枚の台紙に種別は混ぜない。 */
  type: StampType;
  title: string;
  eng: string;
  /** 台紙に添える一言。 */
  blurb: string;
  /** 空いた欄の行き先を探すページ。 */
  href: string;
  hrefLabel: string;
  includes: (place: StampPlace) => boolean;
};

/**
 * 台紙の一覧。並びがそのままスタンプ帳での表示順になる。
 *
 * 1枚あたり5〜30欄に収めている。これより大きいと「あと少し」が来ず、
 * 小さいと台紙の数ばかり増えて、どれも印象に残らない。
 */
export const RALLIES: readonly Rally[] = [
  {
    slug: "must-see",
    group: "classic",
    type: "attraction",
    title: "ロンドンの定番",
    eng: "Must-see London",
    blurb: "初めてのロンドンで外せない場所。全部押せば、ひととおり見たと言えます。",
    href: "/sightseeing/must-see",
    hrefLabel: "定番スポットの特集を読む",
    includes: (p) => p.mustSee,
  },
  {
    slug: "great-museums",
    group: "classic",
    type: "museum",
    title: "必見の美術館・博物館",
    eng: "Great Museums",
    blurb: "おすすめ度がいちばん高い館だけを集めた台紙です。",
    href: "/museums/all-museums",
    hrefLabel: "美術館・博物館の一覧を見る",
    includes: (p) => p.recommendLevel >= 5,
  },
  {
    slug: "west-end",
    group: "classic",
    type: "musical",
    title: "ウエストエンドの定番",
    eng: "West End Classics",
    // 終演した作品を欄に残すと、これから来る人には埋められない台紙になる。
    blurb: "いま上演中の定番作品。終演した作品は台紙から外れます。",
    href: "/musicals",
    hrefLabel: "ミュージカルの一覧を見る",
    includes: (p) => p.mustSee && p.isOnShow,
  },
  ...areaGuides.map(
    (area): Rally => ({
      slug: `area-${area.slug}`,
      group: "area",
      type: "attraction",
      title: area.label,
      eng: area.eyebrow,
      blurb: `歩く目安は${area.walkTime}。最寄り駅は ${area.station}。`,
      href: areaGuidePath(area.slug),
      hrefLabel: "エリアガイドを読む",
      includes: (p) => p.area === area.slug,
    }),
  ),
  {
    slug: "royal",
    group: "theme",
    type: "attraction",
    title: "王室のロンドン",
    eng: "Royal London",
    blurb: "宮殿、衛兵、王室ゆかりの場所。",
    href: "/sightseeing/royal-london",
    hrefLabel: "王室のロンドン特集を読む",
    includes: (p) => p.category === "royal",
  },
  {
    slug: "parks",
    group: "theme",
    type: "attraction",
    title: "公園と庭園",
    eng: "Parks & Gardens",
    blurb: "王立公園から温室、屋上の庭まで。",
    href: "/sightseeing/all",
    hrefLabel: "観光スポットの一覧を見る",
    includes: (p) => p.category === "garden",
  },
];

/**
 * 観光スポットと美術館の両方にページがある館を、placeKey 同士で結ぶ。
 *
 * 大英博物館は /sightseeing と /museums の両方にあり、どちらのページで
 * 押しても別のスタンプになる。台紙の欄をスタンプの行そのもので判定すると、
 * 美術館のページで押した人の「定番」の大英博物館の欄が空いたままになる。
 * 押した本人から見れば、押したのに埋まっていない欄でしかないので、
 * 対の館で押したスタンプでも欄が埋まるようにする。
 *
 * 対応は lib/museum-attraction-pairs.ts の表に従う。名前の一致で推測しない。
 */
export function buildTwinIndex(places: StampPlace[]): Map<string, string> {
  const bySlug = new Map<string, StampPlace>();
  for (const place of places) {
    if (place.type !== "attraction" && place.type !== "museum") continue;
    bySlug.set(`${place.type}:${place.slug}`, place);
  }
  const twins = new Map<string, string>();
  for (const pair of MUSEUM_ATTRACTION_PAIRS) {
    const museum = bySlug.get(`museum:${pair.museumSlug}`);
    const attraction = bySlug.get(`attraction:${pair.attractionSlug}`);
    if (!museum || !attraction) continue;
    twins.set(placeKey(museum), placeKey(attraction));
    twins.set(placeKey(attraction), placeKey(museum));
  }
  return twins;
}

/** 台紙の欄の並び。有名なものほど先に来るので、空いた欄が何かすぐ分かる。 */
function byRenown(a: StampPlace, b: StampPlace): number {
  return (
    b.recommendLevel - a.recommendLevel ||
    b.views - a.views ||
    a.name.localeCompare(b.name, "ja")
  );
}

export type RallySlot = {
  place: StampPlace;
  /** この欄を埋めているスタンプ。対の館で押したものも含む。 */
  stamp: StampMark | null;
};

export type RallyProgress = {
  rally: Rally;
  slots: RallySlot[];
  count: number;
  total: number;
  /** 最後の欄を埋めた日(ISO)。制覇していなければ null。 */
  completedAt: string | null;
};

/** 全台紙の埋まり具合。欄が1つも無い台紙(データの入れ替え直後など)は外す。 */
export function buildRallies(
  places: StampPlace[],
  stamps: Map<string, StampMark>,
  twins: Map<string, string>,
): RallyProgress[] {
  const progress: RallyProgress[] = [];
  for (const rally of RALLIES) {
    const members = places
      .filter((p) => p.type === rally.type && rally.includes(p))
      .sort(byRenown);
    if (members.length === 0) continue;

    const slots = members.map((place): RallySlot => {
      const key = placeKey(place);
      const twin = twins.get(key);
      return {
        place,
        stamp: stamps.get(key) ?? (twin ? stamps.get(twin) : undefined) ?? null,
      };
    });
    const count = slots.filter((s) => s.stamp).length;
    const completedAt =
      count === slots.length
        ? slots.reduce(
            (latest, s) =>
              s.stamp && s.stamp.stampedAt > latest ? s.stamp.stampedAt : latest,
            "",
          )
        : null;

    progress.push({ rally, slots, count, total: slots.length, completedAt });
  }
  return progress;
}

/** その場所(か対の館)を欄に持つ台紙。スタンプを押した直後の報告に使う。 */
export function ralliesContaining(
  rallies: RallyProgress[],
  key: string,
  twins: Map<string, string>,
): RallyProgress[] {
  const twin = twins.get(key);
  return rallies.filter((r) =>
    r.slots.some((s) => {
      const k = placeKey(s.place);
      return k === key || k === twin;
    }),
  );
}

/**
 * 「あと少しで制覇」に出す台紙。
 *
 * 残りの欄が少ないものから出す。ゴールが近いほど人は最後のひと押しを
 * 急ぐので、「28か所中の5か所目」より「12か所中の11か所目」を先に見せる。
 *
 * どの台紙にも1個も押していない人には、3種それぞれの定番の台紙を出す。
 * 何から始めればいいかの答えになる。
 */
export function pickNextGoals(
  rallies: RallyProgress[],
  limit = 3,
): { started: boolean; goals: RallyProgress[] } {
  const inProgress = rallies
    .filter((r) => r.count > 0 && r.count < r.total)
    .sort(
      (a, b) =>
        a.total - a.count - (b.total - b.count) ||
        b.count / b.total - a.count / a.total,
    );
  if (inProgress.length > 0) {
    return { started: true, goals: inProgress.slice(0, limit) };
  }
  return {
    started: false,
    goals: rallies
      .filter((r) => r.rally.group === "classic" && r.count < r.total)
      .slice(0, limit),
  };
}

/**
 * 押した直後にボタンへ返す、進み具合の報告。/api/stamps の POST が返す。
 */
export type StampPressProgress = {
  /** 押したあとのスタンプの総数。 */
  total: number;
  /** 押したあとの金のスタンプの数。 */
  gold: number;
  title: {
    previous: StampTitle;
    current: StampTitle;
    next: StampTitle | null;
    rankedUp: boolean;
  };
  /** この場所を欄に持つ台紙。before は押す前の埋まり数。 */
  rallies: {
    slug: string;
    title: string;
    unit: string;
    before: number;
    count: number;
    total: number;
  }[];
};
