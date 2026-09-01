/**
 * 観光パス4件を観光スポットDBから伏せる。
 *
 *   npx tsx scripts/unpublish-pass-attractions.ts           # 差分を表示
 *   npx tsx scripts/unpublish-pass-attractions.ts --apply   # DBへ反映
 *
 * なぜ伏せるか:
 * パスは場所ではなく買い方なので、Attraction(場所のモデル)に置くと
 * 場所前提の機能を足すたびに除外リストが1行増える。実際、近くのスポット・
 * 旅程の移動時間・エリア付与・おすすめ度・facts 抽出・visitFlow の6か所で
 * この4件(と巡回バス類)を名指しで外していた。
 *
 * それ以上に効いたのは、商品ページが4枚に割れている限り、どのページも
 * 単体で「お得です」と書くしかなかったこと。損得は比較でしか出ない。
 * 旧ロンドンパスのページは、要約が「コスパも良い」で本文冒頭が
 * 「まず元が取れません」という矛盾を抱えたまま公開されていた。
 *
 * 判定は /sightseeing/passes に1本化した。旧URLは next.config.mjs の
 * 301 でそちらへ送る。
 *
 * なぜ削除しないか:
 * 行を消すと sections と stories が巻き添えで消え、「何を載せていたか」が
 * 追えなくなる(Attraction.isPublished のコメント参照)。加えて、この4件の
 * 本文はDBにしか無い。念のため、伏せる前に本文を JSON へ書き出して
 * リポジトリに残す。
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import db from "@/utils/db";

const APPLY = process.argv.includes("--apply");

/** 伏せる対象。next.config.mjs の redirects と一致させること。 */
const SLUGS = [
  "the-london-pass",
  "golden-pass-london",
  "merlin-london-attractions-pass",
  "royal-museums-greenwich-day-pass",
];

const ARCHIVE = join(
  process.cwd(),
  "scripts",
  "archive",
  "pass-attractions-2026-09.json",
);

async function main() {
  const rows = await db.attraction.findMany({
    where: { slug: { in: SLUGS } },
    include: {
      sections: { orderBy: { displayOrder: "asc" } },
      stories: { orderBy: { displayOrder: "asc" } },
      visitFlow: { orderBy: { displayOrder: "asc" } },
    },
  });

  const missing = SLUGS.filter((s) => !rows.some((r) => r.slug === s));
  for (const m of missing) console.log(`SKIP ${m} — 該当スポットなし`);

  for (const r of rows) {
    console.log(
      `${r.isPublished ? "伏せる" : "適用済み"} ${r.slug} — ${r.name}` +
        `（本文${r.sections.length}節 / 読み物${r.stories.length}件）`,
    );
  }

  const target = rows.filter((r) => r.isPublished);
  if (target.length === 0) {
    console.log("\n変更なし。すべて適用済みです。");
    return;
  }

  if (!APPLY) {
    console.log(`\n--apply を付けると ${target.length}件を非公開にします。`);
    return;
  }

  writeFileSync(ARCHIVE, JSON.stringify(rows, null, 2) + "\n", "utf-8");
  console.log(`\n本文を書き出しました: ${ARCHIVE}`);

  const res = await db.attraction.updateMany({
    where: { slug: { in: target.map((r) => r.slug) } },
    data: { isPublished: false },
  });
  console.log(`${res.count}件を非公開にしました。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
