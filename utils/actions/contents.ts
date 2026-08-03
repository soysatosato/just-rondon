"use server";

import db from "../db";

export const fetchChristmasMarkets = async () => {
  const contents = await db.content.findMany({
    where: { category: "christmas-market" },
    include: { sections: true },
  });

  return contents;
};

export const fetchChristmasMarketBySlug = async (slug: string) => {
  const content = await db.content.findFirst({
    where: { category: "christmas-market", slug },
    include: { sections: true },
  });

  return content;
};

export const fetchKidsFreeActivities = async () => {
  const contents = await db.content.findMany({
    where: { category: "free-london-kids" },
    include: { sections: true },
  });

  return contents;
};

export const fetchRoyalActivities = async () => {
  const contents = await db.content.findMany({
    where: { category: "royal-london" },
    include: { sections: true },
  });

  return contents;
};

export const fetchHPActivities = async () => {
  const contents = await db.content.findMany({
    where: { category: "harry-potter" },
    include: { sections: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  return contents;
};

export const fetchThamesRiverCruises = async () => {
  const contents = await db.content.findMany({
    where: { category: "thames-cruise" },
    include: { sections: true },
  });

  return contents;
};

export const fetchStadiumTours = async () => {
  const contents = await db.content.findMany({
    where: { category: "stadium-tour" },
    include: { sections: true },
  });

  return contents;
};

export const fetchContentBySlug = async (slug: string) => {
  const content = await db.content.findFirst({
    where: { slug },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

export const fetchEvents2025 = async () => {
  const contents = await db.content.findMany({
    where: {
      category: "london-events-2025",
    },
    orderBy: { createdAt: "asc" },
  });
  return contents;
};
export const fetchMonthlyEvents2025 = async (slug: string) => {
  const content = await db.content.findFirst({
    // category を絞らないと、クリスマスマーケット等の別カテゴリの Content が
    // /events/<slug> でも同じ内容で描画され、canonical違いの重複ページになる
    where: { slug, category: "london-events-2025" },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  return content;
};

export const fetchColumns = async () => {
  const contents = await db.content.findMany({
    where: { category: "column" },
    orderBy: { createdAt: "desc" },
  });
  return contents;
};

export const fetchColumnBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "column" },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

export const fetchEvents2026 = async () => {
  const contents = await db.content.findMany({
    where: {
      category: "london-events-2026",
    },
    orderBy: { createdAt: "asc" },
  });
  return contents;
};
export const fetchMonthlyEvents2026 = async (slug: string) => {
  const content = await db.content.findFirst({
    where: { slug, category: "london-events-2026" },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  return content;
};

export const fetchEventsForMonth = async (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return db.event.findMany({
    where: { startDate: { lt: end }, endDate: { gte: start } },
    orderBy: [{ startDate: "asc" }, { displayOrder: "asc" }],
  });
};

export const fetchUpcomingEvents = async (limit = 6, from: Date = new Date()) => {
  return db.event.findMany({
    where: { endDate: { gte: from } },
    orderBy: [{ startDate: "asc" }, { displayOrder: "asc" }],
    take: limit,
  });
};
