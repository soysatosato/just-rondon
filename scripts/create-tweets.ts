import "dotenv/config";
import { readFileSync } from "node:fs";
import db from "../utils/db";

/**
 * X(旧Twitter)投稿用の下書きをまとめてDBに登録する。
 *
 *   npx tsx scripts/create-tweets.ts <payload.json>
 *
 * 投稿API連携は無いため、登録されるのは下書きのみ。
 * 内容は /tweets で確認し、人が手動でXにコピペ投稿する。
 */

type TweetInput = {
  body: string;
  category: string;
};

function validatePayload(items: TweetInput[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("payload must be a non-empty array of tweets");
  }
  for (const [i, t] of items.entries()) {
    if (!t.body?.trim()) throw new Error(`items[${i}].body is required`);
    if (t.body.length > 140) {
      throw new Error(`items[${i}].body exceeds 140 characters (${t.body.length})`);
    }
    if (!t.category?.trim()) throw new Error(`items[${i}].category is required`);
  }
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    throw new Error("Usage: npx tsx scripts/create-tweets.ts <payload.json>");
  }

  const items: TweetInput[] = JSON.parse(readFileSync(path, "utf-8"));
  validatePayload(items);

  const created = await db.tweetDraft.createManyAndReturn({
    data: items.map((t) => ({ body: t.body, category: t.category })),
  });

  console.log(`Created ${created.length} tweet draft(s):`);
  for (const t of created) {
    console.log(`  [${t.category}] ${t.body}`);
  }
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
