import type { Content } from "@prisma/client";

import type { RankingEntry } from "@/components/rankings/ContentRankingTabs";

/**
 * Content の行を、ランキング棚(ContentRankingTabs)が受け取る形に落とす。
 *
 * 棚はクライアントコンポーネントなので、Date や本文まるごとを渡さず
 * 表示に要るものだけを詰める。日付をここで文字列にしておくのは、
 * サーバーとクライアントで別々に整形すると表記が食い違うため。
 *
 * セクションごとに拾う項目が違う:
 *   コラム         連載名を badge に。連載の途中回が単発に見えないように。
 *   イギリス英語   英単語そのもの(engTitle)を eyebrow に。見出しの主役はこちら。
 *   いまのイギリス どちらも持たないので日付と要約だけ。
 */

const BASE = {
  column: "/column",
  "british-english": "/british-english",
  "modern-britain": "/modern-britain",
} as const;

export type ReadingCategory = keyof typeof BASE;

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function toRankingEntries(
  category: ReadingCategory,
  items: Content[],
): RankingEntry[] {
  return items.map((item) => ({
    key: item.id,
    href: `${BASE[category]}/${item.slug}`,
    title: item.title,
    eyebrow: category === "british-english" ? item.engTitle : null,
    summary: item.summary,
    image: item.image,
    date: dateFormatter.format(item.createdAt),
    badge: category === "column" ? item.seriesName : null,
  }));
}
