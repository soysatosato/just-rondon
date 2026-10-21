/**
 * 既存のコラムを、投入用JSON(content/column/*.json)の内容で上書きする。
 *
 * scripts/create-column.ts が新規追加なのに対し、こちらは公開済みの回を
 * 直すためのもの。本文はDBにしか無いので、JSONを直してからこれを流す、
 * という順番を守れば「JSONが正・DBが写し」の関係を保てる。
 *
 * 実行: npx tsx scripts/update-column.ts <payload.json> <slug>
 *      npx tsx scripts/update-column.ts <payload.json> <slug> --dry
 *      npx tsx scripts/update-column.ts <payload.json> <slug> --minor
 *
 * 節は displayOrder で突き合わせる。JSON側に無い節は削除する。
 *
 * 公開済みの回を直すと revisedAt(記事の「更新」の日付)が今になる。
 * 中身の変わらない直しは --minor で外す。決まりは scripts/update-reading.ts と同じ。
 */

import "dotenv/config";
import { readFileSync } from "node:fs";
import db from "../utils/db";
import { COLUMN_TAGS, isKnownTag } from "../lib/column-taxonomy";

type SectionInput = {
  title: string;
  subtitle?: string;
  description: string;
  displayOrder: number;
  // 省略した節の挿絵・キャプションはDB側をそのまま残す(undefined は
  // Prisma が更新対象から外す)。挿絵を持たない古いJSONを流しても消えない。
  image?: string;
  imageSummary?: string;
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
  sections: SectionInput[];
};

async function main() {
  const [path, slug, ...rest] = process.argv.slice(2);
  if (!path || !slug) {
    throw new Error(
      "Usage: npx tsx scripts/update-column.ts <payload.json> <slug> [--dry] [--minor]",
    );
  }
  const dry = rest.includes("--dry");
  const minor = rest.includes("--minor");

  const payload: ColumnPayload = JSON.parse(readFileSync(path, "utf-8"));
  for (const tag of payload.tags ?? []) {
    if (!isKnownTag(tag)) {
      throw new Error(
        `Unknown tag "${tag}". Valid tags: ${COLUMN_TAGS.map((t) => t.key).join(", ")}`,
      );
    }
  }

  const existing = await db.content.findFirst({
    where: { category: "column", slug },
    include: { sections: true },
  });
  if (!existing) throw new Error(`Column not found: /column/${slug}`);

  const byOrder = new Map(existing.sections.map((s) => [s.displayOrder, s]));
  const isPublished =
    existing.publishedAt !== null && existing.publishedAt.getTime() <= Date.now();
  const markRevised = isPublished && !minor;

  if (dry) {
    console.log(`/column/${slug} (id=${existing.id})`);
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
    const extras = existing.sections.filter(
      (s) => !payload.sections.some((p) => p.displayOrder === s.displayOrder),
    );
    for (const s of extras) console.log(`  [${s.displayOrder}] delete ${s.title}`);
    console.log(
      markRevised
        ? "  revisedAt: now (記事に「更新」の日付が付く。中身の変わらない直しなら --minor)"
        : `  revisedAt: unchanged (${isPublished ? "--minor" : "not published yet"})`,
    );
    await db.$disconnect();
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
        tags: payload.tags,
        seriesName: payload.seriesName,
        seriesOrder: payload.seriesOrder,
        ...(markRevised ? { revisedAt: new Date() } : {}),
      },
    });

    for (const s of payload.sections) {
      const cur = byOrder.get(s.displayOrder);
      if (cur) {
        await tx.contentSection.update({
          where: { id: cur.id },
          data: {
            title: s.title,
            subtitle: s.subtitle,
            description: s.description,
            image: s.image,
            imageSummary: s.imageSummary,
          },
        });
      } else {
        await tx.contentSection.create({
          data: {
            contentId: existing.id,
            title: s.title,
            subtitle: s.subtitle,
            description: s.description,
            displayOrder: s.displayOrder,
            image: s.image,
            imageSummary: s.imageSummary,
          },
        });
      }
    }

    const extraIds = existing.sections
      .filter((s) => !payload.sections.some((p) => p.displayOrder === s.displayOrder))
      .map((s) => s.id);
    if (extraIds.length > 0) {
      await tx.contentSection.deleteMany({ where: { id: { in: extraIds } } });
    }
  });

  console.log(`Updated column: /column/${slug} (${payload.sections.length} sections)`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
