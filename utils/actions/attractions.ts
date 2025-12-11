"use server";

import db from "../db";

export const fetchAttractions = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  // 総件数
  const total = await db.attraction.count();

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
    include: { sections: true },
  });
  return attraction;
};

export const fetchRandomAttractionsByCategory = async (
  category: string,
  excludeSlug: string,
  limit: number = 3
) => {
  const attractions = await db.attraction.findMany({
    where: {
      category,
      slug: { not: excludeSlug },
    },
    select: {
      slug: true,
      name: true,
      image: true,
      engName: true,
    },
  });

  // ランダムシャッフル
  const shuffled = attractions.sort(() => Math.random() - 0.5);

  return shuffled.slice(0, limit);
};

export const fetchMustSeeAttractions = async () => {
  const attractions = await db.attraction.findMany({
    where: { mustSee: true },
    orderBy: {
      createdAt: "asc",
    },
  });
  return attractions;
};

// fetchFacilities.ts (例)
export async function fetchAllAttractions({ page, limit, filters }: any) {
  const where: any = {};

  if (filters.rec) where.recommendLevel = filters.rec;
  if (filters.mustSee) where.mustSee = true;
  if (filters.kids) where.isForKids = true;
  if (filters.free) where.isFree = true;

  if (filters.categories?.length) {
    where.category = { in: filters.categories };
  }

  let orderBy: any = {};

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
  }

  const all = await db.attraction.findMany({
    where,
    orderBy,
  });

  const start = (page - 1) * limit;

  return {
    facilities: all.slice(start, start + limit),
    totalCount: all.length,
  };
}
