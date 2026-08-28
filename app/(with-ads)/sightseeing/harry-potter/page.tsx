export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { hpActivities } from "./data";

export const metadata = buildPageMetadata({
  path: "/sightseeing/harry-potter",
  title:
    "ハリー・ポッター聖地巡礼 in ロンドン | ロケ地・モデル地・スタジオツアー完全ガイド | ジャスト・ロンドン",
  titleSuffix: false,
  description:
    "ロンドンで巡るハリー・ポッターの聖地特集。キングスクロス駅9¾番線、レドンホール・マーケット、ミレニアム橋、ロンドン動物園、レイコック村など映画ロケ地を徹底紹介。スタジオツアー（WB Studio Tour London）への行き方も掲載。",
  keywords: [
    "ハリー・ポッター",
    "Harry Potter",
    "ハリポタ 聖地巡礼",
    "ロンドン ハリーポッター",
    "ロケ地",
    "スタジオツアー",
    "9¾番線",
    "映画ロケ地",
    "ワーナーブラザーズスタジオツアー",
    "キングスクロス駅",
    "レドンホールマーケット",
  ],
});

/*
 * 項目ごとのリンク先。
 *
 * 舞台『呪いの子』だけは観光スポットではなく上演中の演目なので、
 * /sightseeing ではなくミュージカル側へ送る。それ以外は
 * FeatureLayout が DB を見て、実体があるものだけリンクにする。
 */
const HREFS: Record<string, string> = {
  "harry-potter-cursed-child-play": "/musicals/harry-potter-cursed-child",
};

const article: FeatureArticle = {
  slug: "harry-potter",
  title: "ロンドンで巡るハリー・ポッターの舞台",
  engTitle: "Harry Potter Spots in London",
  intro: [
    "ロンドンのハリー・ポッター関連の場所は、性質が3つに分かれます。撮影に実際に使われたロケ地、作品のために作られた展示施設、そして原作の設定にちなんで後から作られたショップや店です。同じ「聖地」として並べると、行ってみて拍子抜けすることになります。",
    "本気で見たいならスタジオツアーが別格です。ロンドン中心部からは電車とバスで片道1時間ほどかかり、当日券はまず出ません。日付指定の事前予約が要ります。",
    "一方、キングスクロス駅の9¾番線やレドンホール・マーケットは街の中にあり、通りがかりに寄れます。以下、行き方と見学の可否を項目ごとにまとめました。",
  ],
  items: hpActivities.map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    mainText: item.mainText,
    image: item.image,
    website: item.website,
    sections: item.sections,
    href: HREFS[item.slug] ?? null,
  })),
  related: [
    {
      href: "/sightseeing/film-locations",
      label: "映画・ドラマのロケ地巡り",
      note: "シャーロックやブリジャートン家など、他作品のロケ地。",
    },
    {
      href: "/musicals/harry-potter-cursed-child",
      label: "ハリー・ポッターと呪いの子（舞台）",
      note: "あらすじ、上演時間、チケットの取り方。",
    },
  ],
};

export default function HarryPotterPage() {
  return <FeatureLayout article={article} />;
}
