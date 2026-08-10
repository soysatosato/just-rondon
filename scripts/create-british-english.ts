import "dotenv/config";
import { readFileSync } from "node:fs";
import { Prisma } from "@prisma/client";
import db from "../utils/db";

type BritishEnglishSectionInput = {
  title: string;
  subtitle?: string;
  description: string;
  displayOrder: number;
};

type BritishEnglishPayload = {
  title: string;
  engTitle: string;
  summary: string;
  mainText?: string;
  image?: string;
  website?: string;
  sections: BritishEnglishSectionInput[];
};

function toSlugBase(title: string): string {
  const romanized = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (romanized) return romanized;

  // タイトルがローマ字化できない場合は日付ベースのslugにする。
  const today = new Date().toISOString().slice(0, 10);
  return `british-english-${today}`;
}

async function findUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (
    await db.content.findFirst({
      where: { slug: candidate, category: "british-english" },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

function validatePayload(payload: BritishEnglishPayload) {
  if (!payload.title?.trim()) throw new Error("title is required");
  if (!payload.engTitle?.trim()) throw new Error("engTitle is required");
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
    throw new Error(
      "Usage: npx tsx scripts/create-british-english.ts <payload.json>"
    );
  }

  const payload: BritishEnglishPayload = JSON.parse(readFileSync(path, "utf-8"));
  validatePayload(payload);

  const baseSlug = toSlugBase(payload.engTitle);
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
        category: "british-english",
        route: "/british-english",
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
    console.log(
      `Created british-english entry: /british-english/${created.slug} (id=${created.id})`
    );
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
