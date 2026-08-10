import "dotenv/config";
import db from "../utils/db";

/**
 * お土産に設定した Instagram URL を検査する。
 *
 * seed を流す前に「貼り間違い」を洗い出すためのもの。DB は変更しない。
 * 詳細は check-brand-instagram.ts のコメントを参照。
 *
 *   npx tsx scripts/check-souvenir-instagram.ts
 */

/** 埋め込めるのは個別投稿(/p/)と Reels(/reel/)だけ。 */
const EMBEDDABLE = /^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/$/;

async function main() {
  const souvenirs = await db.souvenir.findMany({
    orderBy: { displayOrder: "asc" },
    select: { slug: true, name: true, instagramUrl: true },
  });

  const set: typeof souvenirs = [];
  const unset: typeof souvenirs = [];
  const broken: typeof souvenirs = [];

  for (const s of souvenirs) {
    if (!s.instagramUrl) {
      unset.push(s);
    } else if (EMBEDDABLE.test(s.instagramUrl)) {
      set.push(s);
    } else {
      broken.push(s);
    }
  }

  const seen = new Map<string, string[]>();
  for (const s of set) {
    const slugs = seen.get(s.instagramUrl!) ?? [];
    slugs.push(s.slug);
    seen.set(s.instagramUrl!, slugs);
  }
  const duplicated = [...seen.entries()].filter(([, s]) => s.length > 1);

  console.log(`設定済み ${set.length} / ${souvenirs.length}\n`);

  for (const s of set) {
    console.log(`  ✓ ${s.slug.padEnd(24)} ${s.instagramUrl}`);
  }

  if (unset.length) {
    console.log(`\n未設定 ${unset.length}件（埋め込みは表示されない）:`);
    for (const s of unset) console.log(`  - ${s.slug.padEnd(24)} ${s.name}`);
  }

  if (broken.length) {
    console.log(`\n⚠ 埋め込めない形式 ${broken.length}件:`);
    for (const s of broken) {
      console.log(`  ! ${s.slug.padEnd(24)} ${s.instagramUrl}`);
    }
    console.log(
      "    投稿(/p/...)か Reels(/reel/...)のURLが必要。" +
        "プロフィールURLは埋め込めない。",
    );
  }

  if (duplicated.length) {
    console.log(`\n⚠ 同じURLが複数の品に設定されている:`);
    for (const [url, slugs] of duplicated) {
      console.log(`  ! ${url}\n      ${slugs.join(", ")}`);
    }
  }

  console.log(
    "\n形式の検査のみ。投稿が実在するか・現在も公開されているかは、" +
      "ブラウザで開いて確認してください。",
  );

  if (broken.length || duplicated.length) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
