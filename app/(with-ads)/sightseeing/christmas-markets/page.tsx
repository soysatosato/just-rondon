export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { christmasMarkets } from "./data";

export const metadata = buildPageMetadata({
  path: "/sightseeing/christmas-markets",
  title:
    "ロンドンのクリスマスマーケット特集 | おすすめスポット・開催情報まとめ | ジャスト・ロンドン",
  titleSuffix: false,
  description:
    "ロンドンのクリスマスマーケットを厳選紹介。サウスバンク、ウィンターワンダーランド、ロンドンブリッジなど、各マーケットの開催期間、見どころ、アクセス、おすすめポイントをわかりやすく紹介します。",
  keywords: [
    "ロンドン",
    "クリスマスマーケット",
    "London Christmas Market",
    "ロンドン クリスマス",
    "クリスマスイベント",
    "ヨーロッパ クリスマス",
    "ロンドン旅行",
  ],
});

/**
 * カードに出す1行(会期・住所)。
 *
 * 会期はデータ側では末尾に「（正確な日程は公式サイトで確認）」が付いている。
 * 10枚のカードすべてに同じ注記が並ぶと肝心の日付が埋もれるので、
 * カードでは日付だけを出し、注記は導入で1度だけ言う。
 *
 * 住所は [表記](地図URL) の markdown で入っている。カード全体が詳細ページへの
 * リンクなので、ここに地図リンクを出すと <a> の入れ子になる。表記だけを
 * 取り出して素のテキストにし、地図へは詳細ページから飛ばす。
 */
function factsOf(sections: { title: string; description: string }[]) {
  const find = (keyword: string) =>
    sections.find((s) => s.title.includes(keyword))?.description ?? null;

  const period = find("期間")?.split("（")[0].trim() ?? null;
  const place = find("場所")?.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim() ?? null;

  return [period, place].filter(Boolean).join("・") || null;
}

/*
 * 見出しに年号を入れない。毎年書き換える運用が続かず、2026年になっても
 * 「2025」と出ていた。会期は各マーケットの「期間」節が例年の時期＋
 * 公式確認の形で持つ。
 */
const article: FeatureArticle = {
  slug: "christmas-markets",
  title: "ロンドンのクリスマスマーケット",
  engTitle: "Christmas Markets in London",
  // 各マーケットは専用の詳細ページを持つので、DB のスポットは見ない。
  lookupFacts: false,
  intro: [
    "ロンドンのクリスマスマーケットは、11月上旬から中旬に始まり、1月上旬まで続くものが多数です。ただし12月25日で終わるものもあり、閉幕日は場所によってばらつきます。以下の会期は例年の目安なので、出かける前に公式サイトで今年の日程を確認してください。",
    "性格も一様ではありません。ハイド・パークのウィンター・ワンダーランドは入場券制の大規模イベントで、遊具もアイススケートもあります。一方サウスバンクやレスター・スクエアは通りに屋台が並ぶ形式で、入場は無料です。どちらを指して「クリスマスマーケット」と言うかで、予算も所要時間も変わります。",
  ],
  items: christmasMarkets.map((item) => ({
    slug: item.slug,
    title: item.title,
    engTitle: item.engTitle,
    summary: item.summary,
    image: item.image,
    href: `/sightseeing/christmas-markets/${item.slug}`,
    factsText: factsOf(item.sections),
  })),
  related: [
    {
      href: "/events/calendar",
      label: "ロンドンの年間イベントカレンダー",
      note: "冬以外の催しも月ごとに。",
    },
    {
      href: "/sightseeing/free",
      label: "ロンドンの無料観光スポット一覧",
      note: "入場無料で回れる場所。",
    },
    {
      href: "/shopping",
      label: "ロンドンの買い物ガイド",
      note: "日曜取引法と、市が立つ曜日の話。",
    },
  ],
};

export default function ChristmasMarketsPage() {
  return <FeatureLayout article={article} />;
}
