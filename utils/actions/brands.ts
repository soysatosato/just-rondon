"use server";

import db from "../db";
import { unstable_cache } from "next/cache";

/**
 * ブランドは seed スクリプトからしか更新されないので1日キャッシュする。
 * 在庫や現在価格のような変わりやすい情報は持たせていない
 * (schema.prisma の Brand 参照)ので、この粒度で問題ない。
 */
export const fetchBrands = unstable_cache(
  async () =>
    db.brand.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
  ["brands-all"],
  { revalidate: 60 * 60 * 24 },
);

export const fetchBrandSlugs = unstable_cache(
  async () => db.brand.findMany({ select: { slug: true } }),
  ["brand-slugs"],
  { revalidate: 60 * 60 * 24 },
);

export const fetchBrand = async (slug: string) =>
  db.brand.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { displayOrder: "asc" } },
    },
  });
