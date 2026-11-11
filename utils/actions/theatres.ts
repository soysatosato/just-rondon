import "server-only";

import db from "../db";
import { londonDate } from "@/lib/publish-schedule";
import { hasClosed, onShowNow } from "@/lib/musicals/runs";

/**
 * 劇場ハブに出す一覧。
 *
 * 上演中の作品を持つ劇場が先に来る。劇場そのものを探している読者は
 * 少数で、多くは「今なにをやっている劇場か」で見分けるため。
 * 作品が入っていない劇場も落とさない——次の作品が入るまでの期間も
 * 劇場の情報(座席・アクセス)は有効で、検索需要も消えない。
 */
export const fetchAllTheatres = async () => {
  const today = londonDate(new Date());
  const rows = await db.theatre.findMany({
    orderBy: { name: "asc" },
    include: {
      musicals: {
        where: { isOnShow: true },
        orderBy: { recommendLevel: "desc" },
        select: {
          slug: true,
          name: true,
          engName: true,
          image: true,
          mustSee: true,
          recommendLevel: true,
        },
      },
    },
  });
  // DB の isOnShow が true でも、千秋楽を過ぎた作品は外す(lib/musicals/runs.ts)。
  const theatres = rows.map((theatre) => ({
    ...theatre,
    musicals: theatre.musicals.filter((m) => !hasClosed(m.slug, today)),
  }));

  return [...theatres].sort((a, b) => {
    // 上演中を持つ劇場を先に、その中は作品の推薦度が高い順。
    const aHas = a.musicals.length > 0;
    const bHas = b.musicals.length > 0;
    if (aHas !== bHas) return aHas ? -1 : 1;

    const aTop = a.musicals[0]?.recommendLevel ?? -1;
    const bTop = b.musicals[0]?.recommendLevel ?? -1;
    if (aTop !== bTop) return bTop - aTop;

    return a.name.localeCompare(b.name, "en");
  });
};

export const fetchTheatreDetails = async (slug: string) => {
  const theatre = await db.theatre.findUnique({
    where: { slug },
    include: {
      musicals: {
        orderBy: [{ isOnShow: "desc" }, { recommendLevel: "desc" }],
        select: {
          slug: true,
          name: true,
          engName: true,
          image: true,
          summary: true,
          tagline: true,
          mustSee: true,
          recommendLevel: true,
          isOnShow: true,
          website: true,
          runtimeMinutes: true,
          intervalMinutes: true,
          minAgeGuidance: true,
          englishForm: true,
          englishNote: true,
          factsVerifiedAt: true,
        },
      },
    },
  });
  if (!theatre) return null;

  // 千秋楽を過ぎた作品は「過去の上演作品」側へ回す。並びは DB と同じく
  // 上演中が先(sort は安定なので、推薦度の順はそのまま残る)。
  const today = londonDate(new Date());
  const musicals = theatre.musicals
    .map((m) => ({ ...m, isOnShow: onShowNow(m.slug, m.isOnShow, today) }))
    .sort((a, b) => Number(b.isOnShow) - Number(a.isOnShow));
  return { ...theatre, musicals };
};

/** generateStaticParams / サイトマップ用。 */
export const fetchTheatreSlugs = async () => {
  return db.theatre.findMany({
    select: { slug: true },
    orderBy: { slug: "asc" },
  });
};

/**
 * 劇場ページに出す直近の公演。
 *
 * 作品ページ(fetchMusicalPerformances)と違い、その劇場で上演中の
 * 全作品を横断して混ぜる。1劇場1作品が通常だが、入れ替え期には
 * 2作品が並ぶことがあり、そのとき日付順に混ざっているほうが
 * 「この劇場にいつ行けるか」に素直に答える。
 */
export const fetchTheatrePerformances = async (
  theatreId: string,
  take: number = 8,
) => {
  const londonToday = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/London" }),
  );
  londonToday.setHours(0, 0, 0, 0);

  return db.musicalPerformance.findMany({
    where: {
      musical: { theatreId },
      startsAt: { gte: londonToday },
      status: { notIn: ["cancelled", "postponed"] },
    },
    orderBy: { startsAt: "asc" },
    take,
    select: {
      startsAt: true,
      timeTba: true,
      url: true,
      status: true,
      updatedAt: true,
      musical: { select: { name: true, slug: true } },
    },
  });
};
