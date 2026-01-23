"use server";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import db from "../db";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";

function hashToUint32(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function dayKeyUTC() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}
function rotate<T>(arr: T[], seed: number) {
  if (arr.length === 0) return arr;
  const offset = seed % arr.length;
  return [...arr.slice(offset), ...arr.slice(0, offset)];
}

export async function fetchLyrixplorerHomeData() {
  const day = dayKeyUTC();
  const seedBase = hashToUint32(`lyrixplorer|${day}`);

  // 🔥 DBは1回だけ
  // ランキング2種 + 曲 + アーティスト を全部一緒に引く
  const rankings = await db.ranking.findMany({
    where: {
      OR: [{ type: "HOT_SONGS" }, { type: "HOT_ALBUM" }],
    },
    orderBy: { periodEnd: "desc" }, // 最新が先頭に来る
    take: 300, // 週次ランキング想定。多めに取ってもOK
    include: {
      lyrics: { include: { artist: true } },
      artist: true,
    },
  });

  // ここからは JS 処理（DB触らない）

  const latestSongs = await db.ranking.findFirst({
    where: { type: "HOT_SONGS", lyricsId: { not: null } },
    orderBy: { periodEnd: "desc" },
    select: { periodEnd: true },
  });

  const top10 = latestSongs
    ? await db.ranking.findMany({
        where: {
          type: "HOT_SONGS",
          periodEnd: latestSongs.periodEnd,
          lyricsId: { not: null },
        },
        orderBy: { rank: "asc" },
        take: 10,
        include: { lyrics: { include: { artist: true } } },
      })
    : [];

  const hotAlbums = await db.ranking.findMany({
    where: { type: "HOT_ALBUM" },
    orderBy: [{ periodEnd: "desc" }, { rank: "asc" }],
    take: 5,
    include: { artist: true },
  });

  // 今日の曲ピック：top10から回す（なければ空）
  const todaysPick = rotate(
    top10.map((r) => r.lyrics).filter(Boolean) as any[],
    seedBase + 11,
  ).slice(0, 3);

  // hotArtists：hotAlbumsやtop10由来のartistを回す（DB触らない）
  const artistsFromRankings = [
    ...top10.map((r) => r.lyrics?.artist).filter(Boolean),
    ...hotAlbums.map((r) => r.artist).filter(Boolean),
  ] as any[];

  // 重複排除
  const uniqArtistsMap = new Map<string, any>();
  for (const a of artistsFromRankings) {
    if (!uniqArtistsMap.has(a.id)) uniqArtistsMap.set(a.id, a);
  }
  const uniqArtists = [...uniqArtistsMap.values()];

  const hotArtists = rotate(uniqArtists, seedBase + 22).slice(0, 6);

  // todaysAlbumPick：hotAlbumsから日替わり1つ（DB触らない）
  const todaysAlbumPick = hotAlbums.length
    ? (() => {
        const pick = rotate(hotAlbums, seedBase + 33)[0];

        return {
          artistId: pick.artistId ?? pick.artist?.id ?? "",
          album: pick.album ?? "",
          artistName: pick.artist?.name ?? "",
        };
      })()
    : null;

  return {
    top10,
    todaysPick,
    todaysAlbumPick,
    hotAlbums,
    hotArtists,
  };
}

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

const seedFromString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export const fetchLyricsDetails = cache(async (id: string) => {
  const song = await db.lyrics.findUnique({
    where: { id },
    include: { artist: true },
  });

  if (!song) return null;

  const RELATED_COUNT = 3;

  if (!song.genre) {
    return { ...song, relatedSongs: [] };
  }

  // ✅ ここが1クエリ（count/skip/ループ廃止）
  const candidates = await db.lyrics.findMany({
    where: {
      genre: song.genre,
      id: { not: id },
    },
    orderBy: { id: "asc" },
    take: 30, // ここは調整OK（20〜50）
    include: { artist: true },
  });

  if (candidates.length === 0) {
    return { ...song, relatedSongs: [] };
  }

  // 決定的に「ずらして」3件取る
  const seed = seedFromString(`${id}|${song.genre}`);
  const offset = seed % candidates.length;
  const relatedSongs = [
    ...candidates.slice(offset),
    ...candidates.slice(0, offset),
  ].slice(0, Math.min(RELATED_COUNT, candidates.length));

  return { ...song, relatedSongs };
});

