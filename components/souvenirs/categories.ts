import type { Souvenir } from "@prisma/client";

export const SOUVENIR_BASE = "/souvenirs";
export const SOUVENIR_SECTION_NAME = "ロンドンのお土産";

/** 品目1件の詳細ページ。 */
export function souvenirPath(slug: string): string {
  return `${SOUVENIR_BASE}/${slug}`;
}

export type SouvenirCategory = "tea" | "sweets" | "food" | "beauty" | "goods";

/**
 * 並び順は「配りやすさ」の順。
 * 読者の大半はまず職場や友人へのばらまき用を探しているので、
 * 単価が低く数を買えるカテゴリを先に出す。香水や食器は最後でよい。
 */
export const SOUVENIR_CATEGORIES: {
  key: SouvenirCategory;
  label: string;
  description: string;
}[] = [
  {
    key: "tea",
    label: "紅茶",
    description:
      "イギリス土産の第一候補。数百円のスーパー品から、缶がそのまま贈り物になる高級品まで幅が広い。",
  },
  {
    key: "sweets",
    label: "お菓子",
    description:
      "軽い・日持ちする・個包装。ばらまき用として条件が揃っているのはこのカテゴリ。",
  },
  {
    key: "food",
    label: "食品・調味料",
    description:
      "話のネタになるものが多い一方、好みが割れる。渡す相手を選ぶと一気に化ける。",
  },
  {
    key: "beauty",
    label: "コスメ・香り",
    description:
      "日本より安く買えるブランドが多く、価格差そのものが土産の理由になる。",
  },
  {
    key: "goods",
    label: "雑貨",
    description: "食べて消えない。ロンドンに行ったこと自体が形として残るもの。",
  },
];

export const SOUVENIR_CATEGORY_LABELS: Record<SouvenirCategory, string> =
  Object.fromEntries(
    SOUVENIR_CATEGORIES.map((c) => [c.key, c.label]),
  ) as Record<SouvenirCategory, string>;

export const SOUVENIR_CATEGORY_DESCRIPTIONS: Record<
  SouvenirCategory,
  string
> = Object.fromEntries(
  SOUVENIR_CATEGORIES.map((c) => [c.key, c.description]),
) as Record<SouvenirCategory, string>;

/** カテゴリ見出しへのアンカー。ページ内ナビと目次で同じ値を使う。 */
export function categoryAnchor(key: SouvenirCategory): string {
  return `category-${key}`;
}

export function groupByCategory(items: Souvenir[]) {
  return SOUVENIR_CATEGORIES.map((c) => ({
    ...c,
    items: items.filter((i) => i.category === c.key),
  })).filter((g) => g.items.length > 0);
}
