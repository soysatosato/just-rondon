"use server";

import db from "../db";
import { MIN_WEEKLY, fetchWeeklyTopIds, orderByIds } from "../rankings";

export const fetchAllMusicals = async () => {
  return db.musical.findMany({
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });
};

/**
 * /musicals トップの絞り込みに使う一覧。
 *
 * 全カラムを返す fetchAllMusicals と分けているのは、こちらが
 * クライアントコンポーネントへ丸ごと渡る配列だから。description は
 * 1作品あたり最大2600字あり、31作品ぶんを JSON に載せると
 * 初期表示のためだけに数十KBを送ることになる。絞り込みに要る
 * フィールドだけを選ぶ。
 */
export const fetchMusicalsForBrowse = async () => {
  return db.musical.findMany({
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      engName: true,
      summary: true,
      image: true,
      highlights: true,
      mustSee: true,
      recommendLevel: true,
      isOnShow: true,
      address: true,
      runtimeMinutes: true,
      intervalMinutes: true,
      minAgeGuidance: true,
      englishForm: true,
      theatre: { select: { slug: true, name: true, nameJa: true } },
      theatreName: true,
    },
  });
};

/** ランキングに出す件数。縦に積むので長くしない。 */
const MUSICAL_RANK_SIZE = 5;

/** ランキング1件ぶんの列。順位の並べ替えに id が要る。 */
const MUSICAL_RANK_SELECT = {
  id: true,
  slug: true,
  name: true,
  engName: true,
  image: true,
} as const;

/**
 * /musicals の「よく見られている作品」。週間と総合の2軸。
 *
 * 一覧はおすすめ順・必見のカルーセルとも編集側の並びで、作品を
 * 入れ替えない限り顔ぶれが動かない。読者側の軸を足して、週ごとに
 * 変わる面を作る。
 *
 * 週間は DailyView から id を集計してから引き直す(外部キーが無いため)。
 * 件数が MIN_WEEKLY に届かないうちは空で返す——運用開始直後の数件を
 * 「今週の順位」として出しても、ランキングには見えない。
 */
export const fetchMusicalRankings = async (take = MUSICAL_RANK_SIZE) => {
  const weeklyIds = await fetchWeeklyTopIds("musical", take);

  const [weeklyRows, allTimeRows] = await Promise.all([
    weeklyIds.length > 0
      ? db.musical.findMany({
          where: { id: { in: weeklyIds } },
          select: MUSICAL_RANK_SELECT,
        })
      : Promise.resolve([]),
    // 総合。views=0 を除くのは、集計開始前の行を並べても順位に
    // 意味が無いため。
    db.musical.findMany({
      where: { views: { gt: 0 } },
      select: MUSICAL_RANK_SELECT,
      orderBy: [{ views: "desc" }, { recommendLevel: "desc" }],
      take,
    }),
  ]);

  const weeklyRanked = orderByIds(weeklyIds, weeklyRows, take);

  const toItems = (rows: typeof allTimeRows) =>
    rows.map((row) => ({
      key: row.slug,
      href: `/musicals/${row.slug}`,
      title: row.name,
      subtitle: row.engName,
      image: row.image,
    }));

  return {
    weekly: weeklyRanked.length >= MIN_WEEKLY ? toItems(weeklyRanked) : [],
    allTime: toItems(allTimeRows),
  };
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
