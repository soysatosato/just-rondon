import "dotenv/config";
import { readFileSync } from "node:fs";
import { Prisma } from "@prisma/client";
import db from "../utils/db";
import { AREA_TAGS, isKnownAreaTag } from "../lib/area-taxonomy";

/**
 * 「ロンドンの街」を1本、DBに追加する。
 *
 *   npx tsx scripts/create-area.ts <payload.json>
 *
 * 検証がやや厳しいのは、この連載の検索流入がタイトルの形に丸ごと
 * 依存しているため。日本語タイトルの頭がカタカナの街名で始まっていないと
 * 「ブリクストン 治安」のような語に当たらず、記事が誰にも届かない。
 * 投入時に落としておかないと、気付くのは数ヶ月後のGSCになる。
 */

type AreaSectionInput = {
  title: string;
  subtitle?: string;
  description: string;
  displayOrder: number;
  image?: string;
  imageSummary?: string;
};

type AreaPayload = {
  /** 日本語タイトル。カタカナの街名で始めること。 */
  title: string;
  /** 英語名。スラッグの元になる(例: Brixton)。 */
  engTitle: string;
  summary: string;
  mainText?: string;
  image?: string;
  /** 方角。lib/area-taxonomy.ts の AREA_TAGS から1〜2個。 */
  tags: string[];
  /** 行政区(例: ランベス区)。 */
  borough?: string;
  /** ゾーン(例: 2、またがるなら 2〜3)。 */
  zone?: string;
  /** 中心部からの所要時間(例: ヴィクトリアから地下鉄で9分)。 */
  access?: string;
  /**
   * 宿エリアガイド/エリアガイドの id(例: shoreditch)。
   * lib/hotels/booking-link.ts の AREA_SEARCH_TERMS か
   * components/sightseeing/areas/areas.ts の areaGuideSlugs に
   * 一致するときだけ、記事から既存ガイドへの導線が出る。
   */
  areaId?: string;
  /** この街にある観光スポットの slug。ContentAttraction を張る。 */
  attractions?: string[];
  sections: AreaSectionInput[];
};

/** 先頭がカタカナか。街名で始まっているかの粗い検査。 */
function startsWithKatakana(title: string): boolean {
  return /^[゠-ヿ]/.test(title.trim());
}

function toSlugBase(engTitle: string): string {
  const romanized = engTitle
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (romanized) return romanized;

  const today = new Date().toISOString().slice(0, 10);
  return `area-${today}`;
}

async function findUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  while (
    await db.content.findFirst({
      where: { slug: candidate, category: "area" },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

function validatePayload(payload: AreaPayload) {
  if (!payload.title?.trim()) throw new Error("title is required");
  if (!payload.engTitle?.trim()) {
    throw new Error("engTitle (英語名) is required for areas");
  }
  if (!payload.summary?.trim()) throw new Error("summary is required");

  if (!startsWithKatakana(payload.title)) {
    throw new Error(
      `title must start with the area name in katakana (got: "${payload.title.slice(0, 20)}…").\n` +
        "検索語は「<カタカナの街名> 治安」の形で来る。タイトルの頭を街名にすること。",
    );
  }

  const validTags = AREA_TAGS.map((t) => t.key).join(", ");
  if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
    throw new Error(`tags must be a non-empty array. Valid tags: ${validTags}`);
  }
  if (payload.tags.length > 2) {
    throw new Error(
      "tags must be 1 or 2 (方角は1つが基本。キングス・クロスのように跨ぐ街だけ2つ)",
    );
  }
  for (const tag of payload.tags) {
    if (!isKnownAreaTag(tag)) {
      throw new Error(`Unknown tag "${tag}". Valid tags: ${validTags}`);
    }
  }

  if (!Array.isArray(payload.sections) || payload.sections.length < 4) {
    throw new Error(
      "sections must have at least 4 entries (由来 / 歴史 / いまの数字 / 歩き方)",
    );
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

/**
 * 観光スポットの slug を id に引き直す。
 *
 * 綴り違いを黙って捨てると「張ったつもりで張れていない」状態になり、
 * 記事側もスポット側も導線が欠けたまま気付けないので、見つからなければ止める。
 */
async function resolveAttractionIds(slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return [];
  const rows = await db.attraction.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const found = new Map(rows.map((r) => [r.slug, r.id]));
  const missing = slugs.filter((s) => !found.has(s));
  if (missing.length > 0) {
    throw new Error(`Unknown attraction slug(s): ${missing.join(", ")}`);
  }
  return slugs.map((s) => found.get(s) as string);
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    throw new Error("Usage: npx tsx scripts/create-area.ts <payload.json>");
  }

  const payload: AreaPayload = JSON.parse(readFileSync(path, "utf-8"));
  validatePayload(payload);

  const attractionIds = await resolveAttractionIds(payload.attractions ?? []);

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
        category: "area",
        // 既存の宿/観光ガイドと突き合わせる id。対応が無ければ空のまま。
        route: payload.areaId ?? "",
        // 見出しの下に並べる事実。対応は lib/area-taxonomy.ts の AreaFacts。
        description: payload.borough,
        description2: payload.zone,
        description3: payload.access,
        tags: payload.tags,
        sections: {
          create: payload.sections
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((s) => ({
              title: s.title,
              subtitle: s.subtitle,
              description: s.description,
              displayOrder: s.displayOrder,
              image: s.image,
              imageSummary: s.imageSummary,
            })),
        },
        ...(attractionIds.length > 0
          ? {
              attractionLinks: {
                create: attractionIds.map((attractionId, i) => ({
                  attractionId,
                  displayOrder: i,
                })),
              },
            }
          : {}),
      },
    });
    console.log(`Created area entry: /reading/areas/${created.slug} (id=${created.id})`);
    if (attractionIds.length > 0) {
      console.log(`  linked ${attractionIds.length} attraction(s)`);
    }
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
