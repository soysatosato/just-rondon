import "server-only";

import db from "../db";
import {
  meetsShopPageStandard,
  type ShopWithRelations,
} from "@/lib/restaurants/shop";

/**
 * 店(Restaurant)の読み出し。店のページと、料理ページの比較表に使う。
 *
 * unstable_cache を通さない。確認日(Date)が JSON 化されて文字列に変わり、
 * 表示側の扱いが二通りになるため。ページ自体が1日の ISR なので、
 * DB を読むのは再生成のときだけで済む。
 */
const SHOP_INCLUDE = {
  dish: true,
  menuPicks: { orderBy: { displayOrder: "asc" as const } },
  branches: { orderBy: { displayOrder: "asc" as const } },
  photos: { orderBy: { displayOrder: "asc" as const } },
};

export async function fetchShop(slug: string): Promise<ShopWithRelations | null> {
  return db.restaurant.findUnique({ where: { slug }, include: SHOP_INCLUDE });
}

/** すべての店(公開基準を満たさない店も含む)。 */
export async function fetchAllShops(): Promise<ShopWithRelations[]> {
  return db.restaurant.findMany({
    include: SHOP_INCLUDE,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

/** 店のページを持つ店だけ。 */
export async function fetchPublishedShops(): Promise<ShopWithRelations[]> {
  return (await fetchAllShops()).filter(meetsShopPageStandard);
}

/** 料理ページの店(比較表とカード用)。店のページの有無の判定に必要な列ごと引く。 */
export async function fetchShopsOfDish(
  dishId: string,
): Promise<ShopWithRelations[]> {
  return db.restaurant.findMany({
    where: { dishId },
    include: SHOP_INCLUDE,
    orderBy: { displayOrder: "asc" },
  });
}
