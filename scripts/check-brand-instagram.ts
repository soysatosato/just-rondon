import "dotenv/config";
import db from "../utils/db";

/**
 * ブランドに設定した Instagram URL を検査する。
 *
 * seed を流す前に「貼り間違い」を洗い出すためのもの。DB は変更しない。
 *
 * 検出できるのは形式の誤りだけで、投稿が実在するかは判定できない。
 * Instagram はログアウト状態のリクエストに対し、実在する投稿でも
 * 存在しないIDでも同じ JS シェルを 200 で返すため、URL を開いて
 * 生死を確かめる方法が外部からは無い。
 * 実在確認だけは人がブラウザで開いて行うしかない。
 *
 *   npx tsx scripts/check-brand-instagram.ts
 */

/** 埋め込めるのは個別投稿(/p/)と Reels(/reel/)だけ。 */
const EMBEDDABLE = /^https:\/\/www\.instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/$/;

async function main() {
  const brands = await db.brand.findMany({
    orderBy: { displayOrder: "asc" },
    select: { slug: true, name: true, instagramUrl: true },
  });

  const set: typeof brands = [];
  const unset: typeof brands = [];
  const broken: typeof brands = [];

  for (const b of brands) {
    if (!b.instagramUrl) {
      unset.push(b);
    } else if (EMBEDDABLE.test(b.instagramUrl)) {
      set.push(b);
    } else {
      // normaliseInstagramUrl を通っていれば起きないが、DB を直接
      // 触った場合に備えて見ておく。
      broken.push(b);
    }
  }

  // 同じURLを複数のブランドに貼るのは、コピペのずれで起きる典型的な事故。
  // 形式は正しいので他の検査に引っかからない。
  const seen = new Map<string, string[]>();
  for (const b of set) {
    const slugs = seen.get(b.instagramUrl!) ?? [];
    slugs.push(b.slug);
    seen.set(b.instagramUrl!, slugs);
  }
  const duplicated = [...seen.entries()].filter(([, s]) => s.length > 1);

  console.log(`設定済み ${set.length} / ${brands.length}\n`);

  for (const b of set) {
    console.log(`  ✓ ${b.slug.padEnd(18)} ${b.instagramUrl}`);
  }

  if (unset.length) {
    console.log(`\n未設定 ${unset.length}件（埋め込みは表示されない）:`);
    for (const b of unset) console.log(`  - ${b.slug.padEnd(18)} ${b.name}`);
  }

  if (broken.length) {
    console.log(`\n⚠ 埋め込めない形式 ${broken.length}件:`);
    for (const b of broken) {
      console.log(`  ! ${b.slug.padEnd(18)} ${b.instagramUrl}`);
    }
    console.log(
      "    投稿(/p/...)か Reels(/reel/...)のURLが必要。" +
        "プロフィールURLは埋め込めない。",
    );
  }

  if (duplicated.length) {
    console.log(`\n⚠ 同じURLが複数のブランドに設定されている:`);
    for (const [url, slugs] of duplicated) {
      console.log(`  ! ${url}\n      ${slugs.join(", ")}`);
    }
  }

  console.log(
    "\n形式の検査のみ。投稿が実在するか・現在も公開されているかは、" +
      "ブラウザで開いて確認してください。",
  );

  // 壊れたURLがあるときだけ失敗させる。未設定は途中経過なのでエラーにしない。
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
