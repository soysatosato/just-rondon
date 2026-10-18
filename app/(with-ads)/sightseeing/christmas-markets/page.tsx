export const revalidate = 60 * 60 * 24;

import type { Metadata } from "next";
import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import MarketTable from "./MarketTable";
import ChristmasSeriesNav from "@/components/christmas/ChristmasSeriesNav";
import {
  christmasMarkets,
  seasonDescription,
  tableRange,
} from "@/lib/christmas/markets";
import { seasonYear } from "@/lib/christmas/season";

/*
 * 見出しと本文には年号を入れない。年が出るのは、lib/christmas/markets.ts の editions から
 * 組み立てる会期の欄と比較表だけ。どの年のシーズンを出すかは今日の日付で
 * 決まる(1月は前の年のシーズン)ので、年が替わっても書き換えは要らない。
 */

export async function generateMetadata(): Promise<Metadata> {
  const year = seasonYear(londonDate(new Date()));
  return buildPageMetadata({
    path: "/sightseeing/christmas-markets",
    title: `ロンドンのクリスマスマーケット${christmasMarkets.length}か所を比較｜${year}年の会期・12月25日の営業・行き方`,
    description: `ロンドンのクリスマスマーケット${christmasMarkets.length}か所を1ページで比較。${year}年の会期(公式発表を確かめたもの)、12月25日の営業、入場料、最寄り駅と、屋台村・スケートリンク・屋根付きの市場といったそれぞれの性格をまとめました。`,
    keywords: [
      "ロンドン クリスマスマーケット",
      `ロンドン クリスマスマーケット ${year}`,
      "ロンドン クリスマスマーケット 期間",
      "ロンドン クリスマス 12月25日",
      "サウスバンク クリスマスマーケット",
      "コヴェントガーデン クリスマス",
      "London Christmas Market",
    ],
  });
}

export default function ChristmasMarketsPage() {
  const year = seasonYear(londonDate(new Date()));

  const article: FeatureArticle = {
    slug: "christmas-markets",
    title: "ロンドンのクリスマスマーケット",
    engTitle: "Christmas Markets in London",
    // 各マーケットの本文はこのページにある。DB のスポットは見ない。
    lookupFacts: false,
    intro: [
      "ロンドンのクリスマスマーケットは、11月上旬から中旬に始まり、1月上旬まで続くものが多い。ただし12月下旬で終わるものもあり、閉幕日は場所によってばらつく。12月25日は休む所が多い。",
      "性格も一様ではない。ハイド・パークのウィンター・ワンダーランドは入場予約制の大規模イベントで、遊具もアイスリンクもある。サウスバンクやキングストンは木の小屋の屋台が並ぶ昔ながらの形で、入場は無料。コヴェント・ガーデンのように屋台を出さず、街の飾り付けそのものが見どころの場所もある。どれを指して「クリスマスマーケット」と言うかで、予算も所要時間も変わる。",
    ],
    notes: [
      {
        title: "12月25日の移動",
        description:
          "クリスマス当日は、ロンドンの地下鉄・鉄道・バスが基本的に運休し、マーケットの多くも休む。24日は早じまいの所が多い。",
      },
      {
        title: "1晩で回るなら",
        description:
          "コヴェント・ガーデン、レスター・スクエア、トラファルガー広場は互いに歩いて10分ほどで、1晩で回れる。サウスバンクはトラファルガー広場から歩行者橋を渡って15分ほど。ウィンター・バイ・ザ・リバー、バタシー、キングストンは離れているので、別の日にするとよい。",
      },
      {
        title: "雨の日",
        description:
          "屋根の下で回れるのは、市場ホールの中にあるスピタルフィールズと、ショッピングモールのあるバタシー発電所。",
      },
    ],
    items: christmasMarkets.map((m) => {
      const facts = [tableRange(m, year), m.station].join("・");

      // 本体が観光スポットのページにあるもの。カードにしてそちらへ送る。
      if (m.spotSlug) {
        return {
          slug: m.slug,
          title: m.title,
          engTitle: m.engTitle,
          summary: m.summary,
          href: `/sightseeing/${m.spotSlug}`,
          factsText: facts,
        };
      }

      return {
        slug: m.slug,
        title: m.title,
        engTitle: m.engTitle,
        summary: m.summary,
        mainText: m.body.join("\n\n"),
        website: m.website,
        factsText: facts,
        sections: [
          { title: `${year}年の会期`, description: seasonDescription(m, year) },
          { title: "場所と行き方", description: m.access },
          { title: "訪問のコツ", description: m.tip },
          ...(m.nearby ? [{ title: "近くで", description: m.nearby }] : []),
        ],
      };
    }),
    related: [
      {
        href: "/events/christmas",
        label: "ロンドンのクリスマス特集",
        note: "滞在日を入れると、その日程で開いているマーケットと灯りが分かる。",
      },
      {
        href: "/sightseeing/christmas-lights",
        label: "ロンドンのイルミネーション",
        note: "通りごとの点灯日と、日の入りから歩く順路。",
      },
      {
        href: "/events/november",
        label: "11月のロンドン",
        note: "天気・服装と、マーケットが始まる月の催し。",
      },
      {
        href: "/events/december",
        label: "12月のロンドン",
        note: "日の短さ、祝日の交通、年末の催し。",
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

  return (
    <FeatureLayout article={article}>
      <ChristmasSeriesNav current="markets" className="mt-8" />
      <MarketTable markets={christmasMarkets} year={year} />
    </FeatureLayout>
  );
}
