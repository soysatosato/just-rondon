/**
 * Instagram のカルーセル投稿の原稿を、下書きとして DB に入れる。
 * /add-instagram スキルから呼ぶ。
 *
 *   npx tsx scripts/create-instagram-posts.ts <payload.json> [--dry]
 *
 * payload は配列。1件が1投稿(5枚):
 *
 *   {
 *     "category": "column" | "british-english",
 *     "slug": "記事の slug",
 *     "coverHead": "表紙の見出し", "coverTail": "表紙の副題(任意)",
 *     "points": [{ "label": "1340", "title": "…", "body": "…" }, … 3件],
 *     "closingTitle": "…", "closingBody": "…",
 *     "caption": "キャプション本文(誘導・クレジット・タグは自動で足す)",
 *     "hashtags": ["ロンドン", "イギリス"],
 *     "allowRepeat": false   // 同じ記事の投稿が既にあっても作るとき true
 *   }
 *
 * 1件でも問題があれば1件も入れない(半端に入ると、どれを直せばよいか
 * 分からなくなる)。文字数の上限は lib/instagram/limits.ts。
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import db from "../utils/db";
import {
  isIgCategory,
  validateIgCopy,
  type IgCategory,
  type IgPoint,
} from "../lib/instagram/limits";
import { composeIgCaption } from "../lib/instagram/caption";

type PostInput = {
  category: string;
  slug: string;
  coverHead: string;
  coverTail?: string | null;
  points: IgPoint[];
  closingTitle: string;
  closingBody: string;
  caption: string;
  hashtags?: string[];
  allowRepeat?: boolean;
};

const DRY = process.argv.includes("--dry");

async function main() {
  const path = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!path) {
    throw new Error("Usage: npx tsx scripts/create-instagram-posts.ts <payload.json> [--dry]");
  }
  const payload = JSON.parse(readFileSync(path, "utf-8")) as PostInput[];
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("payload は1件以上の配列にしてください");
  }

  const now = new Date();
  const problems: string[] = [];
  const ready: {
    input: PostInput;
    category: IgCategory;
    contentId: string;
    credit: string | null;
  }[] = [];
  const seen = new Set<string>();

  for (const [i, input] of payload.entries()) {
    const where = `[${i}] ${input.category}/${input.slug}`;
    if (!isIgCategory(input.category)) {
      problems.push(`${where}: category は column か british-english です`);
      continue;
    }
    const category = input.category;

    const content = await db.content.findFirst({
      where: { category, slug: input.slug },
      select: {
        id: true,
        engTitle: true,
        image: true,
        imageSource: true,
        imageCredit: true,
        publishedAt: true,
        instagramPosts: { where: { status: { not: "rejected" } }, select: { status: true } },
      },
    });
    if (!content) {
      problems.push(`${where}: 記事が見つかりません(slug を DB で確かめてください)`);
      continue;
    }
    // 投稿を見た人がプロフィールから記事へ来るので、まだ出ていない記事は使えない。
    if (!content.publishedAt || content.publishedAt > now) {
      problems.push(`${where}: まだ公開されていない記事です`);
    }
    if (seen.has(content.id)) problems.push(`${where}: 同じ記事が payload に2回あります`);
    seen.add(content.id);
    if (content.instagramPosts.length && !input.allowRepeat) {
      problems.push(
        `${where}: この記事の投稿は既にあります(${content.instagramPosts
          .map((p) => p.status)
          .join(", ")})。もう一度出すなら allowRepeat: true`,
      );
    }

    // 表紙の型。コラムは写真、イギリス英語は英語の表現が主役。
    let credit: string | null = null;
    if (category === "column") {
      if (!content.image) {
        problems.push(`${where}: 記事に写真が無く、表紙が無地になります`);
      } else if (content.imageSource === "commons" && !content.imageCredit) {
        problems.push(
          `${where}: 写真のクレジットがありません。先に npx tsx scripts/fill-content-image-credits.ts を流してください`,
        );
      } else if (content.imageSource === "commons") {
        credit = content.imageCredit;
      }
    } else if (!content.engTitle?.trim()) {
      problems.push(`${where}: 記事に engTitle が無く、表紙の主役が描けません`);
    }

    const copy = {
      coverHead: input.coverHead ?? "",
      coverTail: input.coverTail ?? null,
      points: Array.isArray(input.points) ? input.points : [],
      closingTitle: input.closingTitle ?? "",
      closingBody: input.closingBody ?? "",
      caption: input.caption ?? "",
      hashtags: input.hashtags ?? [],
    };
    for (const p of validateIgCopy(copy)) problems.push(`${where}: ${p}`);

    ready.push({ input, category, contentId: content.id, credit });
  }

  if (problems.length) {
    console.error("登録を中止しました(1件も入れていません):");
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }

  for (const { input, category, contentId, credit } of ready) {
    const hashtags = input.hashtags ?? [];
    if (DRY) {
      console.log(`\n[dry] ${category}/${input.slug}`);
      console.log(composeIgCaption({ caption: input.caption, hashtags, credit }));
      continue;
    }
    const created = await db.instagramPost.create({
      data: {
        contentId,
        coverHead: input.coverHead.trim(),
        coverTail: input.coverTail?.trim() || null,
        points: input.points.map((p) => ({
          label: p.label.trim(),
          title: p.title.trim(),
          body: p.body.trim(),
        })),
        closingTitle: input.closingTitle.trim(),
        closingBody: input.closingBody.trim(),
        caption: input.caption.trim(),
        hashtags: hashtags.map((t) => t.trim()),
        status: "draft",
      },
    });
    console.log(`下書きを入れました: ${category}/${input.slug} (id=${created.id})`);
  }
  if (!DRY) {
    console.log(`\n${ready.length}件。/admin/instagram で5枚を確認して承認してください。`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
