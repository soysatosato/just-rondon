"use server";

import db from "../db";

export const fetchLyricsbyQuery = async (query: string) => {
  const q = query?.trim() ?? "";
  if (!q || q === "") {
    return [];
  }

  let songs = [] as any[];
  if (q.length > 0) {
    songs = await db.lyrics.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { artist: { name: { contains: q } } },
          { artist: { engName: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { artist: true },
      take: 30,
    });
  }
  return songs ?? [];
};

export async function fetchLyricsDetails(id: string) {
  const song = await db.lyrics.findUnique({
    where: { id },
    include: { artist: true },
  });

  if (!song) return null;

  const RELATED_COUNT = 3;

  async function getRandomSongs(where: any) {
    const ids = await db.lyrics.findMany({
      select: { id: true },
      where: {
        ...where,
        id: { not: id },
      },
    });

    // 件数が足りなければそのまま返す
    if (ids.length === 0) return [];

    // ランダム抽選
    const pickedIds = shuffle(ids.map((i) => i.id)).slice(0, RELATED_COUNT);

    return db.lyrics.findMany({
      where: { id: { in: pickedIds } },
      include: { artist: true },
    });
  }

  // 1. album 優先
  let relatedSongs: any[] = [];
  if (song.album) {
    relatedSongs = await getRandomSongs({ album: song.album });
  }

  // 2. artist fallback
  if (relatedSongs.length < RELATED_COUNT) {
    const remain = RELATED_COUNT - relatedSongs.length;
    const more = await getRandomSongs({ artistId: song.artistId });
    relatedSongs = mergeAndLimit(relatedSongs, more, RELATED_COUNT);
  }

  // 3. genre fallback
  if (song.genre && relatedSongs.length < RELATED_COUNT) {
    const remain = RELATED_COUNT - relatedSongs.length;
    const more = await getRandomSongs({ genre: song.genre });
    relatedSongs = mergeAndLimit(relatedSongs, more, RELATED_COUNT);
  }

  // 4. 全体ランダム fallback
  if (relatedSongs.length < RELATED_COUNT) {
    const more = await getRandomSongs({});
    relatedSongs = mergeAndLimit(relatedSongs, more, RELATED_COUNT);
  }

  return { ...song, relatedSongs };
}

// ---------- Utility Functions ----------

// 配列をランダムシャッフル
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// 重複を避けつつ最大 count 件に揃える
function mergeAndLimit(existing: any[], add: any[], count: number) {
  const merged = [...existing];
  add.forEach((item) => {
    if (!merged.some((m) => m.id === item.id)) merged.push(item);
  });
  return merged.slice(0, count);
}

export const fetchLyricsByArtist = async (
  artistId: string,
  page: number = 1,
  limit: number = 10
) => {
  const songs = await db.lyrics.findMany({
    where: { artistId },
    include: {
      artist: { select: { engName: true, name: true, imageUrl: true } },
    },
    orderBy: { year: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await db.lyrics.count({
    where: { artistId },
  });
  const artist = songs[0]?.artist || null;

  return { songs, total, artist };
};

export const fetchLatestTop10Lyrics = async () => {
  const latest = await db.ranking.findFirst({
    where: { type: "HOT_SONGS", lyricsId: { not: null } },
    orderBy: { periodEnd: "desc" },
    select: { periodEnd: true },
  });

  if (!latest) return [];

  const top10 = await db.ranking.findMany({
    where: {
      type: "HOT_SONGS",
      periodEnd: latest.periodEnd,
      lyricsId: { not: null },
    },
    orderBy: { rank: "asc" },
    take: 10,
    include: {
      lyrics: {
        include: { artist: true },
      },
    },
  });
  return top10;
};

export const fetchArtistDetails = async (id: string) => {
  const artist = await db.artist.findUnique({
    where: { id },
  });

  return artist;
};

export const fetchSortedLyrics = async (
  artistId: string,
  sortBy: "album" | "name" | "year" | "views" = "album",
  sortOrder: "asc" | "desc" = "asc"
) => {
  // 全曲取得（後でまとめて処理）
  const songs = await db.lyrics.findMany({
    where: { artistId },
    include: {
      artist: {
        select: { name: true, engName: true, imageUrl: true },
      },
    },
  });

  if (!songs.length) return [];

  // =====================================================
  // 1. アルバムモード（グルーピング + albumOrder sort）
  // =====================================================
  if (sortBy === "album") {
    const albumMap: Record<string, typeof songs> = {};

    songs.forEach((song) => {
      const key = song.album || "Single / Unknown";
      if (!albumMap[key]) albumMap[key] = [];
      albumMap[key].push(song);
    });

    // アルバムオブジェクト化
    let albums = Object.entries(albumMap).map(([albumName, tracks]) => {
      // 各アルバム内は albumOrder 昇順固定
      tracks.sort((a, b) => a.albumOrder - b.albumOrder);

      const first = tracks.find((t) => t.year && t.month);
      const date = first
        ? `${first.year}.${String(first.month).padStart(2, "0")}`
        : null;

      return { albumName, date, tracks };
    });

    // アルバムの並び替え（sortOrder を適用）
    albums.sort((a, b) => {
      switch (sortOrder) {
        case "asc":
          return a.albumName.localeCompare(b.albumName);
        case "desc":
          return b.albumName.localeCompare(a.albumName);
      }
    });

    return albums;
  }

  // =====================================================
  // 2. 通常モード（曲単位の並び）
  // =====================================================

  const sorted = [...songs];

  switch (sortBy) {
    case "name":
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
      break;

    case "year":
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.year - b.year || a.month - b.month
          : b.year - a.year || b.month - a.month
      );
      break;

    case "views":
      sorted.sort((a, b) =>
        sortOrder === "asc" ? a.views - b.views : b.views - a.views
      );
      break;
  }

  return sorted;
};
export const fetchLyricsByAlbum = async (artistId: string, album: string) => {
  const tracks = await db.lyrics.findMany({
    where: {
      artistId,
      album,
    },
    include: { artist: true },
    orderBy: { albumOrder: "asc" },
  });
  return tracks;
};
