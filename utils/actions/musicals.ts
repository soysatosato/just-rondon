"use server";

import db from "../db";

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
    include: { songs: { select: { id: true } } },
  });
  return musical;
};

export const fetchMusicalIdandName = (slug: string) => {
  return db.musical.findUnique({
    where: { slug },
    select: { id: true, name: true, engName: true },
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
