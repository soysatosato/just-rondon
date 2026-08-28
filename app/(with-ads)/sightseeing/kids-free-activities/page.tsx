export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { kidsFreeActivities } from "./data";

export const metadata = buildPageMetadata({
  path: "/sightseeing/kids-free-activities",
  title:
    "子どもと行けるロンドン無料スポット特集 | 家族で楽しむ観光ガイド | ジャスト・ロンドン",
  titleSuffix: false,
  description:
    "ロンドンで子どもと楽しめる無料観光スポットを厳選紹介。自然史博物館、科学博物館、ブリティッシュミュージアム、スカイガーデン、コーラムズ・フィールズ、プレイパーク、動物スポットなど、家族で1日たっぷり遊べる人気の無料スポットをまとめたガイドです。",
  keywords: [
    "ロンドン",
    "無料",
    "子ども",
    "子連れ",
    "ロンドン 観光",
    "家族旅行",
    "ロンドン 無料スポット",
    "ロンドン 子供と行ける場所",
    "ロンドン 親子",
    "キッズ向け",
  ],
});

const article: FeatureArticle = {
  slug: "kids-free-activities",
  title: "子どもと楽しむロンドンの無料スポット",
  engTitle: "Free Days Out with Kids",
  intro: [
    "ロンドンで子連れの出費が抑えられるのは、国立の博物館が全部無料だからです。自然史博物館の恐竜も、サイエンス・ミュージアムの体験展示も、入場料はかかりません。特別展だけが有料です。",
    "交通費も11歳未満は地下鉄・バスとも無料で、大人に付き添われていれば手続きも要りません。入場料と運賃が要らない前提で組むと、1日の出費が食事代だけになる日も作れます。",
  ],
  items: kidsFreeActivities.map((item) => ({
    slug: item.slug,
    title: item.title,
    engTitle: item.engTitle,
    summary: item.summary,
    mainText: item.mainText,
  })),
  related: [
    {
      href: "/sightseeing/free",
      label: "ロンドンの無料観光スポット一覧",
      note: "子ども向けに限らない、入場無料のスポット全部。",
    },
    {
      href: "/sightseeing/itinerary/with-kids",
      label: "子連れのモデルコース",
      note: "移動と昼寝を織り込んだ1日の組み方。",
    },
    {
      href: "/sightseeing/step-free",
      label: "バリアフリーのロンドン",
      note: "ベビーカーで段差なく動くための原則。",
    },
  ],
};

export default function KidsFreeActivitiesPage() {
  return <FeatureLayout article={article} />;
}
