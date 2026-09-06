import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// tsconfig の jsx は "preserve"(Next が変換する前提)なので、Next の外で
// 走らせるこのスクリプトでは React を自分で名前空間に入れる必要がある。
import React from "react";
import { ImageResponse } from "next/og";

import { OG_SIZE, loadOgFonts, ogFontOption } from "../lib/og";
import { OG_THEMES, OgCard, ogCardText } from "../components/og/OgCard";

/**
 * サイト全体の既定OG画像 public/og/default.png を書き出す。
 *
 * 既定画像だけは動的ルートにしない。自前の画像を持たないページすべてが
 * これを指すので、ルートが一度でも落ちるとサイト中の共有カードが同時に
 * 画像を失う。ここで1枚のPNGにしてリポジトリに置く。
 *
 * 差し替えるとき:  npx tsx --env-file=.env scripts/render-default-og.tsx
 * 生成したPNGは必ずコミットすること。ビルド時には走らない。
 */

const CARD = {
  badge: "JUST RONDON",
  head: "ロンドンとイギリスの、歩き方",
  tail: "観光・美術館・ミュージカル・イベントから、暮らしとビザの実務まで。",
  glyph: "英",
  photo: null,
  theme: OG_THEMES.site,
};

async function main() {
  const fonts = await loadOgFonts(ogCardText(CARD), [400, 700]);
  if (!fonts.length) {
    throw new Error(
      "日本語フォントを取得できませんでした。豆腐のカードを書き出さないよう中止します。",
    );
  }

  const response = new ImageResponse(<OgCard {...CARD} />, {
    ...OG_SIZE,
    ...ogFontOption(fonts),
  });

  const out = path.join(process.cwd(), "public", "og", "default.png");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await response.arrayBuffer()));
  console.log(`wrote ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
