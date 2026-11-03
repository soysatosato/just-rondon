import "server-only";

import db from "./db";
import type { OpenDaySpot } from "@/lib/sightseeing/open-days";

/**
 * 曜日で探すページ(/sightseeing/open/<曜日>)が使う行。
 *
 * 公開中で、休みの曜日を公式で確かめた行(closedDaysCheckedAt がある行)だけ。
 * 未調査の行は「毎日開いている」と区別できないので出さない。
 */
export async function fetchOpenDaySpots(): Promise<{
  spots: OpenDaySpot[];
  /** 確かめた日の幅。ページに「◯年◯月〜◯月に確認」と出す。 */
  checkedFrom: Date | null;
  checkedTo: Date | null;
  /** 公開中でまだ確かめていない行の数。 */
  uncheckedCount: number;
}> {
  const [rows, uncheckedCount] = await Promise.all([
    db.attraction.findMany({
      where: { isPublished: true, closedDaysCheckedAt: { not: null } },
      select: {
        slug: true,
        name: true,
        category: true,
        closedWeekdays: true,
        closedNote: true,
        openingHours: true,
        mustSee: true,
        recommendLevel: true,
        views: true,
        closedDaysCheckedAt: true,
      },
    }),
    db.attraction.count({
      where: { isPublished: true, closedDaysCheckedAt: null },
    }),
  ]);

  const checkedDates = rows
    .map((r) => r.closedDaysCheckedAt!.getTime())
    .sort((a, b) => a - b);

  return {
    spots: rows.map(({ closedDaysCheckedAt: _checkedAt, ...spot }) => spot),
    checkedFrom: checkedDates.length > 0 ? new Date(checkedDates[0]) : null,
    checkedTo:
      checkedDates.length > 0
        ? new Date(checkedDates[checkedDates.length - 1])
        : null,
    uncheckedCount,
  };
}
