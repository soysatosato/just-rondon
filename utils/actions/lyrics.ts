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

export const fetchLyricsDetails = async (id: string) => {
  const song = await db.lyrics.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
    include: {
      artist: true,
    },
  });

  return song;
};

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
