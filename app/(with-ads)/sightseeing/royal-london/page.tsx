export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { royalActivities } from "./data";

export const metadata = buildPageMetadata({
  path: "/sightseeing/royal-london",
  title:
    "ロンドン王室スポットガイド | バッキンガム宮殿・ロンドン塔・ケンジントン宮殿",
  description:
    "イギリス王室ゆかりのロンドン観光スポットを厳選紹介。バッキンガム宮殿のステート・アパートメント公開や衛兵交代式、王冠宝器のあるロンドン塔、ダイアナ元妃が暮らしたケンジントン宮殿まで、めぐり方を解説します。",
  keywords: [
    "ロンドン 王室",
    "バッキンガム宮殿",
    "衛兵交代式",
    "ロンドン塔",
    "ケンジントン宮殿",
    "王冠宝器",
    "イギリス王室 観光",
    "ロンドン 観光",
  ],
});

/*
 * 見出しに年号を入れない。毎年書き換える運用が続かず、2026年になっても
 * 「2025年版」と出ていた。ここで扱うのは宮殿と王室ゆかりの場所という
 * 年で変わらない対象なので、年号があっても読者の判断材料にならない。
 * 会期が動くもの(夏季公開)は本文側で「例年」と書く。
 */
const article: FeatureArticle = {
  slug: "royal-london",
  title: "ロンドンの王室スポット",
  engTitle: "Royal London",
  intro: [
    "イギリス王室ゆかりの場所は、ロンドンの中心部に固まっています。バッキンガム宮殿、セント・ジェームズ宮殿、ウェストミンスター寺院は徒歩圏で、王冠宝器のあるロンドン塔だけが少し東に離れています。",
    "見学できるかどうかは季節で変わります。バッキンガム宮殿のステート・アパートメント（公式諸間）が一般公開されるのは例年夏のあいだだけで、それ以外の時期は外観と衛兵交代式を見ることになります。訪問前に公式サイトで会期を確認してください。",
  ],
  items: royalActivities.map((item) => ({
    slug: item.slug,
    title: item.title,
    engTitle: item.engTitle,
    summary: item.summary,
    mainText: item.mainText,
    image: item.image,
  })),
  related: [
    {
      href: "/sightseeing/areas/westminster",
      label: "ウェストミンスター／セント・ジェームズを歩く",
      note: "王室スポットが集まる街区を半日で回るルート。",
    },
    {
      href: "/sightseeing/must-see",
      label: "見逃せないロンドン観光名所",
      note: "王室以外も含めた定番。",
    },
    {
      href: "/sightseeing/itinerary",
      label: "ロンドン モデルコース（1〜5日）",
      note: "衛兵交代式の時刻から逆算した1日の組み方。",
    },
  ],
};

export default function RoyalLondonPage() {
  return <FeatureLayout article={article} />;
}
