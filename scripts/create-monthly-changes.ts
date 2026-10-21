import "dotenv/config";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import db from "../utils/db";
import { issueImageColumns } from "./lib/issue-image";
import {
  CHANGE_AUDIENCES,
  CHANGE_KINDS,
  CHANGE_STATUSES,
  CHANGE_TIMINGS,
  formatMonthJa,
  getMonthStart,
  parseMonthSlug,
} from "../lib/changes";

/**
 * 「今月変わったロンドン」の号を1号ぶんDBに登録する。
 *
 *   npx tsx scripts/create-monthly-changes.ts <payload.json> [--replace]
 *
 * 必ず下書き(publishedAt = null)として入る。運営者が /admin/reading で
 * プレビューして承認すると公開される。
 *
 * --replace は既存の号の項目を差し替える。公開済みの号を直すときにも使え、
 * そのときは公開日時を保つ(下書きに戻さない)。
 *
 * 手順は .claude/skills/add-monthly-changes/SKILL.md。
 */

type ItemInput = {
  kind: string;
  audience: string;
  timing?: string;
  status?: string;
  title: string;
  description: string;
  before?: string | null;
  after?: string | null;
  effectiveDate?: string | null;
  sitePath?: string | null;
  source: string;
  sourceName?: string | null;
  displayOrder?: number;
};

type IssuePayload = {
  /** "2026-10"。 */
  slug: string;
  /** 省略時は「2026年10月に変わったロンドン」。 */
  title?: string;
  headline: string;
  summary: string;
  /**
   * 号の写真。その月の目玉の変化に関わる場所や物を写した Wikimedia Commons の
   * 画像URL(原本の幅1200px以上)。書くなら imageAlt も必須。
   * 幅と出典は scripts/lib/issue-image.ts が確かめ、1280px 版で入れる。
   */
  image?: string | null;
  /** 写真に何が写っているかの1文。撮影年がその年でなければ年も書く。 */
  imageAlt?: string | null;
  /** 省略時は実行時刻。 */
  researchedAt?: string;
  items: ItemInput[];
};

const renderMd = (md: string): string =>
  renderToStaticMarkup(React.createElement(ReactMarkdown, null, md));

/**
 * 太字が描画されずに ** のまま残るか。CommonMark の flanking 規則で、
 * 日本語の直前・直後に置いた ** は開き・閉じと認識されないことがある
 * (CLAUDE.md の「Verification」)。実際に描画して確かめる。
 */
function brokenBold(text: string): boolean {
  if (!text.includes("**")) return false;
  return renderMd(text).includes("**");
}

function parseDate(value: string | null | undefined, label: string): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`${label}: invalid date "${value}"`);
  return d;
}

function oneOf(
  value: string | undefined,
  allowed: readonly string[],
  label: string,
) {
  if (value !== undefined && !allowed.includes(value)) {
    throw new Error(`${label} "${value}" is invalid. Use one of: ${allowed.join(", ")}`);
  }
}

