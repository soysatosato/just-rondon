"use server";

import db from "../db";

/**
 * 週次ダイジェスト「今週のロンドン」のデータ取得。
 *
 * 号は「次の月曜から始まる週」を先に作って公開する運用なので、
 * 「今週」に限定して探すと公開直後に何も出なくなる。最新の1号を素直に返し、
 * それが今週のものか来週のものかは表示側で weeksAgo から判断する。
 */

export const fetchLatestBrief = async () => {
  return db.weeklyBrief.findFirst({
    where: { published: true },
    orderBy: { weekStart: "desc" },
    include: { items: { orderBy: { displayOrder: "asc" } } },
  });
};

export const fetchBriefBySlug = async (slug: string) => {
  return db.weeklyBrief.findFirst({
    where: { slug, published: true },
    include: { items: { orderBy: { displayOrder: "asc" } } },
  });
};

export const fetchBackIssues = async (limit = 12, excludeSlug?: string) => {
  return db.weeklyBrief.findMany({
    where: {
      published: true,
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    orderBy: { weekStart: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      headline: true,
      weekStart: true,
      weekEnd: true,
    },
  });
};

/** サイトマップと generateStaticParams 用。 */
export const fetchPublishedBriefSlugs = async () => {
  return db.weeklyBrief.findMany({
    where: { published: true },
    orderBy: { weekStart: "desc" },
    select: { slug: true, updatedAt: true },
  });
};

/**
 * その週に開催中の「定番」イベント。
 * 1年前から分かっているものは Event テーブルが持っているので、
 * 号の執筆時に手で書かずここから自動で拾う。
 */
export const fetchEventsForWeek = async (weekStart: Date, weekEnd: Date) => {
  return db.event.findMany({
    where: { startDate: { lte: weekEnd }, endDate: { gte: weekStart } },
    orderBy: [{ startDate: "asc" }, { displayOrder: "asc" }],
  });
};
