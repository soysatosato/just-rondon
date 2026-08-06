import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { HousingGuideArticle } from "./types";

export { SITE_URL };

export const HOUSING_BASE = "/housing";
export const HOUSING_SECTION_NAME = "住まい探し";

/**
 * ハブでの分類。読者が家探しで実際にたどる順番に合わせる。
 * 「探す → 契約とお金 → 見極める → 入居後」以外は増やさないこと。
 */
export type HousingCategory = "search" | "contract" | "decide" | "after";

export const HOUSING_CATEGORY_LABELS: Record<HousingCategory, string> = {
  search: "物件を探す",
  contract: "契約とお金",
  decide: "見極める",
  after: "入居後・退去",
};

export const HOUSING_CATEGORY_ORDER: HousingCategory[] = [
  "search",
  "contract",
  "decide",
  "after",
];

export type HousingGuideMeta = {
  slug: string;
  category: HousingCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 住まい探しガイドの並び。「探す → 契約とお金 → 見極める → 入居後」＝
 * 読者が実際に踏む順。
 *
 * 先頭がポータルサイトなのは、渡英前・渡英直後の読者が最初に開くのが
 * Rightmove だから。制度の話(契約形態・お金)を先に置くと、
 * 「まだ物件も見ていないのに法律の話をされている」と離脱する。
 *
 * next-sitemap.config.js の staticPages と、/housing ハブのカード表示順を
 * このリストと一致させること。
 */
export const housingGuides: HousingGuideMeta[] = [
  {
    slug: "rightmove-zoopla-openrent",
    category: "search",
    eyebrow: "Portals",
    label: "Rightmove・Zoopla・OpenRent の使い分け",
    blurb:
      "一棟まるごと借りるならこの3つ。掲載元が違うので3つとも見る必要があります。OpenRent だけが大家直で、エージェント経由にはない速さと落とし穴があります。",
  },
  {
    slug: "spareroom",
    category: "search",
    eyebrow: "Flatshare",
    label: "SpareRoom でフラットシェアを探す",
    blurb:
      "ロンドンで最も現実的な選択肢。ただし「借主」ではなく「lodger」になると法的保護がまるごと変わります。募集文の読み方と、同居人の見極め方。",
  },
  {
    slug: "japanese-listings",
    category: "search",
    eyebrow: "Japanese Community",
    label: "mixb・日系コミュニティ経由で探す",
    blurb:
      "日本語で完結し保証人も要らない一方、契約書がない・又貸しで違法という物件が混じります。使いどころと、踏んではいけない地雷の見分け方。",
  },
  {
    slug: "tenancy-types",
    category: "contract",
    eyebrow: "Tenancy Law",
    label: "契約形態の地図（2026年5月の法改正後）",
    blurb:
      "AST も Section 21 も廃止されました。すべての契約が期間の定めのない assured periodic tenancy に転換され、借主は2ヶ月前通知でいつでも出られます。",
  },
  {
    slug: "deposits-and-fees",
    category: "contract",
    eyebrow: "Money",
    label: "初期費用と、払ってはいけない金",
    blurb:
      "敷金は上限5週間分、holding deposit は1週間分、前払い家賃は1ヶ月分まで。契約手数料・更新料・内見料はすべて違法です。請求されたら全額取り戻せます。",
  },
  {
    slug: "referencing",
    category: "contract",
    eyebrow: "Referencing",
    label: "審査を通す（信用情報ゼロの渡英直後に）",
    blurb:
      "年収が家賃の30倍という壁と、UK のクレジットヒストリーがない問題。2026年5月から「半年分前払い」での突破が違法になり、保証人サービスが事実上の必須になりました。",
  },
  {
    slug: "where-to-live",
    category: "decide",
    eyebrow: "Where",
    label: "エリアの選び方と、家賃と交通費の総額",
    blurb:
      "Zone 3 の安い家賃は、定期代で消えることがあります。総額での比較方法、治安データの調べ方、council tax band と EPC の確認手順。",
  },
  {
    slug: "viewing",
    category: "decide",
    eyebrow: "Viewing",
    label: "内見チェックリスト",
    blurb:
      "オンライン内見が普及した今こそ、足を運ぶ価値が上がっています。カビ・暖房・水圧・騒音の確認手順と、シェアで同居人を見極める質問リスト。",
  },
  {
    slug: "moving-out",
    category: "after",
    eyebrow: "Deposit Back",
    label: "退去とデポジット返還交渉",
    blurb:
      "入居初日の写真が、1年後に数十万円を左右します。inventory の残し方、不当な減額への反論、無料で使える裁定制度（ADR）の手順。",
  },
];

export function housingGuidePath(slug: string) {
  return `${HOUSING_BASE}/${slug}`;
}

export function getHousingGuideMeta(slug: string) {
  return housingGuides.find((g) => g.slug === slug) ?? null;
}

/** /housing/[slug] が実際に生成するページ。 */
export const housingGuideSlugs = housingGuides.map((g) => g.slug);

export function housingGuidesByCategory(category: HousingCategory) {
  return housingGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildHousingGuideMetadata(article: HousingGuideArticle) {
  return buildPageMetadata({
    path: housingGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function housingGuideBreadcrumbJsonLd(article: HousingGuideArticle) {
  const meta = getHousingGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: HOUSING_SECTION_NAME, path: HOUSING_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: housingGuidePath(article.slug),
    },
  ]);
}

export function housingGuideArticleJsonLd(article: HousingGuideArticle) {
  const url = `${SITE_URL}${housingGuidePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: article.updatedAt,
    author: SITE_PUBLISHER,
    publisher: SITE_PUBLISHER,
  };
}

/** /housing ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function housingHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${HOUSING_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: housingGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${housingGuidePath(g.slug)}`,
    })),
  };
}
