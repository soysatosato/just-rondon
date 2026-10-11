/**
 * 観光スポット・美術館・作品のメイン画像を、Wikimedia の 1280px 版に置き換え、
 * Commons の作者とライセンスの表記を入れる(2026-10)。
 *
 * 2026-10 の監査で見つかった2つの問題を、同じ API 呼び出しで片付ける。
 *
 * 1. 重さ。DB には upload.wikimedia.org の原本 URL がそのまま入っており、
 *    next.config.mjs の unoptimized: true のもとで原本が直に読まれていた。
 *    トップはモバイルで 48.9MB、LCP 要素は 12.3MB の写真だった。
 *    1280px 版なら同じ写真が数百KBで済む。
 *    幅は機械的に書き換えられない。Wikimedia は標準の幅
 *    (lib/og.ts の WIKIMEDIA_THUMB_WIDTHS)以外と、原本より大きい幅を
 *    400 で拒むため、原本の幅を API に聞いてから決める。
 * 2. 表記。CC BY / BY-SA は作者名とライセンス名の表示が条件なのに、
 *    詳細ページに何も出していなかった。
 *
 * en.wikipedia のローカルファイル(フェアユース前提の非フリー画像)は
 * サイトでは使えないので、書き換えずに一覧に出す。差し替えは手で行う。
 *
 * 新しいスポットを足したあとにもう一度流せば、その行だけが埋まる。
 * --dry で書き込まずに表示だけ。
 *
 * updatedAt は変えない。画像の配り方と表記を変えただけで本文は変わって
 * おらず、sitemap の lastmod を動かす理由が無い。そのため Prisma の update
 * ではなく SQL で書く(@updatedAt は Prisma 側で付く)。
 *
 *   npx tsx scripts/fill-spot-image-credits.ts --dry
 *   npx tsx scripts/fill-spot-image-credits.ts
 */
import "dotenv/config";
import db from "../utils/db";
import { lookupWikimediaFiles } from "./lib/commons";
import { headWithRetry } from "./lib/article-image";
import { wikimediaThumbUrl } from "../lib/og";

const DRY = process.argv.includes("--dry");

/** 配る幅。ヒーローは最大 1024px 幅の枠に出るので、標準の幅のうち 1280。 */
const SERVED_WIDTH = 1280;

/**
 * Commons の作者欄が表記に向かないファイルの、手で整えた表記。
 * キーは Commons のファイルページ。
 *
 * David Castor の写真は作者欄に「パブリックドメインに置く、使ったら一言
 * 欲しい」という数百字の文章がそのまま入っている。
 */
const CREDIT_OVERRIDES: Record<string, string> = {
  "https://commons.wikimedia.org/wiki/File:Saint_Martin_in_the_Fields-2.jpg":
    "David Castor / Public domain, via Wikimedia Commons",
};

type Row = {
  table: "Attraction" | "Museum" | "Artwork";
  id: string;
  label: string;
  image: string;
  imageCredit: string | null;
  imageLink: string | null;
};

const WIKIMEDIA = { contains: "wikimedia.org" };

