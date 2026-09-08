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

/** セクション名。混成の一覧で「どこの記事か」を出すために使う。 */
const SECTION_LABEL: Record<ReadingCategory, string> = {
  column: "コラム",
  "british-english": "イギリス英語",
  "modern-britain": "英国のいま",
};

function isReadingCategory(value: string): value is ReadingCategory {
  return value in BASE;
}

/**
 * カテゴリを跨いだ一覧(/reading の棚)用。
 *
 * toRankingEntries と違い、カテゴリは呼び出し側が指定せず1件ずつの
 * category から引く。badge にセクション名、tone にセクション名の色を
 * 入れるので、棚は行ごとに色を変えて並べられる。連載名を badge に
 * 譲らないのは、混成の一覧では「どのセクションか」のほうが先に要る情報で、
 * チップを2つ並べると順位の行が持たないため。
 *
 * category が3セクション以外の行は落とす。DB から読み物以外の Content が
 * 紛れても、リンク先の無いカードが出ないようにする。
 */
export function toReadingRankingEntries(items: Content[]): RankingEntry[] {
  return items.flatMap((item) => {
    if (!isReadingCategory(item.category)) return [];
    return [
      {
        ...toRankingEntries(item.category, [item])[0],
        badge: SECTION_LABEL[item.category],
        tone: item.category,
      },
    ];
  });
}
