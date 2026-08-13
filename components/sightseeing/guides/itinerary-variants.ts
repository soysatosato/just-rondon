import { SITE_URL } from "@/lib/seo";
import { SIGHTSEEING_PUBLISHER } from "../jsonld";
import { travelGuidePath } from "./guides";

/**
 * モデルコースの分岐版。
 *
 * /sightseeing/itinerary は 1〜5日の王道ルートで、これが本体。
 * ここに並ぶ3本は「本体をそのまま実行できない読者」向けの派生で、
 * 親ページのカードから降りてくる。
 *
 * transport と違って親を索引ページにしていないのは、
 * itinerary 本体そのものが検索の主力(「ロンドン モデルコース」)だから。
 * 中身を子に移すと親が空洞になる。
 *
 * next-sitemap.config.js の staticPages と、
 * /sightseeing/itinerary 本文のカード表示順をこのリストと一致させること。
 */
export const ITINERARY_BASE = "itinerary";

export type ItineraryVariantMeta = {
  /** 親からの相対 slug。URL は /sightseeing/itinerary/<slug>。 */
  slug: string;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

export const itineraryVariants: ItineraryVariantMeta[] = [
  {
    slug: "rainy-day",
    eyebrow: "Rainy Day",
    label: "雨の日のロンドン",
    blurb:
      "ロンドンの雨はほとんど傘をさすほど降りません。濡れずに1日を組み立てる屋内ルートと、地下道・アーケードでつなぐ歩き方。中止になりやすい屋外の見どころの見極めも。",
  },
  {
    slug: "with-kids",
    eyebrow: "With Kids",
    label: "子連れのロンドン",
    blurb:
      "1日2ヶ所まで。恐竜と体験展示を軸に、ベビーカーで乗れる路線とオムツ替えの場所まで含めて組んだ年齢別のプラン。11歳以下は地下鉄が無料です。",
  },
  {
    slug: "layover",
    eyebrow: "Layover",
    label: "乗り継ぎ半日ロンドン",
    blurb:
      "まず市内に出るべきか出ないべきかを判断してから。ヒースロー・ガトウィックそれぞれの往復時間、荷物の預け先、入国審査とETAの扱いを踏まえた持ち時間別のルート。",
  },
];

export function itineraryVariantPath(slug: string) {
  return travelGuidePath(`${ITINERARY_BASE}/${slug}`);
}

export function getItineraryVariantMeta(slug: string) {
  return itineraryVariants.find((v) => v.slug === slug) ?? null;
}

/** /sightseeing/itinerary/[slug] が実際に生成するページ。 */
export const itineraryVariantSlugs = itineraryVariants.map((v) => v.slug);

/**
 * 親記事が持つ分岐版の一覧を ItemList として出す。
 *
 * 親は既に itineraryItemListJsonLd() で Day セクションの ItemList を
 * 出しているので、@id を #variants で分けて別物として扱う。
 */
export function itineraryVariantsItemListJsonLd() {
  const url = `${SITE_URL}${travelGuidePath(ITINERARY_BASE)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#variants`,
    name: "ロンドン モデルコースの分岐版",
    numberOfItems: itineraryVariants.length,
    itemListElement: itineraryVariants.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: v.label,
      url: `${SITE_URL}${itineraryVariantPath(v.slug)}`,
    })),
  };
}

/** 子ページの publisher/author は親と揃える。 */
export { SIGHTSEEING_PUBLISHER };
