"use server";

import { draftMode } from "next/headers";
import db from "../db";

/**
 * 「今月変わったロンドン」月次号(/changes)のデータ取得。
 *
 * 公開の判定は MonthlyChangeIssue.publishedAt(null=下書き)。読者に見せる
 * クエリは必ず published() を混ぜること。号の詳細だけは、運営者が管理ページ
 * から draft mode でプレビューしている間に限り下書きも引ける。
 */

function published() {
  return { publishedAt: { lte: new Date() } };
}

const ITEMS = { items: { orderBy: { displayOrder: "asc" as const } } };

export const fetchChangeIssueBySlug = async (slug: string) => {
  return db.monthlyChangeIssue.findFirst({
    where: { slug, ...(draftMode().isEnabled ? {} : published()) },
    include: ITEMS,
  });
};

/** ハブと号の末尾に出すバックナンバー。新しい号から。 */
export const fetchChangeIssues = async (limit = 24, excludeSlug?: string) => {
  return db.monthlyChangeIssue.findMany({
    where: {
      ...published(),
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    orderBy: { monthStart: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      headline: true,
      monthStart: true,
      _count: { select: { items: true } },
    },
  });
};

/** /events など、ほかのページから最新号へ案内するときに使う。 */
export const fetchLatestChangeIssue = async () => {
  return db.monthlyChangeIssue.findFirst({
    where: published(),
    orderBy: { monthStart: "desc" },
    select: { slug: true, title: true, headline: true, monthStart: true },
  });
};