function validate(payload: IssuePayload) {
  if (!parseMonthSlug(payload.slug ?? "")) {
    throw new Error(`slug must look like "2026-10", got "${payload.slug}"`);
  }
  if (!payload.headline?.trim()) throw new Error("headline is required");
  if (!payload.summary?.trim()) throw new Error("summary is required");
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("items must be a non-empty array");
  }

  // 見出し・リード・項目の題は Markdown として描画しない。** を書くとそのまま出る。
  const plain: string[] = [];
  if (payload.headline.includes("**")) plain.push("headline");
  if (payload.summary.includes("**")) plain.push("summary");

  const bold: string[] = [];

  for (const [i, item] of payload.items.entries()) {
    const at = `items[${i}]`;
    if (!item.title?.trim()) throw new Error(`${at}.title is required`);
    if (!item.description?.trim()) throw new Error(`${at}.description is required`);

    oneOf(item.kind, CHANGE_KINDS, `${at}.kind`);
    if (!item.audience) throw new Error(`${at}.audience is required`);
    oneOf(item.audience, CHANGE_AUDIENCES, `${at}.audience`);
    oneOf(item.timing, CHANGE_TIMINGS, `${at}.timing`);
    oneOf(item.status, CHANGE_STATUSES, `${at}.status`);

    // 出典は必須。改定の数字を出典なしで載せると、読者も運営者も検証できない。
    if (!item.source?.trim() || !/^https?:\/\//.test(item.source)) {
      throw new Error(`${at}.source must be an http(s) URL (一次ソースのURL)`);
    }
    // サイト内の行き先はパスで持つ。ドメインごと書くと本番以外で壊れる。
    if (item.sitePath && !/^\/[a-z0-9\-/]*$/.test(item.sitePath)) {
      throw new Error(`${at}.sitePath must be a site path like "/bills/energy"`);
    }

    parseDate(item.effectiveDate, `${at}.effectiveDate`);

    if (item.title.includes("**")) plain.push(`${at}.title`);
    if (brokenBold(item.description)) bold.push(`${at}.description`);
  }

  if (plain.length > 0) {
    throw new Error(`Markdown として描画しない欄に ** があります: ${plain.join(", ")}`);
  }

  if (bold.length > 0) {
    throw new Error(
      `太字(**)が描画されない箇所があります: ${bold.join(", ")}\n` +
        "開き ** は文頭か句読点の直後に、閉じ ** は句読点・閉じ括弧の前で切らないように置き直す。",
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const path = args.find((a) => !a.startsWith("--"));
  const replace = args.includes("--replace");

  if (!path) {
    throw new Error(
      "Usage: npx tsx scripts/create-monthly-changes.ts <payload.json> [--replace]",
    );
  }

  const payload: IssuePayload = JSON.parse(readFileSync(path, "utf-8"));
  validate(payload);

  const { year, month } = parseMonthSlug(payload.slug)!;
  const monthStart = getMonthStart(year, month);

  const existing = await db.monthlyChangeIssue.findUnique({
    where: { slug: payload.slug },
    select: { id: true, publishedAt: true },
  });
  if (existing && !replace) {
    throw new Error(
      `Issue ${payload.slug} already exists. Re-run with --replace to overwrite it.`,
    );
  }

  const fields = {
    monthStart,
    title: payload.title?.trim() || `${formatMonthJa(monthStart)}に変わったロンドン`,
    headline: payload.headline.trim(),
    summary: payload.summary.trim(),
    ...(await issueImageColumns(payload.image, payload.imageAlt)),
    researchedAt: parseDate(payload.researchedAt, "researchedAt") ?? new Date(),
  };

  const items = payload.items.map((item, i) => ({
    kind: item.kind,
    audience: item.audience,
    timing: item.timing ?? "changed",
    status: item.status ?? "confirmed",
    title: item.title.trim(),
    description: item.description.trim(),
    before: item.before ?? null,
    after: item.after ?? null,
    effectiveDate: parseDate(item.effectiveDate, `items[${i}].effectiveDate`),
    sitePath: item.sitePath ?? null,
    source: item.source.trim(),
    sourceName: item.sourceName ?? null,
    displayOrder: item.displayOrder ?? i,
  }));

  try {
    if (existing) {
      await db.$transaction([
        db.monthlyChangeItem.deleteMany({ where: { issueId: existing.id } }),
        db.monthlyChangeIssue.update({
          where: { id: existing.id },
          data: { ...fields, items: { create: items } },
        }),
      ]);
      console.log(`Replaced issue: /changes/${payload.slug} (id=${existing.id})`);
    } else {
      const created = await db.monthlyChangeIssue.create({
        data: { slug: payload.slug, ...fields, publishedAt: null, items: { create: items } },
      });
      console.log(`Created issue: /changes/${payload.slug} (id=${created.id})`);
    }

    const count = (key: "timing" | "audience") =>
      items.reduce<Record<string, number>>((acc, it) => {
        acc[it[key]] = (acc[it[key]] ?? 0) + 1;
        return acc;
      }, {});
    console.log(`  項目: ${items.length}件 timing=${JSON.stringify(count("timing"))} audience=${JSON.stringify(count("audience"))}`);
    console.log(
      existing?.publishedAt
        ? `  公開: 公開済みのまま(${existing.publishedAt.toISOString()})`
        : "  公開: 下書き。/admin/reading でプレビューして承認すると公開される",
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
