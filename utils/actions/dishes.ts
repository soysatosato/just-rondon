"use server";

import db from "../db";
import { unstable_cache } from "next/cache";

/**
 * 料理と店は seed スクリプトからしか更新されないので1日キャッシュする。
 * 営業時間や休業のような変わりやすい情報は持たせていない
 * (schema.prisma の Restaurant 参照)ので、この粒度で問題ない。
 */
export const fetchDishes = unstable_cache(
  async () =>
    db.dish.findMany({
      orderBy: [{ displayOrder: "asc" }],
      include: {
        restaurants: { orderBy: { displayOrder: "asc" } },
      },
    }),
  ["dishes-all"],
  { revalidate: 60 * 60 * 24 },
);

export const fetchDishSlugs = unstable_cache(
  async () => db.dish.findMany({ select: { slug: true } }),
  ["dish-slugs"],
  { revalidate: 60 * 60 * 24 },
);

export const fetchDish = async (slug: string) =>
  db.dish.findUnique({
    where: { slug },
    include: {
      restaurants: { orderBy: { displayOrder: "asc" } },
    },
  });
