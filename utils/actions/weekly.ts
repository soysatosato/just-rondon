"use server";

import db from "../db";
import { getISOWeekStart } from "../../lib/weekly";

/**
 * 週次ダイジェスト「今週のロンドン」の主役となる号と、その上に併記する「先の週」の号。
 *
 * 号は2週ほど先まで作って公開するので、最新号は今週のものとは限らない。
 * 今週ロンドンに居る人には今週号のほうが要るので、今週の号があればそれを本体に据え、
 * 来週号は先頭のリンクとして案内する。今週号がまだ無ければ最新号を本体にする。
 *
 * トップの「今週のロンドン」と /events はどちらもこれを使う。別々に選ぶと、
 * トップに先の週の号が出てリンク先(/events は今週号)と食い違う。
 */
export const fetchCurrentBriefs = async () => {
  const thisWeekStart = getISOWeekStart(new Date());

  const [current, upcoming] = await Promise.all([
    db.weeklyBrief.findFirst({
      where: { published: true, weekStart: thisWeekStart },
      include: { items: { orderBy: { displayOrder: "asc" } } },
    }),
    db.weeklyBrief.findFirst({
      where: { published: true, weekStart: { gt: thisWeekStart } },
      orderBy: { weekStart: "asc" },
      select: { slug: true, title: true, headline: true, weekStart: true, weekEnd: true },
    }),
  ]);

  if (current) return { brief: current, upcoming };

  const latest = await db.weeklyBrief.findFirst({
    where: { published: true },
    orderBy: { weekStart: "desc" },
    include: { items: { orderBy: { displayOrder: "asc" } } },
  });
  return { brief: latest, upcoming: null };
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
