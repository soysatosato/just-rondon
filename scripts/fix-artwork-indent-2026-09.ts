/**
 * 作品解説(Artwork.description)の行頭インデントを落とす。
 *
 *   npx tsx scripts/fix-artwork-indent-2026-09.ts --dry
 *   npx tsx scripts/fix-artwork-indent-2026-09.ts
 *
 * ------------------------------------------------------------------
 * 何が起きていたか
 * ------------------------------------------------------------------
 * 太字の点検(scan-db-markdown-bold.ts)で national-gallery の作品解説に
 * 生の ** が残っているのを見つけたが、原因は太字ではなかった。
 *
 *   0|"本作は**フィンセント・ファン・ゴッホ**が1889年に制作した…"
 *   1|"          "
 *   2|"          背景の青緑色は**地中海の海水**を連想させ、…"
 *
 * 2行目以降が半角スペース10個で始まっている。CommonMark は行頭の
 * 空白4つ以上を「インデントされたコードブロック」と解釈するので、
 * この段落は丸ごと <pre><code> になる。等幅フォントの枠に入り、
 * 中の ** も強調されずそのまま出る。
 *
 * 元をたどるとテンプレート文字列で本文を書いたときのインデントが
 * そのまま入っている。読者の画面では段落が突然コードの見た目になり、
 * 横スクロールバーまで付く。太字が出ないことより、こちらのほうが目立つ。
 *
 * ------------------------------------------------------------------
 * 直し方
 * ------------------------------------------------------------------
 * 全行の行頭空白を落とし、空白だけの行は空行にする。
 *
 * 対象の6件はいずれも地の文だけで、箇条書きも引用も入っていない
 * (投入前に確認済み)。つまり意図のあるインデントが1つも無いので、
 * 一律に落として問題ない。逆に言うと、この方針は箇条書きの入れ子を
 * 壊しうるので、他のテーブルへ流用するときは必ず中身を確認すること。
 *
 * 安全策として、直したあとに描画して <pre> が消えたことを確かめ、
 * 消えていなければその行は書き換えない。
 *
 * ★ このスクリプトを先に流すこと。
 *   コードブロックの中では ** が「壊れた太字」に見えるので、
 *   先に fix-content-markdown-bold.ts を流すと、本来は生きている
 *   太字まで削除される(--strip)。インデント → 太字 の順で直す。
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import db from "../utils/db";

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

/** 行頭の空白を落とし、空白だけの行は空行にする。 */
function dedent(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^[ \t]+/, "").replace(/[ \t]+$/, ""))
    .join("\n");
}

async function main() {
  const dry = process.argv.includes("--dry");

  const artworks = await db.artwork.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      museum: { select: { slug: true } },
    },
  });

  let fixed = 0;
  const skipped: string[] = [];

  for (const a of artworks) {
    if (!a.description) continue;
    if (!renderMd(a.description).includes("<pre>")) continue;

    const label = `/museums/${a.museum.slug}/artworks "${a.title}"`;
    const next = dedent(a.description);

    if (next === a.description) {
      skipped.push(`${label}（インデント以外の原因）`);
      continue;
    }
    if (renderMd(next).includes("<pre>")) {
      skipped.push(`${label}（落としてもコードブロックが残る）`);
      continue;
    }

    console.log(`修正: ${label}`);
    const before = a.description.split("\n").find((l) => /^[ \t]{4,}\S/.test(l));
    if (before) console.log(`    - ${JSON.stringify(before.slice(0, 60))}`);
    if (!dry) {
      await db.artwork.update({ where: { id: a.id }, data: { description: next } });
    }
    fixed++;
  }

  console.log(dry ? "\n=== dry run ===" : "\n=== 修正しました ===");
  console.log(`修正した箇所: ${fixed}`);
  console.log(`手動が必要  : ${skipped.length}`);
  for (const s of skipped) console.log(`  ${s}`);

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
