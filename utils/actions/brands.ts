import "server-only";

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
      images: { orderBy: { displayOrder: "asc" } },
      stores: { orderBy: { displayOrder: "asc" } },
      faqs: { orderBy: { displayOrder: "asc" } },
    },
  });

/**
 * 旗艦店の一覧(ハブの地図用)。地図に置ける座標を持つ店舗だけ。
 * 座標は seed-brands.ts が住所の郵便番号から入れる。
 */
export const fetchFlagshipStores = async () =>
  db.brandStore.findMany({
    where: { kind: "flagship", lat: { not: null }, lng: { not: null } },
    include: { brand: { select: { slug: true, name: true, engName: true } } },
    orderBy: [{ brand: { displayOrder: "asc" } }],
  });

