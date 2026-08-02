import "dotenv/config";
import { readFileSync } from "node:fs";
import { Prisma } from "@prisma/client";
import db from "../utils/db";

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
