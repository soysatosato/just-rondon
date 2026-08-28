export const revalidate = 60 * 60 * 24;

import FeatureLayout from "@/components/sightseeing/features/FeatureLayout";
import type { FeatureArticle } from "@/components/sightseeing/features/types";
import { buildPageMetadata } from "@/lib/seo";
import { stadiumTours } from "./data";

export const metadata = buildPageMetadata({
  path: "/sightseeing/stadium-tours",
  title:
    "ロンドンのスタジアムツアー完全ガイド | アーセナル・チェルシー・ウェンブリー",
  titleSuffix: false,
  description:
    "エミレーツ・スタンフォードブリッジ・トッテナム・ウェンブリーなど、ロンドンの主要スタジアムツアーを徹底解説。予約方法、所要時間、料金の目安、見どころ、アクセスをまとめた保存版ガイド。",
  keywords: [
    "スタジアムツアー ロンドン",
    "エミレーツスタジアム ツアー",
    "スタンフォードブリッジ ツアー",
    "トッテナム スタジアム ツアー",
    "ウェンブリー スタジアム",
    "アーセナル 観戦",
    "チェルシー 観戦",
    "プレミアリーグ 観戦",
    "ロンドン サッカー",
    "ロンドン 観光",
  ],
});

const article: FeatureArticle = {
  slug: "stadium-tours",
  title: "ロンドンのスタジアムツアー",
  engTitle: "Stadium Tours in London",
  intro: [
    "試合のチケットが取れなくても、スタジアムの中には入れます。スタジアムツアーは、ロッカールーム、ピッチ脇のベンチ、記者会見室、選手が通るトンネルまでを、案内付きで見て回るものです。",
    "所要はどこも1時間から1時間半、料金は£25〜£40あたりが相場です。試合日とその前後は開催されないか短縮版になるので、日程を決める前に公式サイトで実施日を確認してください。",
  ],
  notes: [
    {
      title: "試合そのものを観たい場合",
      description:
        "プレミアリーグには一般販売がほとんどなく、チケットの入手には3ヶ月前からの準備が要ります。転売サイトで買った席では入場できません。下の「あわせて読みたい」から観戦ガイドへ。",
    },
  ],
  items: stadiumTours.map((item) => ({
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    mainText: item.mainText,
    image: item.image,
    website: item.website,
    sections: item.sections,
  })),
  related: [
    {
      href: "/sightseeing/football",
      label: "プレミアリーグ観戦ガイド（全12本）",
      note: "一般販売が無い理由と、会員制度の仕組みから。",
    },
    {
      href: "/sightseeing/football/tickets",
      label: "チケットの取り方のすべて",
      note: "6クラブの取りやすさ比較と、取れなかったときの代替。",
    },
  ],
};

export default function StadiumToursPage() {
  return <FeatureLayout article={article} />;
}
