/**
 * 読み物(コラム・イギリス英語・いまのイギリス・ロンドンの街)の画像に、
 * Commons の作者とライセンスの表記を入れる(2026-10)。
 *
 * 画像はすべて Wikimedia Commons から借りており、2026-10 の点検ではコラムの
 * 主画像74枚中43枚が CC BY / CC BY-SA だった。作者名とライセンス名の表示が
 * 利用の条件なのに、記事ページには何も出していなかった。Instagram の
 * カルーセル(表紙に写真を使う)でも同じ表記が要るので、ここで DB に持たせる。
 *
 * 主画像(Content)と節の挿絵(ContentSection)の両方が対象。表記がまだ
 * 入っていない行だけを埋める。--force で全行を取り直す(Commons 側で
 * 作者名やライセンスが直されたとき)。--dry で書き込まずに表示だけ。
 *
 * updatedAt は変えない。表記を足しただけで本文は変わっておらず、
 * sitemap の lastmod や OG カードの ?v= を動かす理由が無い。そのため
 * Prisma の update ではなく SQL で書く(@updatedAt は Prisma 側で付く)。
 *
 *   npx tsx scripts/fill-content-image-credits.ts --dry
 *   npx tsx scripts/fill-content-image-credits.ts
 */
import "dotenv/config";
import db from "../utils/db";
import { READING_CATEGORIES } from "../lib/publish-schedule";
import { resolveCommonsCredits } from "./lib/commons";

const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");

async function main() {
  const contents = await db.content.findMany({
    where: {
      category: { in: [...READING_CATEGORIES] },
      image: { not: null },
      ...(FORCE ? {} : { imageCredit: null }),
    },
    select: { id: true, category: true, slug: true, image: true },
  });
  const sections = await db.contentSection.findMany({
    where: {
      content: { category: { in: [...READING_CATEGORIES] } },
      image: { not: null },
      ...(FORCE ? {} : { imageCredit: null }),
    },
    select: { id: true, image: true, content: { select: { slug: true } } },
  });

  // 空文字の image が残っている節がある(写真を外したときの名残)。描かれない
  // ので表記も要らない。
  const contentRows = contents.filter((c) => c.image?.trim());
  const sectionRows = sections.filter((s) => s.image?.trim());

  const credits = await resolveCommonsCredits([
    ...contentRows.map((c) => c.image!),
    ...sectionRows.map((s) => s.image!),
  ]);

  let filled = 0;
  const missing: string[] = [];

  for (const row of contentRows) {
    const credit = credits.get(row.image!);
    if (!credit) {
      missing.push(`${row.category}/${row.slug}: ${row.image}`);
      continue;
    }
    console.log(`${row.category}/${row.slug}\n  ${credit.credit}`);
    if (!DRY) {
      await db.$executeRaw`
        UPDATE "Content"
        SET "imageSource" = 'commons', "imageCredit" = ${credit.credit}, "imageLink" = ${credit.link}
        WHERE id = ${row.id}`;
    }
    filled += 1;
  }

  for (const row of sectionRows) {
    const credit = credits.get(row.image!);
    if (!credit) {
      missing.push(`section of ${row.content.slug}: ${row.image}`);
      continue;
    }
    console.log(`  [節] ${row.content.slug}\n  ${credit.credit}`);
    if (!DRY) {
      await db.$executeRaw`
        UPDATE "ContentSection"
        SET "imageSource" = 'commons', "imageCredit" = ${credit.credit}, "imageLink" = ${credit.link}
        WHERE id = ${row.id}`;
    }
    filled += 1;
  }

  console.log(
    `\n${DRY ? "[dry] " : ""}主画像 ${contentRows.length}枚・挿絵 ${sectionRows.length}枚のうち ${filled}枚に表記を入れた。`,
  );
  if (missing.length) {
    console.log(`\n表記を取れなかった画像(${missing.length}枚):`);
    for (const m of missing) console.log(`  ${m}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
