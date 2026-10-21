/**
 * 読み物(コラム・イギリス英語・いまのイギリス)の本文を、投入用JSONの内容で
 * 上書きする。管理ページでプレビューした下書きへの修正依頼に使う。
 *
 * 実行: npx tsx scripts/update-reading.ts <category> <payload.json> <slug>
 *      npx tsx scripts/update-reading.ts <category> <payload.json> <slug> --dry
 *      npx tsx scripts/update-reading.ts <category> <payload.json> <slug> --minor
 *      npx tsx scripts/update-reading.ts export <category> <slug> <out.json>
 *
 *   category は column / british-english / modern-britain。
 *   payload は作成スクリプト(scripts/create-*.ts)に渡したものと同じ形。
 *   投入に使ったJSONが手元に無いとき(別の作業の日に修正を頼まれた等)は、
 *   export でDBの今の中身を同じ形で書き出し、それを直して流す。
 *
 * 参考資料(sources)は、JSONに書いたときだけ置き換える。キーが無ければ
 * DBの値を残し、空配列なら欄を外す。置き換えたときは照合日も今日にする。
 *
 * 節は displayOrder で突き合わせる。JSON側に無い節は削除する。
 * slug と公開日時(publishedAt)には触らない。予約中の記事を直しても
 * 予約はそのまま残る。
 *
 * 公開済みの記事を直すと、直した日時を revisedAt に入れる。記事の上に
 * 「更新」の日付が出て、JSON-LD の dateModified と sitemap の lastmod も
 * それになる。表記の統一・誤字・リンク切れのように、読者にとって中身の
 * 変わらない直しには --minor を付けて、更新日を動かさない(Google は
 * 中身の変わらない日付の書き換えを嫌う)。下書き・予約中の記事は
 * 公開前の直しなので、--minor が無くても入れない。
 *
 * コラムには従来の scripts/update-column.ts もあり、どちらで直してもよい。
 */

import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { Prisma } from "@prisma/client";
import db from "../utils/db";
import { COLUMN_TAGS, isKnownTag } from "../lib/column-taxonomy";
import {
  MODERN_BRITAIN_TAGS,
  isKnownModernBritainTag,
} from "../lib/modern-britain-taxonomy";
import { formatJst, isScheduledCategory } from "../lib/publish-schedule";
import {
  parseSources,
  validateSources,
  type ReadingSource,
} from "../lib/reading-sources";

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
  sources?: ReadingSource[];
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
  const sources = parseSources(row.sources);
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
    ...(sources.length > 0 ? { sources } : {}),
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
      "Usage: npx tsx scripts/update-reading.ts <column|british-english|modern-britain> <payload.json> <slug> [--dry] [--minor]",
    );
  }
  const dry = rest.includes("--dry");
  const minor = rest.includes("--minor");

  const payload: Payload = JSON.parse(readFileSync(path, "utf-8"));
  if (!payload.title?.trim()) throw new Error("title is required");
  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    throw new Error("sections must be a non-empty array");
  }
  validateTags(category, payload.tags);
  const sources =
    payload.sources === undefined ? undefined : validateSources(payload.sources);

  const existing = await db.content.findFirst({
    where: { category, slug },
    include: { sections: true },
  });
  if (!existing) throw new Error(`Not found: /${category}/${slug}`);

  const byOrder = new Map(existing.sections.map((s) => [s.displayOrder, s]));
  const extras = existing.sections.filter(
    (s) => !payload.sections.some((p) => p.displayOrder === s.displayOrder),
  );
  const sourcesChanged =
    sources !== undefined &&
    JSON.stringify(sources) !== JSON.stringify(parseSources(existing.sources));
  // 公開済みの記事への直しだけが「更新」。予約中・下書きは公開前の直し。
  const isPublished =
    existing.publishedAt !== null && existing.publishedAt.getTime() <= Date.now();
  const markRevised = isPublished && !minor;

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
    console.log(
      markRevised
        ? "  revisedAt: now (記事に「更新」の日付が付く。中身の変わらない直しなら --minor)"
        : `  revisedAt: unchanged (${isPublished ? "--minor" : "not published yet"})`,
    );
    if (sourcesChanged) {
      console.log(`  sources: ${sources!.length} entries`);
      for (const src of sources!) {
        console.log(`    - [${src.kind}] ${src.title} (${src.publisher}) ${src.url ?? ""}`);
      }
    }
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
        // 空配列は欄を外す。Prisma の Json? 列に null を入れるには DbNull を使う。
        ...(sourcesChanged
          ? sources!.length > 0
            ? { sources, sourcesCheckedAt: new Date() }
            : { sources: Prisma.DbNull, sourcesCheckedAt: null }
          : {}),
        ...(markRevised ? { revisedAt: new Date() } : {}),
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
  if (sourcesChanged) console.log(`Sources: ${sources!.length}`);
  if (markRevised) console.log("Marked as revised (shown as 更新 on the article)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
