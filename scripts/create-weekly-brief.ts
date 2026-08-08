import "dotenv/config";
import { readFileSync } from "node:fs";
import db from "../utils/db";
import {
  BRIEF_KINDS,
  KIND_META,
  getWeekSlug,
  getWeekRange,
  getISOWeekParts,
  parseWeekSlug,
  type BriefKind,
} from "../lib/weekly";

/**
 * 「今週のロンドン」週次ダイジェストを1号ぶんDBに登録する。
 *
 *   npx tsx scripts/create-weekly-brief.ts <payload.json> [--publish] [--replace]
 *
 * 既定では published:false の下書きとして入る。内容を確認してから --publish で
 * 公開するか、payload に "published": true を書く。
 */

type ItemInput = {
  kind: string;
  severity?: "high" | "medium" | "low" | null;
  timing?: "thisWeek" | "announced";
  status?: "confirmed" | "planned";
  title: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
  area?: string | null;
  nearestStation?: string | null;
  priceInfo?: string | null;
  isFree?: boolean;
  website?: string | null;
  source: string;
  sourceName?: string | null;
  displayOrder?: number;
};

type BriefPayload = {
  /** "2026-w33"。省略時は weekOf(または今日)から算出する。 */
  slug?: string;
  /** 週内の任意の日付 "2026-08-12" でもよい。その週のISO週番号に丸める。 */
  weekOf?: string;
  title?: string;
  headline: string;
  summary: string;
  image?: string | null;
  /** 省略時は実行時刻。 */
  researchedAt?: string;
  published?: boolean;
  items: ItemInput[];
};

const ALERT_KINDS = new Set(
  BRIEF_KINDS.filter((k) => KIND_META[k].group === "alert")
);

const VALID_TIMING = new Set(["thisWeek", "announced"]);
const VALID_STATUS = new Set(["confirmed", "planned"]);
const VALID_SEVERITY = new Set(["high", "medium", "low"]);

function parseDate(value: string | null | undefined, label: string): Date | null {
  if (value === null || value === undefined || value === "") return null;
  // 日付だけの指定は UTC 0時に寄せる。ローカルTZ解釈で1日ずれるのを避ける。
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`${label}: invalid date "${value}"`);
  return d;
}

/** 号のslugと週の範囲を決める。slug > weekOf > 今日 の優先順。 */
function resolveWeek(payload: BriefPayload): {
  slug: string;
  weekStart: Date;
  weekEnd: Date;
} {
  if (payload.slug) {
    const parsed = parseWeekSlug(payload.slug);
    if (!parsed) {
      throw new Error(`slug must look like "2026-w33", got "${payload.slug}"`);
    }
    return { slug: payload.slug, ...getWeekRange(parsed.year, parsed.week) };
  }

  const base = payload.weekOf
    ? parseDate(payload.weekOf, "weekOf")!
    : new Date();
  const { year, week } = getISOWeekParts(base);
  return { slug: getWeekSlug(year, week), ...getWeekRange(year, week) };
}

