export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { fetchMustSeeAttractions } from "@/utils/actions/attractions";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: "/sightseeing/must-see",
  title:
    "絶対に外せないロンドン観光スポット特集 | 初めての旅行におすすめ名所ガイド | ジャスト・ロンドン",
  titleSuffix: false,
  description:
    "ロンドン観光の定番スポットを厳選して紹介。ビッグ・ベン、タワーブリッジ、バッキンガム宮殿、ロンドン塔、ウェストミンスター寺院、自然史博物館など、初めてのロンドン旅行で絶対に外せない見どころをまとめた完全ガイド。",
  keywords: [
    "ロンドン",
    "ロンドン観光",
    "ロンドン 観光スポット",
    "ロンドン 観光名所",
    "ロンドン旅行",
    "おすすめ",
    "定番スポット",
    "ロンドン観光地",
    "王道ルート",
  ],
});

export default async function MustSeePage() {
  const attractions = await fetchMustSeeAttractions();

  /*
   * 一覧の行はもう DB から料金・所要時間・最寄駅ごと引けているので、
   * FeatureLayout 側の slug 照合(lookupFacts)は切って、ここで組んだ
   * 1行をそのまま渡す。同じことを二度問い合わせない。
   */
  const article: FeatureArticle = {
    slug: "must-see",
    title: "見逃せないロンドンの観光名所",
    engTitle: "Must-See London",
    lookupFacts: false,
    intro: [
      `初めてのロンドンで外さない${attractions.length}件です。どれも街の中心部にあり、地下鉄で結べば数日で回れます。`,
      "ただし詰め込みは効きません。ロンドン塔は所要3時間〜、ウェストミンスター寺院は2〜3時間。大きいものを1日に2つ入れると、その日は他が入りません。1日あたり大きいもの1つと小さいもの2つ、くらいが現実的な上限です。",
      "多くは日時指定の事前予約制で、当日窓口に並ぶと入れないことがあります。料金と所要時間を下に添えたので、行く順番を決める材料にしてください。",
    ],
    items: attractions.map((spot) => ({
      slug: spot.slug,
      title: spot.name,
      engTitle: spot.engName,
      summary: spot.tagline ?? spot.summary,
      image: spot.image,
      href: `/sightseeing/${spot.slug}`,
      factsText:
        [
          spot.priceAdult ? `料金 ${spot.priceAdult}` : null,
          spot.durationText ? `所要 ${spot.durationText}` : null,
          spot.nearestStation,
        ]
          .filter(Boolean)
          .join("・") || null,
    })),
    related: [
      {
        href: "/sightseeing/itinerary",
        label: "ロンドン モデルコース（1〜5日）",
        note: "この名所をどの順に、何日で回るか。",
      },
      {
        href: "/sightseeing/areas",
        label: "エリア別ガイド（6街区）",
        note: "近いものをまとめて歩く、半日の回遊ルート。",
      },
      {
        href: "/sightseeing/all",
        label: "ロンドンの観光スポット一覧",
        note: "定番以外も含めた全件。",
      },
    ],
  };

  return <FeatureLayout article={article} />;
}
