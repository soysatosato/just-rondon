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

export const fetchMustSeeAttractions = async () => {
  const attractions = await db.attraction.findMany({
    where: { mustSee: true },
    orderBy: {
      createdAt: "asc",
    },
  });
  return attractions;
};
