/**
 * コラム41本のタイトルを、検索結果で読める範囲に主語が入る形へ書き換える。
 *
 * 日本語の検索結果でタイトルとして読めるのは全角30字ほど。既存のタイトルは
 * 中央値62字あり、「何の話か」を示す固有名詞と数字がその枠の外へ落ちていた。
 * 書き換え後は、先頭30字のうちに固有名詞か数字が入るようにしてある。
 *
 * slug は変更しない。URLが変わるとインデックスを積み直すことになり、
 * このセクションはただでさえ表示回数が少ないため割に合わない。
 *
 * 対応表は content/column/title-rewrite-2026-09.json にコミットしてある。
 * 本文がDBにしか無いため、投入したものは必ずリポジトリ側にも残す。
 *
 *   npx tsx scripts/rewrite-column-titles-2026-09.ts --dry   確認だけ
 *   npx tsx scripts/rewrite-column-titles-2026-09.ts         反映
 *   npx tsx scripts/rewrite-column-titles-2026-09.ts --revert 元に戻す
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import db from "../utils/db";

type Rewrite = {
  slug: string;
  before: string;
  after: string;
  keywords: string[];
};

/** 日本語の検索結果でタイトルとして読める上限の目安。 */
const SERP_VISIBLE = 30;

function serp(title: string): string {
  return title.length <= SERP_VISIBLE
    ? title
    : `${title.slice(0, SERP_VISIBLE)}…`;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const revert = process.argv.includes("--revert");

  const path = resolve(__dirname, "../content/column/title-rewrite-2026-09.json");
  const rewrites: Rewrite[] = JSON.parse(readFileSync(path, "utf8"));

  const rows = await db.content.findMany({
    where: { category: "column" },
    select: { slug: true, title: true },
  });
  const current = new Map(rows.map((r) => [r.slug, r.title]));

  let applied = 0;
  let skipped = 0;
  const drifted: string[] = [];

  for (const r of rewrites) {
    const from = revert ? r.after : r.before;
    const to = revert ? r.before : r.after;
    const now = current.get(r.slug);

    if (now === undefined) {
      drifted.push(`${r.slug} … DBに存在しない`);
      continue;
    }
    if (now === to) {
      skipped++;
      continue;
    }
    // 想定と違うタイトルが入っているものは触らない。手で直した記事を
    // 巻き戻す事故のほうが、1本書き換え損ねるより高くつく。
    if (now !== from) {
      drifted.push(`${r.slug}\n      DB : ${now}\n      想定: ${from}`);
      continue;
    }

    console.log(`  ${r.slug}`);
    console.log(`    − ${serp(from)}`);
    console.log(`    + ${serp(to)}`);
    console.log(`    検索語: ${r.keywords.join(" / ")}`);

    if (!dry) {
      await db.content.update({
        where: { id: (await db.content.findFirstOrThrow({
          where: { category: "column", slug: r.slug },
          select: { id: true },
        })).id },
        data: { title: to },
      });
    }
    applied++;
  }

  console.log("");
  console.log(
    `${dry ? "[確認のみ] " : ""}${revert ? "巻き戻し" : "書き換え"} ${applied}件 / 反映済みのため skip ${skipped}件`
  );

  if (drifted.length) {
    console.log("");
    console.log(`想定と違うため触らなかったもの ${drifted.length}件:`);
    for (const d of drifted) console.log(`  - ${d}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
