/**
 * fix-content-markdown-bold.ts が直せなかった2節を、手で直す。
 *
 *   npx tsx scripts/fix-attraction-bold-opening-2026-09.ts        # ドライラン
 *   npx tsx scripts/fix-attraction-bold-opening-2026-09.ts --apply
 *
 * ------------------------------------------------------------------
 * なぜ自動で直せないのか
 * ------------------------------------------------------------------
 * あちらは「壊れている閉じ ** だけを見て最小限の変形をする」設計で、
 * 開きの ** には手を出さない。今回の2件は壊れているのが開き側にある。
 *
 *   行政側も**「建築として意義のあるもの」であれば…緩める**姿勢を示した
 *          ^^ ここが開けていない
 *
 * CommonMark で ** が開くには left-flanking である必要があり、直後が
 * 句読点(「 もそのひとつ)のときは、直前が空白か句読点でなければならない。
 * ここは直前が「も」なので開けず、対になる閉じ ** も宙に浮いて、
 * 両方が生の記号として出る。
 *
 * 直し方は箇所ごとに違う。開きを動かすということは強調の範囲を変える
 * ことなので、どこを強調したかったのかを読んで決めるしかない。
 * 機械化すると、書き手の意図と無関係な範囲が太字になる。
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

type Edit = {
  slug: string;
  displayOrder: number;
  from: string;
  to: string;
  why: string;
};

const EDITS: Edit[] = [
  {
    slug: "golders-hill-park-zoo",
    displayOrder: 3,
    from: "コレクションを**「英国の野生動物（Wildlife in Britain）」テーマ**に再編",
    to: "コレクションを「**英国の野生動物**（Wildlife in Britain）」テーマに再編",
    why: "強調したいのはテーマの名前。鉤括弧と原語の併記は外に出す",
  },
  {
    slug: "the-gherkin-30-st-mary-axe",
    displayOrder: 1,
    from: "行政側も**「建築として意義のあるもの」であれば従来の規制を緩める**姿勢を示した。",
    to: "行政側も、**「建築として意義のあるもの」であれば従来の規制を緩める**姿勢を示した。",
    why: "強調の範囲は原文のままでよい。読点を1つ足すと ** の直前が句読点になり開く",
  },
];

const APPLY = process.argv.includes("--apply");

async function main() {
  console.log(APPLY ? "== 適用 ==\n" : "== ドライラン(--apply で適用) ==\n");
  let done = 0;

  for (const e of EDITS) {
    const attraction = await db.attraction.findUnique({
      where: { slug: e.slug },
      select: { name: true, stories: { where: { displayOrder: e.displayOrder } } },
    });
    const story = attraction?.stories[0];

    if (!story) {
      console.error(`✗ ${e.slug} story#${e.displayOrder} が見つかりません`);
      process.exitCode = 1;
      continue;
    }

    if (!story.body.includes(e.from)) {
      // 既に直っているのか、本文が変わったのか。黙って通さない。
      const stillBroken = renderMd(story.body).includes("**");
      console.log(
        `- ${attraction!.name} story#${e.displayOrder}: 対象の文字列が無い` +
          `（${stillBroken ? "まだ壊れている。本文が変わった可能性" : "既に直っている"}）`,
      );
      continue;
    }

    const fixed = story.body.replace(e.from, e.to);
    if (renderMd(fixed).includes("**")) {
      console.error(`✗ ${attraction!.name} story#${e.displayOrder}: 直しても ** が残る`);
      process.exitCode = 1;
      continue;
    }

    console.log(`${attraction!.name} story#${e.displayOrder}  (${e.why})`);
    console.log(`    - ${e.from}`);
    console.log(`    + ${e.to}`);

    if (APPLY) {
      await db.attractionStory.update({ where: { id: story.id }, data: { body: fixed } });
      console.log("    → 適用");
    }
    console.log("");
    done++;
  }

  console.log(`対象 ${done}件`);
  if (!APPLY && done > 0) console.log("--apply を付けると適用します。");
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
