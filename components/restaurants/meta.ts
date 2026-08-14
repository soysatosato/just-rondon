import type { Dish, Restaurant } from "@prisma/client";
import { SITE_URL } from "@/lib/seo";

export const RESTAURANT_BASE = "/restaurants";
export const RESTAURANT_SECTION_NAME = "レストランとお店";

export type DishWithRestaurants = Dish & { restaurants: Restaurant[] };

export function dishPath(slug: string): string {
  return `${RESTAURANT_BASE}/${slug}`;
}

/**
 * 料理ページの構造化データ。
 *
 * Recipe は使わない。作り方を書いていないので Google の要件を満たさず、
 * 満たすために手順を捏造することになる。店の一覧としての ItemList と、
 * 各店の Restaurant を出す。
 *
 * Restaurant に address を入れていないのは番地を持っていないため。
 * 部分的にでも正しい情報だけを渡す方が、推測で埋めるより安全。
 */
export function dishJsonLd(dish: DishWithRestaurants) {
  const pageUrl = `${SITE_URL}${dishPath(dish.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#restaurants`,
    name: `${dish.name}が食べられるロンドンの店`,
    numberOfItems: dish.restaurants.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: dish.restaurants.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Restaurant",
        name: r.engName,
        alternateName: r.name,
        servesCuisine: dish.engName,
        ...(r.priceRange ? { priceRange: r.priceRange } : {}),
        ...(r.website ? { url: r.website } : {}),
        ...(r.image ? { image: r.image } : {}),
      },
    })),
  };
}

/** ハブの料理一覧。 */
export function dishListJsonLd(dishes: Dish[]) {
  const pageUrl = `${SITE_URL}${RESTAURANT_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#dishes`,
    name: "ロンドンのレストラン",
    numberOfItems: dishes.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: dishes.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: `${SITE_URL}${dishPath(d.slug)}`,
    })),
  };
}
