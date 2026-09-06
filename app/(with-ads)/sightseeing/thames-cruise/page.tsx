export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { thamesCruises } from "./data";

export const metadata = buildPageMetadata({
  path: "/sightseeing/thames-cruise",
  title: "テムズ川クルーズ完全ガイド | ロンドン観光を満喫するリバークルーズ",
  description:
    "ロンドン名物のテムズ川クルーズを徹底解説。ビッグ・ベン、ロンドン・アイ、タワーブリッジを眺める観光クルーズから、ナイトクルーズ、ディナークルーズ、アフタヌーンティークルーズまで、料金・ルート・おすすめを紹介します。",
  keywords: [
    "テムズ川クルーズ",
    "ロンドン クルーズ",
    "リバークルーズ",
    "ナイトクルーズ",
    "ディナークルーズ",
    "タワーブリッジ",
    "ロンドンアイ",
    "ビッグベン",
    "ロンドン 観光",
  ],
});

/*
 * 見出しに年号を入れない(royal-london と同じ理由)。クルーズの航路と
 * 船種は年で変わらないので、年号は古びるだけで判断材料にならない。
 *
 * lookupFacts を切っているのは、ここで扱うのが「船のプラン」であって
 * 観光スポットではないため。DB の Attraction には1件も対応が無く、
 * 照合しても空振りするだけになる。本文は各項目にその場で出す。
 */
const article: FeatureArticle = {
  slug: "thames-cruise",
  title: "テムズ川クルーズ",
  engTitle: "River Thames Cruises",
  lookupFacts: false,
  intro: [
    "テムズ川の船は、大きく2種類あります。観光船と、地元の人が通勤に使う高速船です。前者は解説付きでゆっくり進み、後者は速い代わりに案内がありません。値段も乗り方も別物なので、まずどちらに乗るかを決めてください。",
    "移動を兼ねたいなら Uber Boat by Thames Clippers です。タッチ決済やオイスターで乗れて、ウェストミンスターからグリニッジまで座って移動できます。観光として乗るなら、解説付きの周遊クルーズか、食事とセットになった夜のクルーズになります。",
  ],
  items: thamesCruises.map((item) => ({
    slug: item.slug,
    title: item.title,
    engTitle: item.engTitle,
    summary: item.summary,
    mainText: item.mainText,
    image: item.image,
    website: item.website,
    sections: item.sections,
  })),
  related: [
    {
      href: "/sightseeing/transport",
      label: "ロンドンの交通ガイド（全9本）",
      note: "River Bus の運賃と、オイスターで乗れる範囲。",
    },
    {
      href: "/sightseeing/areas/greenwich",
      label: "グリニッジを歩く",
      note: "船で行って歩いて帰る、半日の回遊ルート。",
    },
    {
      href: "/sightseeing/areas/southbank",
      label: "サウスバンクを歩く",
      note: "船着き場が並ぶ南岸の遊歩道。",
    },
    {
      href: "/sightseeing/passes",
      label: "観光パスは元が取れるのか",
      note: "シティクルーズの24時間パスはロンドンパスの対象。損益分岐の計算はこちら。",
    },
  ],
};

export default function ThamesCruisePage() {
  return <FeatureLayout article={article} />;
}
