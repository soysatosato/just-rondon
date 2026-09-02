"use server";

import db from "../db";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import {
  KM_PER_LAT_DEG,
  KM_PER_LNG_DEG_LONDON,
  distanceKm,
} from "@/lib/sightseeing/geo";

const getTotalCount = unstable_cache(
  async () => db.attraction.count({ where: { isPublished: true } }),
  ["attraction-total-count"],
  { revalidate: 60 * 60 * 24 }, // 24時間
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
 * ロンドンパスの対象スポット。/sightseeing/passes の一覧に使う。
 *
 * 料金は返さない。Attraction.priceAdult は「大人£33、18〜24歳£21.50」の
 * ような散文で、記事側が使っている検証済みの数値
 * (lib/sightseeing/budget.ts の ADMISSIONS)と食い違う行がある。
 * 同じページに2つの値段を出すと、どちらを信じればいいか分からなくなる。
 * 一覧の役目は「対象かどうか」で、金額は各詳細ページに任せる。
 */
export const fetchLondonPassAttractions = async () => {
  return db.attraction.findMany({
    where: { isPublished: true, londonPass: true },
    select: {
      slug: true,
      name: true,
      category: true,
      londonPassNote: true,
    },
    orderBy: { name: "asc" },
  });
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
      const km = distanceKm(spot, origin);
      return {
        ...spot,
        distanceKm: km,
        // 表示は実距離、並べ替えだけスコアを使う。
        score: km - (spot.recommendLevel ?? 0) * RECOMMEND_BONUS_KM,
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

/**
 * /sightseeing/must-see の一覧。
 *
 * 一覧に出すのは写真・名前・要約と、料金/所要時間/最寄駅だけ。
 * select を書かずに行を丸ごと引くと markdown 本文まで読むことになるので、
 * 使う列だけを挙げる(fetchHomeRails / fetchSightseeingHub と同じ方針)。
 */
export const fetchMustSeeAttractions = unstable_cache(
  async () =>
    db.attraction.findMany({
      where: { mustSee: true, isPublished: true },
      select: {
        slug: true,
        name: true,
        engName: true,
        tagline: true,
        summary: true,
        image: true,
        priceAdult: true,
        durationText: true,
        nearestStation: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ["must-see-attractions"],
  { revalidate: 60 * 60 * 24 * 7 },
);

/**
 * /sightseeing/all 用。公開中の全件を一度に返す。
 *
 * 以前はここで page / limit / filters を受けてサーバー側で絞り、10件ずつ
 * 返していた。ただし総件数は
 *   page === 1 && Object.keys(filters).length === 0
 * のときしか取っておらず、呼び出し側は常に6キーのオブジェクトを渡すので
 * この条件は成立しない。totalCount は必ず 0 になり、Pagination が
 * totalPages 0 で何も描画せず、144件中10件までしか辿れなくなっていた。
 *
 * 絞り込みも並べ替えもクライアント側に移したので、ページ送りごと不要になった。
 * 144件ぶんカードに出す列だけを引く(本文は stories 側にあり、ここでは触らない)。
 */
export async function fetchAllAttractions() {
  return db.attraction.findMany({
    where: { isPublished: true },
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      engName: true,
      slug: true,
      tagline: true,
      summary: true,
      image: true,
      category: true,
      area: true,
      recommendLevel: true,
      mustSee: true,
      isForKids: true,
      isFree: true,
      priceAdult: true,
      durationText: true,
      nearestStation: true,
    },
  });
}

/**
 * /plan 用。公開中の全件を、プランの計算に要る列だけ返す。
 *
 * fetchAllAttractions と分けているのは緯度経度と開館時間のため。
 * 一覧(/sightseeing/all)はカードに出さないので引いていないが、
 * プランはスポット間の距離と「その日に開いているか」を出すので要る。
 * 逆に tagline / summary はプランでは使わないので引かない。
 */
export const fetchPlanSpots = unstable_cache(
  async () =>
    db.attraction.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        name: true,
        engName: true,
        image: true,
        address: true,
        lat: true,
        lng: true,
        category: true,
        area: true,
        priceAdult: true,
        durationText: true,
        openingHours: true,
        nearestStation: true,
        isFree: true,
        mustSee: true,
        recommendLevel: true,
        londonPass: true,
        londonPassNote: true,
      },
      orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
    }),
  ["plan-spots"],
  { revalidate: 60 * 60 * 24 },
);
