import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import {
  SIGHTSEEING_BASE,
  SIGHTSEEING_PUBLISHER,
  sightseeingBreadcrumbJsonLd,
} from "../jsonld";
import type { AreaGuideArticle } from "./types";

export { SITE_URL };

export const AREAS_BASE = `${SIGHTSEEING_BASE}/areas`;
export const AREAS_SECTION_NAME = "エリアガイド";

/**
 * エリアの slug。
 *
 * DB の Attraction.area にこの文字列がそのまま入る。
 * 変更するときは scripts/assign-attraction-areas.ts と
 * 既存データの両方を直すこと。
 */
export type AreaSlug =
  | "westminster"
  | "southbank"
  | "soho"
  | "city"
  | "shoreditch"
  | "greenwich";

/**
 * ハブでの分類。
 *
 * 「中心部の王道 → 川と東 → 少し足を延ばす」の3段。
 * 初訪問者は1段目だけで足り、2回目以降が2段目に降りてくる。
 *
 * 交通ガイドと違い、ここは「読者の熟練度」ではなく「中心部からの
 * 距離」で切っている。エリアガイドは移動時間が体験を決めるため。
 */
export type AreaCategory = "core" | "riverside" | "further";

export const AREA_CATEGORY_LABELS: Record<AreaCategory, string> = {
  core: "はじめてのロンドンで歩く中心部",
  riverside: "川沿いと、東の下町",
  further: "少し足を延ばす",
};

export const AREA_CATEGORY_BLURBS: Record<AreaCategory, string> = {
  core: "滞在が3日以内なら、この2つで足ります。有名なものはほぼここに集まっています。",
  riverside:
    "テムズ川の南岸と、金融街から東へ。中心部を歩き終えた2日目以降に効きます。",
  further:
    "電車で20〜30分。その分、エリアの中が徒歩で完結するので半日〜1日の単位になります。",
};

export const AREA_CATEGORY_ORDER: AreaCategory[] = [
  "core",
  "riverside",
  "further",
];

export type AreaMeta = {
  slug: AreaSlug;
  category: AreaCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
  /** ハブのカードに出す最寄駅。 */
  station: string;
  /** 歩く時間の目安。 */
  walkTime: string;
};

/**
 * エリアの並び。
 *
 * 先頭がウェストミンスターなのは、登録スポットが最も多く(19件)、
 * かつ★付きが5件と、初訪問者の「まずどこへ」に最短で答えられるから。
 *
 * カムデンとノッティングヒルは意図的に外している。DB のスポットが
 * それぞれ2件・3件しかなく、「半日この辺りを歩く」の記事として
 * 成立しないため。スポットが増えたら追加を検討する。
 *
 * next-sitemap.config.js の staticPages と、/sightseeing/areas ハブの
 * カード表示順をこのリストと一致させること。
 */
export const areaGuides: AreaMeta[] = [
  {
    slug: "westminster",
    category: "core",
    eyebrow: "Westminster & St James's",
    label: "ウェストミンスター／セント・ジェームズ",
    blurb:
      "バッキンガム宮殿、ビッグベン、ウェストミンスター寺院。ロンドンで最も有名なものが徒歩圏に固まっています。衛兵交代式の時刻から逆算して歩くのが正解。",
    station: "Westminster / St James's Park / Victoria",
    walkTime: "3〜4時間",
  },
  {
    slug: "soho",
    category: "core",
    eyebrow: "Soho & Covent Garden",
    label: "ソーホー／コヴェント・ガーデン",
    blurb:
      "大英博物館から劇場街へ。買い物・食事・ミュージカルが一晩で繋がるエリアです。昼と夜で街の顔が変わるので、通す時間帯で体験が別物になります。",
    station: "Leicester Square / Covent Garden / Tottenham Court Road",
    walkTime: "3〜5時間",
  },
  {
    slug: "southbank",
    category: "riverside",
    eyebrow: "South Bank",
    label: "サウスバンク",
    blurb:
      "ロンドン・アイからテート・モダンまで、川沿いの遊歩道が一本道。橋を渡らない限り北岸と行き来しないので、half day の回遊単位としては最も素直です。",
    station: "Waterloo / Southwark / London Bridge",
    walkTime: "3〜4時間",
  },
  {
    slug: "city",
    category: "riverside",
    eyebrow: "The City & Tower",
    label: "シティ／タワー地区",
    blurb:
      "ロンドン塔とタワーブリッジ、そして高層ビルの展望台。平日と週末で人の量が正反対になる、ロンドンで最も表情の変わるエリアです。",
    station: "St Paul's / Bank / Tower Hill",
    walkTime: "3〜4時間",
  },
  {
    slug: "shoreditch",
    category: "riverside",
    eyebrow: "Shoreditch & East End",
    label: "ショーディッチ／イーストエンド",
    blurb:
      "有名な建物を見に行く場所ではありません。ストリートアートとマーケットと古着屋を、歩くこと自体が目的になるエリア。日曜に行くかどうかで価値が変わります。",
    station: "Shoreditch High Street / Old Street / Liverpool Street",
    walkTime: "2〜4時間",
  },
  {
    slug: "greenwich",
    category: "further",
    eyebrow: "Greenwich",
    label: "グリニッジ",
    blurb:
      "本初子午線と海洋史の世界遺産地区。中心部から20〜30分かかる代わりに、着いてしまえば全部が徒歩圏。行き帰りを船にすると移動が観光になります。",
    station: "Cutty Sark (DLR) / Greenwich",
    walkTime: "半日〜1日",
  },
];

export function areaGuidePath(slug: string) {
  return `${AREAS_BASE}/${slug}`;
}

export function getAreaMeta(slug: string) {
  return areaGuides.find((a) => a.slug === slug) ?? null;
}

/** /sightseeing/areas/[slug] が実際に生成するページ。 */
export const areaGuideSlugs = areaGuides.map((a) => a.slug);

export function areaGuidesByCategory(category: AreaCategory) {
  return areaGuides.filter((a) => a.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildAreaGuideMetadata(article: AreaGuideArticle) {
  return buildPageMetadata({
    path: areaGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function areaGuideBreadcrumbJsonLd(article: AreaGuideArticle) {
  const meta = getAreaMeta(article.slug);
  return sightseeingBreadcrumbJsonLd([
    { name: AREAS_SECTION_NAME, path: AREAS_BASE },
    {
      name: meta?.label ?? article.title,
      path: areaGuidePath(article.slug),
    },
  ]);
}

export function areaGuideArticleJsonLd(article: AreaGuideArticle) {
  const url = `${SITE_URL}${areaGuidePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: article.updatedAt,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };
}

/** /sightseeing/areas ハブが持つ記事の一覧を CollectionPage として出す。 */
export function areasHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${AREAS_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    hasPart: areaGuides.map((a) => ({
      "@type": "Article",
      name: a.label,
      description: a.blurb,
      url: `${SITE_URL}${areaGuidePath(a.slug)}`,
    })),
  };
}
