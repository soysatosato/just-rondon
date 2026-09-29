import db from "@/utils/db";
import {
  buildRallies,
  buildTwinIndex,
  placeKey,
  ralliesContaining,
  type RallyProgress,
  type StampMark,
  type StampPlace,
  type StampPressProgress,
} from "@/lib/stamp-rallies";
import {
  stampTitleFor,
  stampType,
  STAMP_META,
  type StampType,
} from "@/lib/stamps";

/**
 * スタンプ帳と台紙の計算に要るものを DB から読む。サーバー側専用。
 *
 * 台紙の計算(lib/stamp-rallies.ts)は /stamps とスタンプを押した直後の
 * API の両方で同じものを使う。片方だけ直すと、押した直後に「あと2か所」と
 * 言われたのに、スタンプ帳では「あと3か所」になる。
 */

/**
 * 押せる場所をすべて読む。3種あわせて300行弱で、どれも小さい列だけを引く。
 *
 * 観光スポットは公開中のものだけ。伏せたスポットは詳細ページが出ないので
 * 押せず、欄に置くと埋められない台紙になる。美術館とミュージカルは全件で、
 * 終演した作品を外すかどうかは台紙の側(RALLIES)が決める。
 */
export async function loadStampPlaces(): Promise<StampPlace[]> {
  const [attractions, museums, musicals] = await Promise.all([
    db.attraction.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        slug: true,
        name: true,
        engName: true,
        image: true,
        category: true,
        area: true,
        mustSee: true,
        recommendLevel: true,
        views: true,
      },
    }),
    db.museum.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        engName: true,
        image: true,
        recommendLevel: true,
        views: true,
      },
    }),
    db.musical.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        engName: true,
        image: true,
        mustSee: true,
        isOnShow: true,
        recommendLevel: true,
        views: true,
      },
    }),
  ]);

  return [
    ...attractions.map(
      (a): StampPlace => ({
        type: "attraction",
        id: a.id,
        slug: a.slug,
        name: a.name,
        engName: a.engName ?? a.name,
        image: a.image,
        category: a.category || null,
        area: a.area,
        mustSee: a.mustSee,
        recommendLevel: a.recommendLevel ?? 0,
        isOnShow: true,
        views: a.views,
      }),
    ),
    ...museums.map(
      (m): StampPlace => ({
        type: "museum",
        id: m.id,
        slug: m.slug,
        name: m.name,
        engName: m.engName ?? m.name,
        image: m.image,
        category: null,
        area: null,
        mustSee: false,
        recommendLevel: m.recommendLevel ?? 0,
        isOnShow: true,
        views: m.views,
      }),
    ),
    ...musicals.map(
      (m): StampPlace => ({
        type: "musical",
        id: m.id,
        slug: m.slug,
        name: m.name,
        engName: m.engName,
        image: m.image,
        category: null,
        area: null,
        mustSee: m.mustSee,
        recommendLevel: m.recommendLevel,
        isOnShow: m.isOnShow,
        views: m.views,
      }),
    ),
  ];
}

/** Stamp の行と、押した場所の中身。/stamps と API で同じ形で引く。 */
const STAMP_SELECT = {
  id: true,
  stampedAt: true,
  onSite: true,
  attractionId: true,
  museumId: true,
  musicalId: true,
  attraction: {
    select: { slug: true, name: true, engName: true, image: true, category: true },
  },
  museum: { select: { slug: true, name: true, engName: true, image: true } },
  musical: { select: { slug: true, name: true, engName: true, image: true } },
} as const;

/** スタンプ帳に並べる1個。 */
export type StampBookEntry = StampMark & {
  slug: string;
  name: string;
  image: string;
};

async function loadEntries(profileId: string): Promise<StampBookEntry[]> {
  const rows = await db.stamp.findMany({
    where: { profileId },
    orderBy: { stampedAt: "desc" },
    select: STAMP_SELECT,
  });

  const entries: StampBookEntry[] = [];
  for (const row of rows) {
    const type = stampType(row);
    if (!type) continue;
    const target =
      type === "attraction"
        ? row.attraction
        : type === "museum"
          ? row.museum
          : row.musical;
    // 外部キーと CHECK 制約があるので、ここが null になるのは
    // 対象が消えた直後の競合だけ。描けないものは黙って飛ばす。
    if (!target) continue;
    const id = row.attractionId ?? row.museumId ?? row.musicalId ?? "";
    entries.push({
      key: placeKey({ type, id }),
      stampId: row.id,
      type,
      slug: target.slug,
      name: target.name,
      engName: target.engName ?? target.name,
      image: target.image,
      category:
        type === "attraction" && row.attraction
          ? row.attraction.category || null
          : null,
      stampedAt: row.stampedAt.toISOString(),
      onSite: row.onSite,
    });
  }
  return entries;
}

export type StampBookData = {
  /** 押したスタンプ。新しい順。 */
  entries: StampBookEntry[];
  rallies: RallyProgress[];
  /** 種別ごとの押せる数(分母)。 */
  totals: Record<StampType, number>;
  /** 種別ごとの押した数。 */
  counts: Record<StampType, number>;
};

/** /stamps が描くものを全部読む。 */
export async function loadStampBook(profileId: string): Promise<StampBookData> {
  const [entries, places] = await Promise.all([
    loadEntries(profileId),
    loadStampPlaces(),
  ]);

  const marks = new Map<string, StampMark>(entries.map((e) => [e.key, e]));
  const rallies = buildRallies(places, marks, buildTwinIndex(places));

  const totals: Record<StampType, number> = { attraction: 0, museum: 0, musical: 0 };
  for (const place of places) totals[place.type] += 1;
  const counts: Record<StampType, number> = { attraction: 0, museum: 0, musical: 0 };
  for (const entry of entries) counts[entry.type] += 1;

  return { entries, rallies, totals, counts };
}

/**
 * 押した直後の報告を作る。/api/stamps の POST から呼ぶ。
 *
 * 押す前の状態は、押したスタンプを取り除いて計算し直して作る。対の館で
 * 先に押してあった欄は押す前から埋まっているので、その台紙は進まない
 * ——数を1引くだけの計算だと、ここで「1つ進んだ」と嘘をつく。
 */
export async function loadPressProgress(
  profileId: string,
  key: string,
  change: "created" | "upgraded",
): Promise<StampPressProgress> {
  const [entries, places] = await Promise.all([
    loadEntries(profileId),
    loadStampPlaces(),
  ]);

  const after = new Map<string, StampMark>(entries.map((e) => [e.key, e]));
  const before = new Map(after);
  if (change === "created") before.delete(key);

  const twins = buildTwinIndex(places);
  const touched = ralliesContaining(buildRallies(places, after, twins), key, twins);
  const beforeCounts = new Map(
    buildRallies(places, before, twins).map((r) => [r.rally.slug, r.count]),
  );

  const total = entries.length;
  const previous = stampTitleFor(change === "created" ? total - 1 : total);
  const current = stampTitleFor(total);

  return {
    total,
    gold: entries.filter((e) => e.onSite).length,
    title: {
      previous: previous.current,
      current: current.current,
      next: current.next,
      rankedUp: current.index > previous.index,
    },
    rallies: touched.map((r) => ({
      slug: r.rally.slug,
      title: r.rally.title,
      unit: STAMP_META[r.rally.type].unit,
      before: beforeCounts.get(r.rally.slug) ?? r.count,
      count: r.count,
      total: r.total,
    })),
  };
}
