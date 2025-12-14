"use server";

import { Prisma } from "@prisma/client";
import db from "../db";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";

export const fetchLyricsbyQuery = async ({
  q,
  page = 1,
  limit = 10,
}: {
  q: string;
  page?: number;
  limit?: number;
}) => {
  const query = q?.trim() ?? "";

  if (!query) {
    return {
      songs: [],
      totalCount: 0,
    };
  }

  const whereClause: Prisma.LyricsWhereInput = {
    OR: [
      {
        name: {
          contains: query,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        artist: {
          name: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
      {
        artist: {
          engName: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
    ],
  };

  // 全件数
  const totalCount = await db.lyrics.count({
    where: whereClause,
  });

  // ページ分のデータ
  const songs = await db.lyrics.findMany({
    where: whereClause,
    include: { artist: true },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    songs,
    totalCount,
  };
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
      const key = song.album || "Single / その他収録曲";
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

export async function createLyricsRequest(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const artist = formData.get("artist")?.toString().trim();

  if (!title) {
    throw new Error("曲名は必須です");
  }

  // DB保存
  await db.lyricsRequest.create({
    data: {
      title,
      artist: artist || null,
    },
  });

  // 管理者通知メール
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: process.env.EMAIL_USER,
    subject: "【LyriXplorer】歌詞リクエストが届きました",
    text: `
新しい歌詞リクエストがあります。

曲名: ${title}
アーティスト: ${artist ?? "未入力"}
    `,
  });
  redirect("/lyrixplorer/request?success=1");
}

export async function fetchTodaysPicks(limit = 3) {
  const total = await db.lyrics.count();

  if (total === 0) return [];

  const skip = Math.floor(Math.random() * total);

  return db.lyrics.findMany({
    skip,
    take: limit,
    include: {
      artist: true,
    },
  });
}

export async function fetchHotAlbums(limit = 5) {
  const latest = await db.ranking.findFirst({
    where: { type: "HOT_ALBUM" },
    orderBy: { periodEnd: "desc" },
    select: { periodEnd: true },
  });

  if (!latest) return [];

  return db.ranking.findMany({
    where: {
      type: "HOT_ALBUM",
      periodEnd: latest.periodEnd,
    },
    orderBy: { rank: "asc" },
    take: limit,
    include: {
      artist: true,
    },
  });
}
export async function fetchTodaysAlbumPick() {
  // ① 7曲以上ある album × artist を抽出
  const candidates = await db.lyrics.groupBy({
    by: ["artistId", "album"],
    where: {
      album: { not: null },
    },
    _count: {
      _all: true,
    },
    having: {
      id: {
        _count: {
          gte: 7,
        },
      },
    },
  });

  if (candidates.length === 0) return null;

  // ② ランダムで1つ選択
  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  // ③ アーティスト名取得
  const artist = await db.artist.findUnique({
    where: { id: pick.artistId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!artist || !pick.album) return null;

  // ④ year / month を代表1曲から取得
  const meta = await db.lyrics.findFirst({
    where: {
      artistId: pick.artistId,
      album: pick.album,
    },
    select: {
      year: true,
      month: true,
    },
    orderBy: {
      albumOrder: "asc",
    },
  });

  if (!meta) return null;

  return {
    album: pick.album,
    artistId: artist.id,
    artistName: artist.name,
    year: meta.year,
    month: meta.month,
  };
}

export async function fetchHotArtistsRandom(limit = 6) {
  // ① isHot = true の総数
  const total = await db.artist.count({
    where: { isHot: true },
  });

  if (total === 0) return [];

  // ② ランダム offset
  const skip = Math.floor(Math.random() * total);

  // ③ 取得
  return db.artist.findMany({
    where: { isHot: true },
    skip,
    take: limit,
  });
}
