"use server";

import db from "../db";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

const getTotalCount = unstable_cache(
  async () => db.attraction.count({ where: { isPublished: true } }),
  ["attraction-total-count"],
  { revalidate: 60 * 60 * 24 }, // 1時間
);

export const fetchAttractions = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  // 総件数
  const total = await getTotalCount();

  // ページごとの取得
  const attractions = await db.attraction.findMany({
    where: { isPublished: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  return { attractions, total };
};

export const fetchAttractionDetails = async (slug: string) => {
  const attraction = await db.attraction.findFirst({
    // 非公開(終了した期間限定の催し等)は詳細ページも出さない。
    where: { slug, isPublished: true },
    include: {
      // 読み物本文。AttractionSection の後継。
      stories: { orderBy: { displayOrder: "asc" } },
      // 入っているスポットにだけ「着いてからの歩き方」を出す。
      visitFlow: { orderBy: { displayOrder: "asc" } },
    },
  });
  return attraction;
};

/**
 * 相互リンクの存在確認用。リンクを1本出すために sections の本文まで
 * 引くのは重いので、名前だけ取る。
 */
export const fetchAttractionName = async (slug: string) => {
  return db.attraction.findFirst({
    where: { slug, isPublished: true },
    select: { name: true },
  });
};

function hashToUint32(input: string): number {
  let h = 2166136261; // FNV-1a 32-bit seed-ish
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const fetchRandomAttractionsByCategory = async (
  category: string,
  excludeSlug: string,
  limit = 3,
) => {
  const day = new Date().toISOString().slice(0, 10);
  const pivot = hashToUint32(`${day}|${category}`).toString(36);

  return db.attraction.findMany({
    where: {
      category,
      isPublished: true,
      slug: { not: excludeSlug, gte: pivot },
    },
    orderBy: { slug: "asc" },
    take: limit,
  });
};

/**
 * 徒歩圏の近隣スポット。カテゴリー違いでも拾うのが狙いで、
 * 「ロンドン塔の次はタワーブリッジ」のような実際の回り方に沿った導線を作る。
 *
 * 距離は緯度経度から算出するだけで、area は触らない(area は手動付与の運用)。
 * Prisma で距離順に並べる手段がないため、緯度経度で粗く矩形に絞ってから
 * アプリ側で並べ替える。135件規模なので取得コストは問題にならない。
 */
const NEARBY_MAX_KM = 2.5;

/**
 * 「近くで一緒に回れる」に馴染まないスポット。
 *
 * 観光パスや市内を巡回するバスツアーは Attraction として登録されているが、
 * 特定の場所を指さないため、緯度経度が便宜的な一点でしかない。距離順に出すと
 * 「大英博物館の近く = ロンドンパス」のような無意味な案内になる。
 * スタジアムツアーのように実在の場所を持つ tour は除外しない。
 */
const NEARBY_EXCLUDED_SLUGS = new Set([
  "the-london-pass",
  "merlin-london-attractions-pass",
  "golden-pass-london",
  "hop-on-hop-off-bus-tour-london",
  "the-ghost-bus-tours",
  "the-total-london-experience-tour",
]);

/** 緯度1度 ≒ 111km。ロンドン(北緯51.5度)の経度1度 ≒ 69km。 */
const KM_PER_LAT_DEG = 111;
const KM_PER_LNG_DEG_LONDON = 69;

export const fetchNearbyAttractions = async (
  origin: { lat: number; lng: number },
  excludeSlug: string,
  limit = 4,
) => {
  const latPad = NEARBY_MAX_KM / KM_PER_LAT_DEG;
  const lngPad = NEARBY_MAX_KM / KM_PER_LNG_DEG_LONDON;

  const candidates = await db.attraction.findMany({
    where: {
      isPublished: true,
      slug: { not: excludeSlug },
      lat: { gte: origin.lat - latPad, lte: origin.lat + latPad },
      lng: { gte: origin.lng - lngPad, lte: origin.lng + lngPad },
    },
    select: {
      slug: true,
      name: true,
      image: true,
      category: true,
      lat: true,
      lng: true,
      durationText: true,
      recommendLevel: true,
    },
  });

  // 中心部のスポットは徒歩圏に20件以上ある。純粋な距離順だと、数十m近いだけの
  // 小さなスポットが有名どころを押し出してしまうので、おすすめ度で少し補正する。
  // recommendLevel 1 につき 150m ぶん近いものとして扱う程度の弱い重み。
  const RECOMMEND_BONUS_KM = 0.15;

  return candidates
    .map((spot) => {
      const dLat = (spot.lat - origin.lat) * KM_PER_LAT_DEG;
      const dLng = (spot.lng - origin.lng) * KM_PER_LNG_DEG_LONDON;
      const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng);
      return {
        ...spot,
        distanceKm,
        // 表示は実距離、並べ替えだけスコアを使う。
        score: distanceKm - (spot.recommendLevel ?? 0) * RECOMMEND_BONUS_KM,
      };
    })
    .filter(
      (spot) =>
        spot.distanceKm <= NEARBY_MAX_KM &&
        !NEARBY_EXCLUDED_SLUGS.has(spot.slug),
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
};

/**
 * 指定した slug のスポットを、渡された順序のまま返す。
 *
 * モデルコース記事の末尾に「この記事で紹介したスポット」を出すために使う。
 * 記事側の並び(本文の登場順)が意味を持つので、DB の返却順ではなく
 * 引数の順に並べ直す。該当しない slug は黙って捨てる。
 */
export const fetchAttractionsBySlugs = async (slugs: string[]) => {
  if (slugs.length === 0) return [];

  const found = await db.attraction.findMany({
    where: { slug: { in: slugs }, isPublished: true },
    select: {
      slug: true,
      name: true,
      image: true,
      durationText: true,
      priceAdult: true,
      isFree: true,
    },
  });

  const bySlug = new Map(found.map((spot) => [spot.slug, spot]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
};

/**
 * 入場無料のスポットをカテゴリー別にまとめる。/sightseeing/free 用。
 *
 * /sightseeing/all にも free フィルターはあるが、あちらは組み合わせ爆発を
 * 避けるため noindex にしてある。「ロンドン 観光 無料」で検索した人が
 * 着地できる静的なURLが無かったので、専用ページを用意している。
 */
export const fetchFreeAttractionsByCategory = unstable_cache(
  async () => {
    const free = await db.attraction.findMany({
      where: { isFree: true, isPublished: true },
      select: {
        slug: true,
        name: true,
        image: true,
        category: true,
        summary: true,
        tagline: true,
        durationText: true,
        nearestStation: true,
        recommendLevel: true,
      },
      orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
    });

    const groups = new Map<string, typeof free>();
    for (const spot of free) {
      const key = spot.category || "other";
      groups.set(key, [...(groups.get(key) ?? []), spot]);
    }

    // 件数の多いカテゴリーから見せる。同数ならカテゴリー名で安定させる。
    return [...groups.entries()]
      .map(([category, spots]) => ({ category, spots }))
      .sort(
        (a, b) =>
          b.spots.length - a.spots.length ||
          a.category.localeCompare(b.category),
      );
  },
  ["free-attractions-by-category"],
  { revalidate: 60 * 60 * 24 },
);

export const fetchMustSeeAttractions = unstable_cache(
  async () =>
    db.attraction.findMany({
      where: { mustSee: true, isPublished: true },
      orderBy: { createdAt: "asc" },
    }),
  ["must-see-attractions"],
  { revalidate: 60 * 60 * 24 * 7 },
);

export async function fetchAllAttractions({
  page = 1,
  limit = 10,
  filters = {},
}: {
  page?: number;
  limit?: number;
  filters?: any;
}) {
  const where: any = { isPublished: true };

  if (filters.rec) where.recommendLevel = filters.rec;
  if (filters.mustSee) where.mustSee = true;
  if (filters.kids) where.isForKids = true;
  if (filters.free) where.isFree = true;
  if (filters.categories?.length) {
    where.category = { in: filters.categories };
  }

  let orderBy:
    | { name: "asc" | "desc" }
    | { recommendLevel: "asc" | "desc" }
    | Array<{ recommendLevel?: "asc" | "desc"; name?: "asc" | "desc" }>
    | undefined;

  switch (filters.sort) {
    case "name_asc":
      orderBy = { name: "asc" };
      break;
    case "name_desc":
      orderBy = { name: "desc" };
      break;
    case "recommend_desc":
      orderBy = { recommendLevel: "desc" };
      break;
    default:
      orderBy = [{ recommendLevel: "desc" }, { name: "asc" }];
  }

  const take = Math.max(1, limit);
  const skip = (Math.max(1, page) - 1) * take;

  // 👇 countはキャッシュから（0クエリ）
  const totalCountPromise =
    page === 1 && Object.keys(filters).length === 0 ? getTotalCount() : null;

  // 👇 一覧は常に1クエリ
  const facilities = await db.attraction.findMany({
    where,
    orderBy,
    skip,
    take,
  });

  const totalCount = totalCountPromise ? await totalCountPromise : undefined;

  return {
    facilities,
    totalCount: totalCount ?? 0
  };
}
