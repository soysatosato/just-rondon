import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { SITE_URL } from "@/lib/seo";
import { SIGHTSEEING_BASE, SIGHTSEEING_PUBLISHER } from "../jsonld";
import type { FeatureArticle } from "./types";

export { SITE_URL, SIGHTSEEING_BASE };

/**
 * 特集ページの登録簿。
 *
 * パンくずの階層名と見出しの色だけをここで持つ。本文は各ページの
 * data.ts に置いたままにしている——6本ぶんの本文をここへ集めても
 * 1ファイルが数千行になるだけで、取り違えが減るわけではないため。
 *
 * 色は /sightseeing ハブの「テーマで巡る」タイルと合わせること。
 * ハブで青いタイルを踏んだ先の見出しが緑だと、同じ導線に見えない。
 */
export type FeatureMeta = {
  slug: string;
  /** パンくずと JSON-LD に出す名前。 */
  label: string;
  /** 見出しの上に出す英語ラベル。 */
  eyebrow: string;
  /** 見出し脇の細い罫の色。 */
  stripe: string;
};

export const FEATURES: FeatureMeta[] = [
  {
    slug: "must-see",
    label: "見逃せない観光名所",
    eyebrow: "Must-See",
    stripe: "bg-red-500",
  },
  {
    slug: "free",
    label: "無料スポット",
    eyebrow: "Free Entry",
    stripe: "bg-red-500",
  },
  {
    slug: "harry-potter",
    label: "ハリー・ポッター",
    eyebrow: "Harry Potter",
    stripe: "bg-amber-500",
  },
  {
    slug: "royal-london",
    label: "王室ゆかりのロンドン",
    eyebrow: "Royal London",
    stripe: "bg-violet-500",
  },
  {
    slug: "thames-cruise",
    label: "テムズ川クルーズ",
    eyebrow: "River Thames",
    stripe: "bg-sky-500",
  },
  {
    slug: "stadium-tours",
    label: "スタジアムツアー",
    eyebrow: "Stadium Tours",
    stripe: "bg-emerald-500",
  },
  {
    slug: "kids-free-activities",
    label: "子どもと楽しむ無料スポット",
    eyebrow: "With Kids",
    stripe: "bg-red-500",
  },
  {
    slug: "christmas-markets",
    label: "クリスマスマーケット",
    eyebrow: "Christmas Markets",
    stripe: "bg-red-500",
  },
];

export function featurePath(slug: string) {
  return `${SIGHTSEEING_BASE}/${slug}`;
}

export function getFeatureMeta(slug: string) {
  return FEATURES.find((f) => f.slug === slug) ?? null;
}

export function featureBreadcrumbJsonLd(article: {
  slug: string;
  title: string;
}) {
  const meta = getFeatureMeta(article.slug);

  return breadcrumbListJsonLd({
    path: "/sightseeing",
    current: meta?.label ?? article.title,
    currentHref: featurePath(article.slug),
  });
}

/**
 * 特集が並べている項目を ItemList として出す。
 *
 * CollectionPage ではなく ItemList にしているのは、特集の中身が
 * 「記事の集まり」ではなく「場所の並び」だから。項目の url は、
 * 詳細ページを持つものだけに付ける——リンク先の無い項目に
 * ページのURLを繰り返し入れると、同じURLの重複になる。
 */
export function featureItemListJsonLd(
  article: FeatureArticle,
  hrefs: Map<string, string>,
) {
  const url = `${SITE_URL}${featurePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#items`,
    url,
    name: article.title,
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    numberOfItems: article.items.length,
    itemListElement: article.items.map((item, i) => {
      const href = hrefs.get(item.slug);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.title,
        ...(href ? { url: `${SITE_URL}${href}` } : {}),
      };
    }),
  };
}