export const fetchLyricsByArtist = async (
  artistId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const songs = await db.lyrics.findMany({
    where: { artistId },
    include: {
      artist: true,
    },
    orderBy: { year: "desc", month: "desc" },
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
  sortOrder: "asc" | "desc" = "asc",
) => {
  // 全曲取得（後でまとめて処理）
  const songs = await db.lyrics.findMany({
    where: { artistId },
    include: {
      artist: true,
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
          : b.name.localeCompare(a.name),
      );
      break;

    case "year":
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.year - b.year || a.month - b.month
          : b.year - a.year || b.month - a.month,
      );
      break;

    case "views":
      sorted.sort((a, b) =>
        sortOrder === "asc" ? a.views - b.views : b.views - a.views,
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
  const day = dayKeyUTC();
  const seed = hashToUint32(`todaysPicks|${day}`);
  const pivot = seed.toString(36);

  const first = await db.lyrics.findMany({
    where: { id: { gte: pivot } },
    orderBy: { id: "asc" },
    take: limit,
    include: { artist: true },
    // includeを使うなら selectは外す。どちらか片方。
  });

  if (first.length === limit) return first;

  const second = await db.lyrics.findMany({
    where: { id: { lt: pivot } },
    orderBy: { id: "asc" },
    take: limit - first.length,
    include: { artist: true },
  });

  return [...first, ...second];
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

  });

  if (!artist || !pick.album) return null;

  // ④ year / month を代表1曲から取得
  const meta = await db.lyrics.findFirst({
    where: {
      artistId: pick.artistId,
      album: pick.album,
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

export async function createArtist(formData: FormData) {
  const name = formData.get("name") as string;
  const engName = formData.get("engName") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const isHot = formData.get("isHot") === "on";

  // await db.artist.create({
  //   data: {
  //     name,
  //     engName,
  //     imageUrl: imageUrl || null,
  //     isHot,
  //   },
  // });

  redirect("/lyrixplorer");
}

export async function createLyrics(formData: FormData) {
  const name = formData.get("name") as string;
  const artistId = formData.get("artistId") as string;
  const lyrics = formData.get("lyrics") as string;

  const scene = formData.get("scene") as string | null;
  const album = formData.get("album") as string | null;
  const youtubeId = formData.get("youtubeId") as string | null;
  const genre = formData.get("genre") as string | null;

  const year = Number(formData.get("year") || 0);
  const month = Number(formData.get("month") || 0);
  const albumOrder = Number(formData.get("albumOrder") || 0);

  // await db.lyrics.create({
  //   data: {
  //     name,
  //     artistId,
  //     lyrics,
  //     scene: scene || null,
  //     album: album || null,
  //     youtubeId: youtubeId || null,
  //     genre: genre || null,
  //     year,
  //     month,
  //     albumOrder,
  //   },
  // });

  redirect("/lyrixplorer");
}
// utils/actions/lyrics.ts
export async function fetchArtists(
  page: number = 1,
  itemsPerPage: number = 10,
) {
  const safePage = Math.max(1, page);
  const take = Math.max(1, itemsPerPage);
  const skip = (safePage - 1) * take;

  const where = {
    name: {
      not: "-",
    },
  };

  const [total, artists] = await Promise.all([
    db.artist.count({ where }),

    db.artist.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        _count: {
          select: { songs: true },
        },
      },
    }),
  ]);

  return {
    artists,
    total,
  };
}

export async function fetchLyrics() {
  const lyrics = await db.lyrics.findMany({
    orderBy: { name: "asc" },
  });
  return lyrics;
}

export async function createRanking(formData: FormData) {
  const type = formData.get("type") as any;
  const rank = Number(formData.get("rank"));
  const album = formData.get("album") as string | null;
  const periodStart = new Date(formData.get("periodStart") as string);
  const periodEnd = new Date(formData.get("periodEnd") as string);

  const lyricsId = (formData.get("lyricsId") as string) || null;
  const artistId = (formData.get("artistId") as string) || null;

  // await db.ranking.create({
  //   data: {
  //     type,
  //     rank,
  //     album: album || null,
  //     periodStart,
  //     periodEnd,
  //     lyricsId,
  //     artistId,
  //   },
  // });

  redirect("/lyrixplorer");
}
