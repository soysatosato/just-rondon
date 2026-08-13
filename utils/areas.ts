import db from "./db";
import type { AreaSlug } from "@/components/sightseeing/areas/areas";

/**
 * エリアに属するスポットの取得。
 *
 * 記事側にスポット名を直書きせず、必ずここを通すこと。
 * スポットが増減しても記事が古くならないようにするための唯一の入口。
 *
 * 並び順は mustSee → recommendLevel の順。エリアページを開いた読者は
 * 「この辺で外せないのはどれか」を最初に知りたいので、
 * 名前順やDB順ではなく重要度で並べる。
 */

export type AreaSpot = {
  slug: string;
  name: string;
  engName: string | null;
  tagline: string | null;
  image: string;
  category: string;
  mustSee: boolean;
  isFree: boolean;
  priceAdult: string | null;
  durationText: string | null;
  nearestStation: string | null;
};

const SPOT_SELECT = {
  slug: true,
  name: true,
  engName: true,
  tagline: true,
  image: true,
  category: true,
  mustSee: true,
  isFree: true,
  priceAdult: true,
  durationText: true,
  nearestStation: true,
} as const;

export async function getAreaSpots(area: AreaSlug): Promise<AreaSpot[]> {
  return db.attraction.findMany({
    where: { area },
    select: SPOT_SELECT,
    orderBy: [
      { mustSee: "desc" },
      { recommendLevel: "desc" },
      { name: "asc" },
    ],
  });
}

/**
 * 全エリアのスポット件数。ハブのカードに「12スポット」と出すため。
 *
 * 6エリアぶんを個別に数えると6クエリ走るので、1回の groupBy で済ませる。
 */
export async function getAreaSpotCounts(): Promise<Record<string, number>> {
  const rows = await db.attraction.groupBy({
    by: ["area"],
    where: { area: { not: null } },
    _count: true,
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.area) counts[row.area] = row._count;
  }
  return counts;
}

/**
 * 回遊ルートのステップから参照されるスポットをまとめて引く。
 *
 * ステップごとに1件ずつ引くとN+1になるので、記事が使う slug を
 * 一度に渡して Map で返す。DB に無い slug は Map に入らないだけで
 * エラーにしない——ルートには「バラ・マーケット」のように
 * まだ未登録の場所が混ざるため。
 */
export async function getSpotsBySlugs(
  slugs: string[],
): Promise<Map<string, AreaSpot>> {
  if (slugs.length === 0) return new Map();

  const rows = await db.attraction.findMany({
    where: { slug: { in: slugs } },
    select: SPOT_SELECT,
  });

  return new Map(rows.map((r) => [r.slug, r]));
}
