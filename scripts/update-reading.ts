/**
 * 読み物(コラム・イギリス英語・いまのイギリス)の本文を、投入用JSONの内容で
 * 上書きする。管理ページでプレビューした下書きへの修正依頼に使う。
 *
 * 実行: npx tsx scripts/update-reading.ts <category> <payload.json> <slug>
 *      npx tsx scripts/update-reading.ts <category> <payload.json> <slug> --dry
 *      npx tsx scripts/update-reading.ts export <category> <slug> <out.json>
 *
 *   category は column / british-english / modern-britain。
 *   payload は作成スクリプト(scripts/create-*.ts)に渡したものと同じ形。
 *   投入に使ったJSONが手元に無いとき(別の作業の日に修正を頼まれた等)は、
 *   export でDBの今の中身を同じ形で書き出し、それを直して流す。
 *
 * 節は displayOrder で突き合わせる。JSON側に無い節は削除する。
 * slug と公開日時(publishedAt)には触らない。予約中の記事を直しても
 * 予約はそのまま残る。
 *
 * コラムには従来の scripts/update-column.ts もあり、どちらで直してもよい。
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import db from "../utils/db";
import { COLUMN_TAGS, isKnownTag } from "../lib/column-taxonomy";
import {
  MODERN_BRITAIN_TAGS,
  isKnownModernBritainTag,
} from "../lib/modern-britain-taxonomy";
import { formatJst, isScheduledCategory } from "../lib/publish-schedule";

type SectionInput = {
  title: string;
  subtitle?: string;
  description: string;
  displayOrder: number;
  // 省略した節の挿絵・キャプションはDB側をそのまま残す(undefined は
  // Prisma が更新対象から外す)。
  image?: string;
  imageSummary?: string;
};

type Payload = {
  title: string;
  engTitle?: string;
  summary: string;
  mainText?: string;
  image?: string;
  website?: string;
  tags?: string[];
  seriesName?: string;
  seriesOrder?: number;
  sections: SectionInput[];
};

/** タグの正典はセクションごとに違う。イギリス英語はタグを持たない。 */
function validateTags(category: string, tags: string[] | undefined) {
  const canon =
    category === "column"
      ? { known: isKnownTag, all: COLUMN_TAGS }
      : category === "modern-britain"
        ? { known: isKnownModernBritainTag, all: MODERN_BRITAIN_TAGS }
        : null;
  if (!canon) return;
  for (const tag of tags ?? []) {
    if (!canon.known(tag)) {
      throw new Error(
        `Unknown tag "${tag}". Valid tags: ${canon.all.map((t) => t.key).join(", ")}`,
      );
    }
  }
}

function statusOf(publishedAt: Date | null): string {
  if (!publishedAt) return "draft";
  return publishedAt.getTime() > Date.now()
    ? `scheduled for ${formatJst(publishedAt)} JST`
    : "published";
}

/** DBの今の中身を、作成・更新スクリプトに渡すJSONと同じ形で書き出す。 */
async function exportPayload(category: string, slug: string, out: string) {
  const row = await db.content.findFirst({
    where: { category, slug },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  if (!row) throw new Error(`Not found: /${category}/${slug}`);

  const opt = <T,>(v: T | null) => v ?? undefined;
  const payload: Payload = {
    title: row.title,
    engTitle: opt(row.engTitle),
    summary: row.summary ?? "",
    mainText: opt(row.mainText),
    image: opt(row.image),
    website: opt(row.website),
    ...(category !== "british-english" ? { tags: row.tags } : {}),
    ...(category === "column" && row.seriesName
      ? { seriesName: row.seriesName, seriesOrder: opt(row.seriesOrder) }
      : {}),
    sections: row.sections.map((sec) => ({
      title: sec.title,
      subtitle: opt(sec.subtitle),
      description: sec.description ?? "",
      displayOrder: sec.displayOrder,
      image: opt(sec.image),
      imageSummary: opt(sec.imageSummary),
    })),
  };
  writeFileSync(out, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Exported /${category}/${slug} (${statusOf(row.publishedAt)}) -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "export") {
    const [, category, slug, out] = args;
    if (!category || !slug || !out || !isScheduledCategory(category)) {
      throw new Error(
        "Usage: npx tsx scripts/update-reading.ts export <column|british-english|modern-britain> <slug> <out.json>",
      );
    }
    return exportPayload(category, slug, out);
  }

  const [category, path, slug, ...rest] = args;
  if (!category || !path || !slug || !isScheduledCategory(category)) {
    throw new Error(
      "Usage: npx tsx scripts/update-reading.ts <column|british-english|modern-britain> <payload.json> <slug> [--dry]",
    );
  }
  const dry = rest.includes("--dry");

  const payload: Payload = JSON.parse(readFileSync(path, "utf-8"));
  if (!payload.title?.trim()) throw new Error("title is required");
  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    throw new Error("sections must be a non-empty array");
  }
  validateTags(category, payload.tags);

  const existing = await db.content.findFirst({
    where: { category, slug },
    include: { sections: true },
  });
  if (!existing) throw new Error(`Not found: /${category}/${slug}`);

  const byOrder = new Map(existing.sections.map((s) => [s.displayOrder, s]));
  const extras = existing.sections.filter(
    (s) => !payload.sections.some((p) => p.displayOrder === s.displayOrder),
  );

  if (dry) {
    console.log(
      `/${category}/${slug} (id=${existing.id}, ${statusOf(existing.publishedAt)})`,
    );
    for (const s of payload.sections) {
      const cur = byOrder.get(s.displayOrder);
      const changed =
        !cur ||
        cur.title !== s.title ||
        (cur.subtitle ?? undefined) !== s.subtitle ||
        (cur.description ?? "") !== s.description ||
        (s.image !== undefined && (cur.image ?? undefined) !== s.image) ||
        (s.imageSummary !== undefined &&
          (cur.imageSummary ?? undefined) !== s.imageSummary);
      console.log(
        `  [${s.displayOrder}] ${changed ? (cur ? "update" : "create") : "same  "} ${s.title}`,
      );
    }
    for (const s of extras) console.log(`  [${s.displayOrder}] delete ${s.title}`);
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.content.update({
      where: { id: existing.id },
      data: {
        title: payload.title,
        engTitle: payload.engTitle,
        summary: payload.summary,
        mainText: payload.mainText,
        image: payload.image,
        website: payload.website,
        // タグと連載はそのセクションが持つときだけ書く。
        ...(category !== "british-english" ? { tags: payload.tags } : {}),
        ...(category === "column"
          ? { seriesName: payload.seriesName, seriesOrder: payload.seriesOrder }
          : {}),
      },
    });

    for (const s of payload.sections) {
      const data = {
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        image: s.image,
        imageSummary: s.imageSummary,
      };
      const cur = byOrder.get(s.displayOrder);
      if (cur) {
        await tx.contentSection.update({ where: { id: cur.id }, data });
      } else {
        await tx.contentSection.create({
          data: { ...data, contentId: existing.id, displayOrder: s.displayOrder },
        });
      }
    }

    if (extras.length > 0) {
      await tx.contentSection.deleteMany({
        where: { id: { in: extras.map((s) => s.id) } },
      });
    }
  });

  console.log(
    `Updated /${category}/${slug} (${payload.sections.length} sections, ${statusOf(existing.publishedAt)})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
