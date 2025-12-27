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
  const where = { category, slug: { not: excludeSlug } };

  const total = await db.attraction.count({ where });
  if (total <= limit) {
    return db.attraction.findMany({
      where,
      take: limit,
      select: { slug: true, name: true, image: true, engName: true },
    });
  }

  const skip = Math.floor(Math.random() * Math.max(0, total - limit));

  return db.attraction.findMany({
    where,
    skip,
    take: limit,
    select: { slug: true, name: true, image: true, engName: true },
  });
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

  // ✅ orderByは「指定がないなら undefined」にする（{}はNG）
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
      // デフォルト並び（元コードの fetchAttractions と同じ思想に寄せるならこれ）
      orderBy = [{ recommendLevel: "desc" }, { name: "asc" }];
      break;
  }

  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
  const take = Math.max(1, limit);

  // ✅ DBでページング＆件数取得（全件取得→slice を廃止）
  const [facilities, totalCount] = await Promise.all([
    db.attraction.findMany({
      where,
      orderBy, // undefined なら Prisma が無視してくれる
      skip,
      take,
      // 必要なフィールドだけ返すとさらに速い
      // select: { slug: true, name: true, image: true, engName: true, ... }
    }),
    db.attraction.count({ where }),
  ]);

  return { facilities, totalCount };
}
