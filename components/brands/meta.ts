import type {
  Brand,
  BrandItem,
  BrandImage,
  BrandStore,
  BrandFaq,
} from "@prisma/client";
import { SITE_URL } from "@/lib/seo";

export const BRAND_BASE = "/brands";

/**
 * ブランドの価格の目安(Brand.priceRange・BrandItem.priceRange)を調べた時期。
 * seed-brands.ts の最終投入が 2026-08-23〜09-06。確認日を項目ごとに持つまでは、
 * この時期を画面に出して「いつの数字か」を示す。
 */
export const BRAND_PRICES_RECORDED = "2026年8〜9月";
export const BRAND_SECTION_NAME = "イギリスのブランド";

export type BrandWithItems = Brand & {
  items: BrandItem[];
  images: BrandImage[];
  stores: BrandStore[];
  faqs: BrandFaq[];
};

/** 店舗の種類。並び順は読者が最初に行くべき順。 */
export const STORE_KIND_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  flagship: {
    label: "旗艦店",
    badgeClass: "border-red-600/40 bg-red-600/10 text-red-700 dark:text-red-400",
  },
  store: {
    label: "直営店",
    badgeClass:
      "border-sky-600/40 bg-sky-600/10 text-sky-700 dark:text-sky-400",
  },
  outlet: {
    label: "アウトレット",
    badgeClass:
      "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  },
  retailer: {
    label: "取扱店",
    badgeClass:
      "border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
};

export function getStoreKindMeta(kind: string) {
  return STORE_KIND_META[kind] ?? STORE_KIND_META.retailer;
}

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
 * 並び順はハブでの掲載順。
 *
 * 以前は「日本との価格差が出やすい順」と説明していたが、その差を数字で
 * 確かめていなかった。2026-11 に、ジョー マローンのコロンが今の為替では
 * 日本とほぼ同額だと分かったので、価格差を前提にした説明は外した。
 * 日本との比較は、両国の公式価格・為替・確認日がそろった品でだけ書く。
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
      "定番の型を、本国の店で試着して選べる。日本では見かけない型や色が並ぶこともある。",
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
      "単価が手頃で荷物にならない。土産と自分用を兼ねやすい。液体は持ち帰り方に注意。",
  },
  {
    key: "homeware",
    label: "食器・インテリア",
    description:
      "割れ物なので持ち帰りに手間がかかる。アウトレットで値引きされた品が並ぶことがある。",
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

  // 地図に置いている店舗(番地と郵便番号まで確かめたもの)だけを Store として出す。
  const stores = brand.stores
    .filter((s) => s.address && s.lat != null && s.lng != null)
    .map((s) => ({
      "@type": "Store",
      name: s.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: s.address,
        addressCountry: "GB",
      },
      geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
    }));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${pageUrl}#organization`,
    name: brand.engName,
    alternateName: brand.name,
    description: brand.blurb,
    ...(brand.founded ? { foundingDate: String(brand.founded) } : {}),
    ...(brand.website ? { url: brand.website } : {}),
    ...(stores.length > 0 ? { location: stores } : {}),
  };
}
