import { unstable_cache } from "next/cache";

import db from "./db";
import type { RailItem } from "./actions/home";

/**
 * /sightseeing ハブが使うデータ。このファイルはハブ専用で、他からは読まない。
 *
 * 旧実装は「静的なハードコード + 日替わりランダム」の混成だった。
 * 問題が3つあった。
 *
 * 1. モジュール変数(cachedPool / cachedDay)にプールを溜めていた。
 *    サーバーレスではインスタンスごとに別の日付が入り、同じ時刻に
 *    別の内容が返る。ISR のキャッシュとも二重になる。
 * 2. select を書かず take:100 で行を丸ごと引いていた。ハブは写真と
 *    名前しか使わないのに、markdown 本文まで毎回読んでいた。
 * 3. 「ランダムに1件拾って静的な4件の末尾に足す」形だったので、
 *    同じスポットが必見・王室・無料の3つの棚に同時に出ることがあった。
 *
 * ここではトップページの fetchHomeRails と同じ形に揃える——細い select、
 * unstable_cache で1日1回、返すのは表示に必要な形だけ。
 */

/** 棚1枚ぶんの列。本文(stories)には一切触れない。 */
const RAIL_SELECT = {
  slug: true,
  name: true,
  engName: true,
  image: true,
  tagline: true,
} as const;

/** 棚に並べる最大枚数。PhotoRail は横スクロールなので多めでよい。 */
const RAIL_SIZE = 12;

type RailRow = {
  slug: string;
  name: string;
  engName: string | null;
  image: string;
  tagline: string | null;
};

/**
 * 画像の無い行は棚に混ぜない。写真の列に文字だけのカードが1枚挟まると、
 * その1枚のせいで列全体が崩れて見える(トップの toItems と同じ判断)。
 */
function toRailItems(rows: RailRow[]): RailItem[] {
  return rows
    .filter((row) => Boolean(row.image))
    .map((row) => ({
      slug: row.slug,
      href: `/sightseeing/${row.slug}`,
      name: row.name,
      engName: row.engName,
      image: row.image,
      blurb: row.tagline,
    }));
}

export type AreaSummary = {
  /** 公開中のスポット件数。エリアカードに出す。 */
  count: number;
  /** 表紙写真。そのエリアで最も推している1件の画像を借りる。 */
  image: string | null;
};

/**
 * ハブが必要とするものを1回のキャッシュにまとめて取る。
 *
 * 棚ごとに別々の unstable_cache にすると、再検証のタイミングがずれて
 * 「必見の棚だけ古い」状態が起きる。ハブは全体で1つの面なので
 * キャッシュも1つにする。
 */
export const fetchSightseeingHub = unstable_cache(
  async () => {
    const [mustSeeRows, freeRows, kidsRows, areaRows, totalSpots] =
      await Promise.all([
        db.attraction.findMany({
          // mustSee と★5は重なるが完全には一致しない。ハブの先頭は
          // 「初めてでも外さないもの」なので両方を拾う。
          where: {
            isPublished: true,
            OR: [{ mustSee: true }, { recommendLevel: 5 }],
          },
          select: RAIL_SELECT,
          orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
          take: RAIL_SIZE,
        }),
        db.attraction.findMany({
          where: { isPublished: true, isFree: true },
          select: RAIL_SELECT,
          orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
          // 上の棚と重なった分を後で落とすので、母集団は広めに取る。
          take: RAIL_SIZE * 4,
        }),
        db.attraction.findMany({
          where: { isPublished: true, isForKids: true },
          select: RAIL_SELECT,
          orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
          take: RAIL_SIZE * 4,
        }),
        db.attraction.findMany({
          where: { isPublished: true, area: { not: null } },
          select: { area: true, image: true },
          orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
        }),
        db.attraction.count({ where: { isPublished: true } }),
      ]);

    /*
     * 大英博物館は必見でも無料でも子ども向けでもある。同じ写真が複数の棚に
     * 並ぶと「棚を分けた意味が無い」と見えるので、上の棚に出したものを
     * 下の棚から順に消し込む。結果として、無料の棚には必見に載らなかった
     * ものが、子どもの棚には無料にも載らなかったものが上がってくる——
     * 棚としてはそのほうが働く。
     *
     * 画像の判定を slice の前に置いているのは、写真の無い行を「出した」と
     * 数えてしまうと、実際には描画されないのに下の棚から消えるため。
     */
    const shown = new Set<string>();
    const nextRail = (rows: RailRow[]): RailItem[] => {
      const picked = rows
        .filter((row) => Boolean(row.image) && !shown.has(row.slug))
        .slice(0, RAIL_SIZE);
      for (const row of picked) shown.add(row.slug);
      return toRailItems(picked);
    };

    /*
     * エリアの件数と表紙を1回の走査で作る。areaRows は推薦順に並んでいるので、
     * そのエリアで最初に現れた行がいちばん推しているスポットになる。
     */
    const areas: Record<string, AreaSummary> = {};
    for (const row of areaRows) {
      if (!row.area) continue;
      const entry = (areas[row.area] ??= { count: 0, image: null });
      entry.count += 1;
      if (!entry.image && row.image) entry.image = row.image;
    }

    return {
      rails: {
        // 評価順がそのまま消し込みの順になる。並べ替えないこと。
        mustSee: nextRail(mustSeeRows),
        free: nextRail(freeRows),
        kids: nextRail(kidsRows),
      },
      areas,
      totalSpots,
    };
  },
  ["sightseeing-hub"],
  { revalidate: 60 * 60 * 24 },
);
