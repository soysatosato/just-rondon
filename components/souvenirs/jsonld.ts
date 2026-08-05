import type { Souvenir } from "@prisma/client";
import { SITE_URL } from "@/lib/seo";
import { SOUVENIR_BASE } from "./categories";

/**
 * お土産一覧の ItemList。
 *
 * Product にしないのは、Google が Product に求める price / availability /
 * aggregateRating を1つも持っていないため。実在しない価格を埋めるより、
 * 素直に ItemList として「何をどの順で紹介しているか」だけを渡す。
 */
export function souvenirItemListJsonLd(souvenirs: Souvenir[]) {
  const pageUrl = `${SITE_URL}${SOUVENIR_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    name: "ロンドンで買えるお土産",
    numberOfItems: souvenirs.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: souvenirs.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${pageUrl}#${s.slug}`,
    })),
  };
}
