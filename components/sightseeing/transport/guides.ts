import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import {
  SIGHTSEEING_BASE,
  SIGHTSEEING_PUBLISHER,
  sightseeingBreadcrumbJsonLd,
} from "../jsonld";
import type { TransportGuideArticle } from "./types";

export { SITE_URL };

export const TRANSPORT_BASE = `${SIGHTSEEING_BASE}/transport`;
export const TRANSPORT_SECTION_NAME = "交通ガイド";

/**
 * ハブでの分類。
 *
 * 「運賃の仕組みと空港 → 乗り物ごとの使い方 → 住む人向け」の3段。
 * 旅行者は上2段で完結し、生活者だけが3段目に降りてくる。
 * この3つ以外は増やさないこと。増やすなら、それは別セクションを
 * 立てるべきというサイン。
 */
export type TransportCategory = "basics" | "modes" | "living";

export const TRANSPORT_CATEGORY_LABELS: Record<TransportCategory, string> = {
  basics: "運賃の仕組みと、空港からの移動",
  modes: "乗り物ごとの使い方",
  living: "ロンドンで暮らす人のための交通",
};

export const TRANSPORT_CATEGORY_BLURBS: Record<TransportCategory, string> = {
  basics:
    "最初に読む2本。ここだけで、いくらかかるかと、空港から宿までの行き方が決まります。",
  modes:
    "実際に乗るときの手順。同じ区間でも、選ぶ乗り物で料金も所要時間も変わります。",
  living:
    "数日ではなく数年ロンドンにいる人向け。定期券の損得、自分の自転車、そして車とバイク。",
};

export const TRANSPORT_CATEGORY_ORDER: TransportCategory[] = [
  "basics",
  "modes",
  "living",
];

export type TransportGuideMeta = {
  slug: string;
  category: TransportCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 交通ガイドの並び。
 *
 * 先頭が運賃なのは、ロンドンの交通で日本人がいちばん最初に困るのが
 * 「切符を買うべきかどうか」だから。答えは「買わなくていい」で、
 * それを知らないと券売機の列に並ぶところから旅が始まる。
 *
 * next-sitemap.config.js の staticPages と、/sightseeing/transport ハブの
 * カード表示順をこのリストと一致させること。
 */
export const transportGuides: TransportGuideMeta[] = [
  {
    slug: "fares",
    category: "basics",
    eyebrow: "Fares & Payment",
    label: "運賃と支払い方法のすべて",
    blurb:
      "切符は買いません。日本のクレジットカードを改札にかざすだけです。ゾーン制、1日・週の上限額、Oyster との使い分け、そして JCB が使えない問題まで。",
  },
  {
    slug: "airports",
    category: "basics",
    eyebrow: "Airports",
    label: "5空港から市内へのアクセス",
    blurb:
      "ヒースロー・ガトウィック・スタンステッド・ルートン・シティ。所要時間と料金を並べたうえで、荷物の量と到着時刻から選び方を決めます。深夜着の対処法も。",
  },
  {
    slug: "national-rail",
    category: "basics",
    eyebrow: "National Rail",
    label: "英国の鉄道切符の買い方",
    blurb:
      "ロンドンの外に出ると、タッチ決済の世界が終わります。Advance・Off-Peak・Anytime の違いと、同じ区間で3〜4倍の差がつく理由。Oyster が使える境界も。",
  },
  {
    slug: "tube",
    category: "modes",
    eyebrow: "Tube & Rail",
    label: "地下鉄とロンドンの鉄道",
    blurb:
      "チューブ、エリザベス・ライン、オーバーグラウンド、DLR、ナショナル・レール。同じ改札・同じ運賃で走る5種類の鉄道の違いと、乗るときの実務。",
  },
  {
    slug: "bus",
    category: "modes",
    eyebrow: "Buses",
    label: "バスとトラム",
    blurb:
      "どこまで乗っても均一運賃。降車時のタッチは不要。60分以内の乗り継ぎは無料。観光にも通勤にも効く乗り物ですが、2026年11月1日に値上げされます。",
  },
  {
    slug: "cycling",
    category: "modes",
    eyebrow: "Cycle Hire",
    label: "シェアサイクルと電動キックボード",
    blurb:
      "Santander Cycles、Lime、Forest の料金体系はまったく違います。安く済ませる組み合わせと、私有の電動キックボードが違法である理由。",
  },
  {
    slug: "taxi",
    category: "modes",
    eyebrow: "Taxi & Ride-hailing",
    label: "タクシーと配車アプリ",
    blurb:
      "ブラックキャブ、Uber、Bolt、FreeNow。同じ区間で3〜4割違うことがあります。乗ってはいけない車の見分け方と、深夜・空港での使い分け。",
  },
  {
    slug: "travelcard",
    category: "living",
    eyebrow: "Season Tickets",
    label: "定期券とRailcardの損得",
    blurb:
      "週の上限額があるので、7 Day Travelcard を買う意味はありません。効くのは年間定期とRailcardです。Oyster にRailcardを紐付ける方法まで。",
  },
  {
    slug: "own-bike",
    category: "living",
    eyebrow: "Buying a Bike",
    label: "自分の自転車を買って通勤する",
    blurb:
      "Cycle to Work で実質3〜4割引き。ただしロンドンでは年に約4万台が盗まれます。買う場所、鍵の選び方、駐輪場所、保険までの一式。",
  },
  {
    slug: "car",
    category: "living",
    eyebrow: "Car & Motorbike",
    label: "車・バイクを買う（と、その前に）",
    blurb:
      "日本の免許は12ヶ月で失効し、5年以内なら試験なしで英国免許に交換できます。Congestion Charge は2026年1月に£18へ。バイクは今も無料です。",
  },
];

export function transportGuidePath(slug: string) {
  return `${TRANSPORT_BASE}/${slug}`;
}

export function getTransportGuideMeta(slug: string) {
  return transportGuides.find((g) => g.slug === slug) ?? null;
}

/** /sightseeing/transport/[slug] が実際に生成するページ。 */
export const transportGuideSlugs = transportGuides.map((g) => g.slug);

export function transportGuidesByCategory(category: TransportCategory) {
  return transportGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildTransportGuideMetadata(article: TransportGuideArticle) {
  return buildPageMetadata({
    path: transportGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function transportGuideBreadcrumbJsonLd(article: TransportGuideArticle) {
  const meta = getTransportGuideMeta(article.slug);
  return sightseeingBreadcrumbJsonLd([
    { name: TRANSPORT_SECTION_NAME, path: TRANSPORT_BASE },
    {
      name: meta?.label ?? article.title,
      path: transportGuidePath(article.slug),
    },
  ]);
}

export function transportGuideArticleJsonLd(article: TransportGuideArticle) {
  const url = `${SITE_URL}${transportGuidePath(article.slug)}`;

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

/** /sightseeing/transport ハブが持つ記事の一覧を CollectionPage として出す。 */
export function transportHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${TRANSPORT_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    hasPart: transportGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${transportGuidePath(g.slug)}`,
    })),
  };
}
