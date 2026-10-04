/**
 * 季節の催し4件の slug から年号を外す(2026-10)。
 *
 *   npx tsx scripts/rename-seasonal-slugs-2026-10.ts          # 差分を表示
 *   npx tsx scripts/rename-seasonal-slugs-2026-10.ts --apply  # 書き換え
 *
 * 対応表は lib/sightseeing/renamed-slugs.js。旧URLの301転送(next.config.mjs)と
 * 旅行プランの読み替え(lib/plan)も同じ表を読む。
 *
 * ------------------------------------------------------------------
 * 実行するのは、転送を入れたコードが本番に出る直前
 * ------------------------------------------------------------------
 * このDBは本番が直接読んでいる。書き換えた時点で本番のコードが古いままだと、
 * 旧URLは転送先が無く404になり、/plan は旧 slug を「非公開になった
 * スポット」とみなして読者の保存済みプランから消す。
 *
 * 逆にデプロイのあとに回すのも避ける。sitemap.xml はビルド時にDBから
 * 作るので、書き換え前にビルドすると旧URLが次のデプロイまで残る。
 * 「このスクリプト → すぐ push」の順で続けて行う。
 *
 * 冪等。書き換え済みの行は飛ばす。
 */
import db from "@/utils/db";
import { RENAMED_ATTRACTION_SLUGS } from "@/lib/sightseeing/renamed-slugs";

const APPLY = process.argv.includes("--apply");

async function main() {
  const pairs = Object.entries(RENAMED_ATTRACTION_SLUGS);
  const rows = await db.attraction.findMany({
    where: { slug: { in: pairs.flat() } },
    select: { id: true, slug: true, name: true },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  const updates: { id: string; from: string; to: string }[] = [];
  for (const [from, to] of pairs) {
    const oldRow = bySlug.get(from);
    const newRow = bySlug.get(to);
    if (!oldRow && newRow) {
      console.log(`済み  ${to}`);
      continue;
    }
    if (!oldRow) throw new Error(`見つからない: ${from}`);
    if (newRow) throw new Error(`${to} が別の行ですでに使われている`);
    console.log(`${from} → ${to}  (${oldRow.name})`);
    updates.push({ id: oldRow.id, from, to });
  }

  if (!APPLY) {
    console.log(`\n${updates.length}件。--apply で書き換える。`);
    return;
  }
  await db.$transaction(
    updates.map(({ id, to }) =>
      db.attraction.update({ where: { id }, data: { slug: to } }),
    ),
  );
  console.log(`\n${updates.length}件を書き換えた。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
