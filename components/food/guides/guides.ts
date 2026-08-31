import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { FoodGuideArticle } from "./types";

export { SITE_URL };

export const FOOD_BASE = "/food";
export const FOOD_SECTION_NAME = "食費を抑える";

/**
 * 記事の分類。「今日すぐ効くか、仕込みが要るか」で分ける。
 *
 * 以前はハブがこれで見出しを立て、6本を4グループに分けて並べていた。
 * ただしその一覧はページ上部の状況カードと同じ6本・同じリンクで、
 * 6つから1つ選ぶ作業は選択肢を2箇所に割っても楽にならない。
 * カテゴリ別の一覧は畳み、ラベルだけが記事末尾の索引に残っている。
 */
export type FoodCategory = "today" | "timing" | "where" | "longstay";

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  today: "今日から効く",
  timing: "時間帯で買う",
  where: "買う場所を変える",
  longstay: "長期滞在者向け",
};

export type FoodGuideMeta = {
  slug: string;
  category: FoodCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 食費節約ガイドの並び。「効果が大きく、今日すぐできる順」。
 *
 * 先頭が Meal Deal なのは、ロンドンで昼食を買う人がほぼ全員通る道で、
 * かつ会員価格を知らないだけで毎回損をしているから。
 * アプリの話を先に置くと「インストールが面倒」で離脱する。
 *
 * next-sitemap.config.js の staticPages と、/food ハブのカード表示順を
 * このリストと一致させること。ハブは状況カードをこの順で出す。
 */
export const foodGuides: FoodGuideMeta[] = [
  {
    slug: "meal-deal",
    category: "today",
    eyebrow: "Meal Deal",
    label: "Meal Deal を使い切る",
    blurb:
      "ロンドンの昼食の基本形。Tesco・Sainsbury's・Boots・Greggs の価格差と、同じ£3.60で最大値を取る組み合わせ方。会員カードを作らないと毎回数十ペンス損します。",
  },
  {
    slug: "loyalty-cards",
    category: "today",
    eyebrow: "Loyalty Cards",
    label: "Clubcard・Nectar は必ず作る",
    blurb:
      "無料で作れて、同じ商品が数十ペンス〜£1安くなります。旅行者でも作れるのか、住所は何を入れるのか、どのカードを優先すべきか。",
  },
  {
    slug: "discount-timing",
    category: "timing",
    eyebrow: "Yellow Sticker",
    label: "値引きシールと閉店前半額を狙う",
    blurb:
      "Wasabi や itsu は閉店30分前に半額。スーパーの値引きシールは店ごとに時刻がほぼ固定です。日本食が恋しい人が、まともな寿司に安くありつく方法。",
  },
  {
    slug: "apps-and-coupons",
    category: "timing",
    eyebrow: "Apps",
    label: "アプリとクーポンで削る",
    blurb:
      "Too Good To Go は袋1つ£3〜5。そしてマクドナルドのアンケートは、条件を満たすとクーポンが半永久的に出続けます。キオスク注文が必須という落とし穴つき。",
  },
  {
    slug: "where-to-buy",
    category: "where",
    eyebrow: "Where to Shop",
    label: "買う場所を変える",
    blurb:
      "Lidl と Aldi は体感2〜3割安い。さらにトルコ系スーパーと中華系スーパーは野菜・米・肉が別次元です。日本食も Japan Centre より安く買えます。",
  },
  {
    slug: "long-stay",
    category: "longstay",
    eyebrow: "Long Stay",
    label: "長期滞在者の裏技",
    blurb:
      "飲食店でバイトすれば賄いが出ます。加えて水を買わない・朝食を家で済ませるという地味な習慣が、月単位では最も効きます。",
  },
];

export function foodGuidePath(slug: string) {
  return `${FOOD_BASE}/${slug}`;
}

export function getFoodGuideMeta(slug: string) {
  return foodGuides.find((g) => g.slug === slug) ?? null;
}

/** /food/[slug] が実際に生成するページ。 */
export const foodGuideSlugs = foodGuides.map((g) => g.slug);

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildFoodGuideMetadata(article: FoodGuideArticle) {
  return buildPageMetadata({
    path: foodGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function foodGuideBreadcrumbJsonLd(article: FoodGuideArticle) {
  const meta = getFoodGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: FOOD_SECTION_NAME, path: FOOD_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: foodGuidePath(article.slug),
    },
  ]);
}

export function foodGuideArticleJsonLd(article: FoodGuideArticle) {
  const url = `${SITE_URL}${foodGuidePath(article.slug)}`;

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

/** /food ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function foodHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${FOOD_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: foodGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${foodGuidePath(g.slug)}`,
    })),
  };
}
