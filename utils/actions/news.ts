"use server";

import db from "../db";

export const fetchAllNews = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;

  const news = await db.news.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
  const total = await db.news.count();
  return { news, total };
};

export const fetchNews = async (id: string) => {
  const news = await db.news.findUnique({
    where: { id },
  });
  return news;
};

export const fetchLatestNewsByCategory = async () => {
  const categories = [
    "政治・経済・社会",
    "ライフスタイル",
    "文化・エンタメ",
  ] as const;

  const result = {} as Record<(typeof categories)[number], any[]>;

  for (const category of categories) {
    result[category] = await db.news.findMany({
      where: { category },
      orderBy: { createdAt: "desc" },
      take: 5, // 最新7件
    });
  }

  return result;
};

export const fetchNewsByCategory = async ({
  category,
  page = 1,
  limit = 10,
}: {
  category: string;
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;

  const news = await db.news.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await db.news.count({
    where: { category },
  });

  return { news, total };
};
