"use server";

import db from "../db";

export const fetchAllMusicals = async () => {
  return db.musical.findMany({
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });
};

export const fetchTopMusicals = async (limit: number = 3) => {
  return db.musical.findMany({
    where: { mustSee: true },
    orderBy: { recommendLevel: "desc" },
    take: limit,
    select: { slug: true, name: true, engName: true, image: true },
  });
};

export const fetchMusicals = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  // 総件数
  const total = await db.musical.count();

  // ページごとの取得
  const musicals = await db.musical.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  return { musicals, total };
};

export const fetchMusicalDetails = async (slug: string) => {
  const musical = await db.musical.findUnique({
    where: { slug },
    include: {
      songs: { select: { id: true } },
      // 未紐付けの作品では null。表示側は theatreName にフォールバックする。
      theatre: {
        select: {
          slug: true,
          name: true,
          nameJa: true,
          address: true,
          lat: true,
          lng: true,
          nearestStation: true,
        },
      },
    },
  });
  return musical;
};

/**
 * 作品ページに出す公演日程。
 *
 * 未来ぶんだけを返す。同期は日次なので、当日ぶんが昼の実行で
 * 消えないよう当日の 00:00(ロンドン)以降を対象にする。
 * 取り込みのない作品(TM に在庫がない)は空配列になる。
 */
export const fetchMusicalPerformances = async (musicalId: string) => {
  // 「今日」の判定はロンドン基準。日本時間の朝はまだロンドンは前日で、
  // UTC で切ると前夜の公演がまだ終わっていないのに消える。
  const londonToday = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/London" }),
  );
  londonToday.setHours(0, 0, 0, 0);

  return db.musicalPerformance.findMany({
    where: {
      musicalId,
      startsAt: { gte: londonToday },
      // 中止・延期の公演は日程として出さない。
      status: { notIn: ["cancelled", "postponed"] },
    },
    orderBy: { startsAt: "asc" },
    select: { startsAt: true, timeTba: true, url: true, status: true, updatedAt: true },
  });
};

// generateMetadata 専用。summary / tagline まで取るのは、description を
// 作品ごとに書き分けるため(テンプレート文だと全作品が同じスニペットになる)。
export const fetchMusicalIdandName = (slug: string) => {
  return db.musical.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      engName: true,
      summary: true,
      tagline: true,
    },
  });
};

export const fetchSongs = async (
  musicalId: string,
  page: number = 1,
  limit: number = 10
) => {
  const songs = await db.song.findMany({
    where: { musicalId },
    orderBy: { index: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.song.count({
    where: { musicalId },
  });

  return { songs, total };
};

export const fetchSongDetails = async (id: string) => {
  const song = await db.song.findUnique({
    where: { id },
    include: { musical: { select: { name: true, engName: true } } },
  });
  return song;
};
