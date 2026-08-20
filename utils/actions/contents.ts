"use server";

import db from "../db";

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

// 連載コラムの詳細ページで、同じ連載の全話を回順に出すために使う。
// seriesName が無い単発コラムでは呼んでも空配列が返る。
export const fetchColumnSeries = async (seriesName: string | null) => {
  if (!seriesName) return [];
  const contents = await db.content.findMany({
    where: { category: "column", seriesName },
    orderBy: { seriesOrder: "asc" },
    select: { id: true, title: true, slug: true, seriesOrder: true },
  });
  return contents;
};

export const fetchBritishEnglishEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "british-english" },
    orderBy: { createdAt: "desc" },
  });
  return contents;
};

export const fetchBritishEnglishBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "british-english" },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};

/**
 * 「英国のいまを論じる」。最新の英国ニュースを起点に、背景と意味を
 * 掘り下げる時事論考。category を分けているのは、同じ読み物でも
 * 「過去(column) vs いま」で読者の期待が違い、/column の一覧に混ぜると
 * 連載の性格がぼやけるため。予定表である /events とも役割が違う
 * (あちらは「今週何があるか」、こちらは「それが何を意味するか」)。
 */
export const fetchModernBritainEntries = async () => {
  const contents = await db.content.findMany({
    where: { category: "modern-britain" },
    orderBy: { createdAt: "desc" },
  });
  return contents;
};

export const fetchModernBritainBySlug = async (slug: string) => {
  // category を絞らないと他カテゴリの Content と slug が衝突しうる（既知のバグパターン）
  const content = await db.content.findFirst({
    where: { slug, category: "modern-britain" },
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
