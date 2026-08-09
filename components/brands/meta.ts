import type { Brand, BrandItem } from "@prisma/client";
import { SITE_URL } from "@/lib/seo";

export const BRAND_BASE = "/brands";
export const BRAND_SECTION_NAME = "イギリスのブランド";

export type BrandWithItems = Brand & { items: BrandItem[] };

export function brandPath(slug: string): string {
  return `${BRAND_BASE}/${slug}`;
}

export type BrandCategory =
  | "fashion"
  | "footwear"
  | "outdoor"
  | "beauty"
  | "homeware"
  | "food";

/**
 * 並び順は「現地で買う理由の強さ」の順。
 *
 * 読者がこのページに来る動機の中心は価格差なので、日本との差が出やすい
 * カテゴリを先に置く。同じ £100 でも、日本の直営価格と倍近く開くアパレルと、
 * ほとんど変わらない紅茶とでは、読者にとっての優先度が違う。
 */
export const BRAND_CATEGORIES: {
  key: BrandCategory;
  label: string;
  description: string;
}[] = [
  {
    key: "fashion",
    label: "ファッション",
    description:
      "日本との価格差が最も大きいカテゴリ。同じ品が本国では定価から下がっていることも珍しくない。",
  },
  {
    key: "footwear",
    label: "靴・レザー",
    description:
      "サイズを実際に合わせられるのが現地で買う最大の利点。UKサイズは日本表記と1cm以上ずれることがある。",
  },
  {
    key: "outdoor",
    label: "アウトドア・カントリー",
    description:
      "雨と風が前提の国で育ったブランド群。実用品として作られたものが、そのまま定番になっている。",
  },
  {
    key: "beauty",
    label: "コスメ・香り",
    description:
      "単価が手頃で荷物にならず、価格差もはっきり出る。土産と自分用を兼ねやすい。",
  },
  {
    key: "homeware",
    label: "食器・インテリア",
    description:
      "割れ物なので持ち帰りに難があるが、アウトレットとの価格差は全カテゴリで最も大きい。",
  },
  {
    key: "food",
    label: "紅茶・食品",
    description:
      "ブランドそのものが観光地になっている店が多い。買うより「行く」価値で選ぶカテゴリ。",
  },
];

export const BRAND_CATEGORY_LABELS: Record<BrandCategory, string> =
  Object.fromEntries(
    BRAND_CATEGORIES.map((c) => [c.key, c.label]),
  ) as Record<BrandCategory, string>;

/** カテゴリ見出しへのアンカー。ページ内ナビと目次で同じ値を使う。 */
export function categoryAnchor(key: BrandCategory): string {
  return `category-${key}`;
}

export function groupByCategory(brands: Brand[]) {
  return BRAND_CATEGORIES.map((c) => ({
    ...c,
    items: brands.filter((b) => b.category === c.key),
  })).filter((g) => g.items.length > 0);
}

/**
 * ハブのブランド一覧。
 *
 * Souvenir 側と同じ理由で Product は使わない(components/souvenirs/jsonld.ts 参照)。
 * 在庫も現在価格も持っていないので、ItemList として並び順だけを渡す。
 */
export function brandListJsonLd(brands: Brand[]) {
  const pageUrl = `${SITE_URL}${BRAND_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#brands`,
    name: "ロンドンで買えるイギリスのブランド",
    numberOfItems: brands.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: brands.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      url: `${SITE_URL}${brandPath(b.slug)}`,
    })),
  };
}

/**
 * ブランド個別ページの Organization。
 *
 * 実在の企業そのものを指すので、持っている事実(英語表記・創業年・公式サイト)
 * だけを入れる。foundingLocation は住所に落とせる粒度で持っていないため出さない。
 */
export function brandJsonLd(brand: BrandWithItems) {
  const pageUrl = `${SITE_URL}${brandPath(brand.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${pageUrl}#organization`,
    name: brand.engName,
    alternateName: brand.name,
    description: brand.blurb,
    ...(brand.founded ? { foundingDate: String(brand.founded) } : {}),
    ...(brand.website ? { url: brand.website } : {}),
    ...(brand.image ? { logo: brand.image } : {}),
  };
}
