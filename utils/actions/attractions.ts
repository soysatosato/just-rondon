"use server";

import db from "../db";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

const getTotalCount = unstable_cache(
  async () => db.attraction.count(),
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
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  return { attractions, total };
};

export const fetchAttractionDetails = async (slug: string) => {
  const attraction = await db.attraction.findUnique({
    where: { slug },
    include: {
      sections: true,
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
  return db.attraction.findUnique({
    where: { slug },
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
      slug: { not: excludeSlug, gte: pivot },
    },
    orderBy: { slug: "asc" },
    take: limit,
  });
};

export const fetchMustSeeAttractions = unstable_cache(
  async () =>
    db.attraction.findMany({
      where: { mustSee: true },
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
  const where: any = {};

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
