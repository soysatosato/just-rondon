import "dotenv/config";
import { readFileSync } from "node:fs";
import { Prisma } from "@prisma/client";
import db from "../utils/db";
import { COLUMN_TAGS, isKnownTag } from "../lib/column-taxonomy";

type ColumnSectionInput = {
  title: string;
  subtitle?: string;
  description: string;
  displayOrder: number;
};

type ColumnPayload = {
  title: string;
  engTitle?: string;
  summary: string;
  mainText?: string;
  image?: string;
  website?: string;
  tags: string[];
  seriesName?: string;
  seriesOrder?: number;
  sections: ColumnSectionInput[];
};

function toSlugBase(title: string): string {
  const romanized = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (romanized) return romanized;

  // タイトルがローマ字化できない場合（日本語のみ等）は日付ベースのslugにする。
  const today = new Date().toISOString().slice(0, 10);
  return `column-${today}`;
}

async function findUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (
    await db.content.findFirst({
      where: { slug: candidate, category: "column" },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

function validatePayload(payload: ColumnPayload) {
  if (!payload.title?.trim()) throw new Error("title is required");
  if (!payload.summary?.trim()) throw new Error("summary is required");

  // タグは /column の絞り込みに直結するので必須。未知のキーは弾く。
  if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
    throw new Error(
      `tags must be a non-empty array. Valid tags: ${COLUMN_TAGS.map(
        (t) => t.key,
      ).join(", ")}`,
    );
  }
  for (const tag of payload.tags) {
    if (!isKnownTag(tag)) {
      throw new Error(
        `Unknown tag "${tag}". Valid tags: ${COLUMN_TAGS.map(
          (t) => t.key,
        ).join(", ")}`,
      );
    }
  }

  // 連載は名前と回数が揃って初めて意味を持つ
  const hasName = Boolean(payload.seriesName?.trim());
  const hasOrder = typeof payload.seriesOrder === "number";
  if (hasName !== hasOrder) {
    throw new Error(
      "seriesName and seriesOrder must be provided together (or both omitted)",
    );
  }
  if (hasOrder && payload.seriesOrder! < 1) {
    throw new Error("seriesOrder must be 1 or greater");
  }

  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    throw new Error("sections must be a non-empty array");
  }
  for (const [i, sec] of payload.sections.entries()) {
    if (!sec.title?.trim()) throw new Error(`sections[${i}].title is required`);
    if (!sec.description?.trim()) {
      throw new Error(`sections[${i}].description is required`);
    }
    if (typeof sec.displayOrder !== "number") {
      throw new Error(`sections[${i}].displayOrder must be a number`);
    }
  }
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    throw new Error("Usage: npx tsx scripts/create-column.ts <payload.json>");
  }

  const payload: ColumnPayload = JSON.parse(readFileSync(path, "utf-8"));
  validatePayload(payload);

  const baseSlug = toSlugBase(payload.engTitle || payload.title);
  const slug = await findUniqueSlug(baseSlug);

  // 同じ連載で回数が重複すると一覧の並び順が壊れるため事前に弾く
  if (payload.seriesName) {
    const clash = await db.content.findFirst({
      where: {
        category: "column",
        seriesName: payload.seriesName,
        seriesOrder: payload.seriesOrder,
      },
      select: { slug: true },
    });
    if (clash) {
      throw new Error(
        `Series "${payload.seriesName}" already has 第${payload.seriesOrder}回: ${clash.slug}`,
      );
    }
  }

  try {
    const created = await db.content.create({
      data: {
        title: payload.title,
        engTitle: payload.engTitle,
        slug,
        summary: payload.summary,
        mainText: payload.mainText,
        image: payload.image,
        website: payload.website,
        category: "column",
        route: "/column",
        tags: payload.tags,
        seriesName: payload.seriesName,
        seriesOrder: payload.seriesOrder,
        sections: {
          create: payload.sections
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((s) => ({
              title: s.title,
              subtitle: s.subtitle,
              description: s.description,
              displayOrder: s.displayOrder,
            })),
        },
      },
    });
    console.log(`Created column: /column/${created.slug} (id=${created.id})`);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error(`Slug collision despite pre-check: ${slug}`);
    }
    throw e;
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
