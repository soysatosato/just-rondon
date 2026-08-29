import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prisma } from "@prisma/client";
import db from "../utils/db";

/**
 * DB全体を舐めて、太字(**)が描画されない値を探す(読み取り専用)。
 *
 * 既存の点検は範囲が狭い:
 *   - scripts/fix-markdown-bold.ts      … ソースコードの静的文字列だけ
 *   - scripts/fix-content-markdown-bold.ts … Content と WeeklyBriefItem だけ
 *
 * Attraction / Artwork / Brand / Dish / Restaurant / Souvenir のように
 * 本文をDBに持つテーブルはどちらの網にも入っていない。ここでは
 * DMMF から String 系のフィールドを全部拾って、実際に描画して
 * 生の ** が残る値だけを報告する。直しはしない。
 *
 * 実行: npx tsx scripts/scan-db-markdown-bold.ts
 *      npx tsx scripts/scan-db-markdown-bold.ts --model=Attraction
 */

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

function broken(text: string): boolean {
  if (!text.includes("**")) return false;
  return renderMd(text).includes("**");
}

async function main() {
  const only = process.argv
    .find((a) => a.startsWith("--model="))
    ?.split("=")[1];

  const models = Prisma.dmmf.datamodel.models.filter(
    (m) => !only || m.name === only,
  );

  let total = 0;
  const perModel: Record<string, number> = {};

  for (const model of models) {
    const stringFields = model.fields
      .filter((f) => f.kind === "scalar" && f.type === "String")
      .map((f) => f.name);
    if (stringFields.length === 0) continue;

    const delegate = (db as never as Record<string, { findMany: (a: unknown) => Promise<Record<string, unknown>[]> }>)[
      model.name.charAt(0).toLowerCase() + model.name.slice(1)
    ];
    if (!delegate?.findMany) continue;

    const idField =
      model.fields.find((f) => f.isId)?.name ??
      model.fields.find((f) => f.name === "slug")?.name ??
      stringFields[0];

    let rows: Record<string, unknown>[];
    try {
      rows = await delegate.findMany({});
    } catch {
      continue;
    }

    for (const row of rows) {
      for (const field of stringFields) {
        const value = row[field];
        if (typeof value !== "string") continue;
        if (!broken(value)) continue;

        total++;
        perModel[model.name] = (perModel[model.name] ?? 0) + 1;

        const where = `${model.name}[${String(row[idField])}].${field}`;
        const at = value.indexOf("**");
        console.log(`${where}\n    …${value.slice(Math.max(0, at - 30), at + 70).replace(/\n/g, " ")}…`);
      }
    }
  }

  console.log("\n=== まとめ ===");
  for (const [m, n] of Object.entries(perModel).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${m}: ${n}`);
  }
  console.log(`合計 ${total} 件`);
  await db.$disconnect();
}

main();
