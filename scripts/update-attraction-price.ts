import "dotenv/config";
import db from "../utils/db";

/**
 * 観光スポットの料金(priceAdult / priceChild)を書き換える。
 *
 *   npx tsx scripts/update-attraction-price.ts <slug> --adult "£36〜" [--child "£18〜"] [--dry]
 *
 * 変更履歴(AttractionPriceChange)は DB のトリガーが書くので、このスクリプトは
 * 値を書き換えるだけでよい。月次号の下調べ(report-monthly-changes.ts)が
 * その履歴を拾う。
 *
 * 書式は既存の行に合わせる(「£35.8〜」のような表示用文字列。無料は「無料」)。
 * 表記だけ直す書き換えも履歴に残るので、改定と無関係な整形はまとめてやらない。
 */

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const slug = process.argv[2];
  const adult = arg("--adult");
  const child = arg("--child");
  const dry = process.argv.includes("--dry");

  if (!slug || slug.startsWith("--") || (adult === undefined && child === undefined)) {
    throw new Error(
      'Usage: npx tsx scripts/update-attraction-price.ts <slug> --adult "£36〜" [--child "£18〜"] [--dry]',
    );
  }

  const row = await db.attraction.findUnique({
    where: { slug },
    select: { id: true, name: true, priceAdult: true, priceChild: true },
  });
  if (!row) throw new Error(`Attraction not found: ${slug}`);

  const data: { priceAdult?: string; priceChild?: string } = {};
  if (adult !== undefined) data.priceAdult = adult;
  if (child !== undefined) data.priceChild = child;

  console.log(row.name);
  if (adult !== undefined) console.log(`  大人: ${row.priceAdult ?? "(空)"} → ${adult}`);
  if (child !== undefined) console.log(`  子ども: ${row.priceChild ?? "(空)"} → ${child}`);

  if (dry) {
    console.log("  --dry: 書き込んでいません");
    return;
  }
  await db.attraction.update({ where: { id: row.id }, data });
  console.log("  更新しました(変更履歴はトリガーが記録)");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