function validate(payload: BriefPayload) {
  if (!payload.headline?.trim()) throw new Error("headline is required");
  if (!payload.summary?.trim()) throw new Error("summary is required");
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("items must be a non-empty array");
  }

  for (const [i, item] of payload.items.entries()) {
    const at = `items[${i}]`;
    if (!item.title?.trim()) throw new Error(`${at}.title is required`);
    if (!item.description?.trim()) throw new Error(`${at}.description is required`);

    // 出典は必須。ストライキや休館の情報を出典なしで載せると検証できない。
    if (!item.source?.trim()) {
      throw new Error(`${at}.source is required (一次ソースのURLを入れる)`);
    }
    if (!/^https?:\/\//.test(item.source)) {
      throw new Error(`${at}.source must be an http(s) URL, got "${item.source}"`);
    }

    if (!BRIEF_KINDS.includes(item.kind as BriefKind)) {
      throw new Error(
        `${at}.kind "${item.kind}" is invalid. Use one of: ${BRIEF_KINDS.join(", ")}`
      );
    }

    // 支障系は severity が無いと読者が対応を判断できない。
    if (ALERT_KINDS.has(item.kind as BriefKind) && !item.severity) {
      throw new Error(
        `${at}.severity is required for kind "${item.kind}" (high | medium | low)`
      );
    }
    if (item.severity && !VALID_SEVERITY.has(item.severity)) {
      throw new Error(`${at}.severity "${item.severity}" is invalid`);
    }
    if (item.timing && !VALID_TIMING.has(item.timing)) {
      throw new Error(`${at}.timing "${item.timing}" is invalid`);
    }
    if (item.status && !VALID_STATUS.has(item.status)) {
      throw new Error(`${at}.status "${item.status}" is invalid`);
    }

    const start = parseDate(item.startDate, `${at}.startDate`);
    const end = parseDate(item.endDate, `${at}.endDate`);
    if (start && end && end < start) {
      throw new Error(`${at}: endDate is before startDate`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const path = args.find((a) => !a.startsWith("--"));
  const publishFlag = args.includes("--publish");
  const replace = args.includes("--replace");

  if (!path) {
    throw new Error(
      "Usage: npx tsx scripts/create-weekly-brief.ts <payload.json> [--publish] [--replace]"
    );
  }

  const payload: BriefPayload = JSON.parse(readFileSync(path, "utf-8"));
  validate(payload);

  const { slug, weekStart, weekEnd } = resolveWeek(payload);

  const existing = await db.weeklyBrief.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && !replace) {
    throw new Error(
      `Brief ${slug} already exists. Re-run with --replace to overwrite it.`
    );
  }

  const data = {
    slug,
    weekStart,
    weekEnd,
    title: payload.title?.trim() || `今週のロンドン ${slug}`,
    headline: payload.headline.trim(),
    summary: payload.summary.trim(),
    image: payload.image ?? null,
    researchedAt: parseDate(payload.researchedAt, "researchedAt") ?? new Date(),
    published: publishFlag || payload.published === true,
    items: {
      create: payload.items.map((item, i) => ({
        kind: item.kind,
        severity: item.severity ?? null,
        timing: item.timing ?? "thisWeek",
        status: item.status ?? "confirmed",
        title: item.title.trim(),
        description: item.description.trim(),
        startDate: parseDate(item.startDate, `items[${i}].startDate`),
        endDate: parseDate(item.endDate, `items[${i}].endDate`),
        venue: item.venue ?? null,
        area: item.area ?? null,
        nearestStation: item.nearestStation ?? null,
        priceInfo: item.priceInfo ?? null,
        isFree: item.isFree ?? false,
        website: item.website ?? null,
        source: item.source.trim(),
        sourceName: item.sourceName ?? null,
        displayOrder: item.displayOrder ?? i,
      })),
    },
  };

  try {
    if (existing) {
      // 項目は差し替える。onDelete: Cascade があるので子だけ先に消せばよい。
      await db.weeklyBriefItem.deleteMany({ where: { briefId: existing.id } });
      const { items, slug: _slug, ...rest } = data;
      await db.weeklyBrief.update({
        where: { id: existing.id },
        data: { ...rest, items },
      });
      console.log(`Replaced weekly brief: /events/week/${slug} (id=${existing.id})`);
    } else {
      const created = await db.weeklyBrief.create({ data });
      console.log(`Created weekly brief: /events/week/${slug} (id=${created.id})`);
    }

    const counts = payload.items.reduce<Record<string, number>>((acc, it) => {
      acc[it.kind] = (acc[it.kind] ?? 0) + 1;
      return acc;
    }, {});
    console.log(
      `  週: ${weekStart.toISOString().slice(0, 10)} 〜 ${weekEnd
        .toISOString()
        .slice(0, 10)}`
    );
    console.log(`  項目: ${payload.items.length}件 (${JSON.stringify(counts)})`);
    console.log(
      data.published
        ? "  公開: published=true"
        : "  公開: published=false (下書き。--publish で公開)"
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