async function main() {
  const rows: Row[] = [
    ...(
      await db.attraction.findMany({
        where: { image: WIKIMEDIA },
        select: { id: true, slug: true, image: true, imageCredit: true, imageLink: true },
      })
    ).map((r) => ({ table: "Attraction" as const, label: r.slug, ...r })),
    ...(
      await db.museum.findMany({
        where: { image: WIKIMEDIA },
        select: { id: true, slug: true, image: true, imageCredit: true, imageLink: true },
      })
    ).map((r) => ({ table: "Museum" as const, label: r.slug, ...r })),
    ...(
      await db.artwork.findMany({
        where: { image: WIKIMEDIA },
        select: { id: true, title: true, image: true, imageCredit: true, imageLink: true },
      })
    ).map((r) => ({ table: "Artwork" as const, label: r.title, ...r, image: r.image! })),
  ];

  // http:// で入っている行が1つあった(混在コンテンツとしてブラウザに
  // 弾かれうる)。https に揃えてから引き、そのまま書き戻す。
  for (const row of rows) row.image = row.image.replace(/^http:\/\//, "https://");

  const files = await lookupWikimediaFiles(
    rows.map((r) => r.image),
    SERVED_WIDTH,
  );

  let changed = 0;
  const nonFree: string[] = [];
  const missing: string[] = [];
  const unservable: string[] = [];

  for (const row of rows) {
    const where = `${row.table}/${row.label}`;
    const file = files.get(row.image);
    if (!file) {
      missing.push(`${where}: ${row.image}`);
      continue;
    }
    if (file.wiki !== "commons") {
      nonFree.push(`${where}: ${file.link}`);
      continue;
    }
    const credit = CREDIT_OVERRIDES[file.link] ?? file.credit;

    // 原本が 1280px より狭いと API は原本を返す。それでも 960px を超える
    // 写真は 1MB を超えることがあった(ハンプトン・コート宮殿 1.3MB)ので、
    // 1段下の 960px 版にする。SVG・TIFF は縮小版の拡張子が変わるので触らない。
    let served = file.servedUrl;
    if (
      served &&
      !served.includes("/thumb/") &&
      file.width > 960 &&
      /\.(jpe?g|png)$/i.test(served)
    ) {
      served = wikimediaThumbUrl(served, 960);
    }

    // 縮小版は要求されて初めて作られる。配れることを確かめてから入れる。
    let image = row.image;
    if (served && served !== row.image) {
      const check = await headWithRetry(served);
      const type = check.headers.get("content-type") ?? "";
      if (check.ok && type.startsWith("image/")) {
        image = served;
      } else {
        unservable.push(`${where}: ${check.status} ${served}`);
      }
    }

    if (
      image === row.image &&
      credit === row.imageCredit &&
      file.link === row.imageLink
    ) {
      continue;
    }

    console.log(
      `${where} (${file.width}x${file.height})\n` +
        (image !== row.image ? `  ${row.image}\n  → ${image}\n` : "") +
        `  ${credit}`,
    );
    if (!DRY) {
      // テーブル名はプレースホルダにできないので、固定の3つから選ぶ。
      if (row.table === "Attraction") {
        await db.$executeRaw`
          UPDATE "Attraction"
          SET image = ${image}, "imageSource" = 'commons', "imageCredit" = ${credit}, "imageLink" = ${file.link}
          WHERE id = ${row.id}`;
      } else if (row.table === "Museum") {
        await db.$executeRaw`
          UPDATE "Museum"
          SET image = ${image}, "imageSource" = 'commons', "imageCredit" = ${credit}, "imageLink" = ${file.link}
          WHERE id = ${row.id}`;
      } else {
        await db.$executeRaw`
          UPDATE "Artwork"
          SET image = ${image}, "imageSource" = 'commons', "imageCredit" = ${credit}, "imageLink" = ${file.link}
          WHERE id = ${row.id}`;
      }
    }
    changed += 1;
  }

  console.log(
    `\n${DRY ? "[dry] " : ""}Wikimedia の画像 ${rows.length}枚のうち ${changed}枚を更新した。`,
  );
  if (nonFree.length) {
    console.log(
      `\nCommons 以外の wiki の画像(非フリーの可能性が高い。差し替えが要る ${nonFree.length}枚):`,
    );
    for (const m of nonFree) console.log(`  ${m}`);
  }
  if (unservable.length) {
    console.log(`\n縮小版を配れなかった画像(URL は元のまま ${unservable.length}枚):`);
    for (const m of unservable) console.log(`  ${m}`);
  }
  if (missing.length) {
    console.log(`\nファイル情報を引けなかった画像(${missing.length}枚):`);
    for (const m of missing) console.log(`  ${m}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
