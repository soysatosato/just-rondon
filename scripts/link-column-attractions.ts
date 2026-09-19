/**
 * コラムと観光スポットの対応(ContentAttraction)を見る・候補を出す・登録する。
 *
 *   # 本文にスポット名が出てくる箇所を洗い出す(登録済みには [済] が付く)
 *   npx tsx scripts/link-column-attractions.ts suggest [<columnSlug>]
 *   # 同じ候補を apply の形式の JSON で出す(読んで削ってから apply に渡す)
 *   npx tsx scripts/link-column-attractions.ts suggest --json > links.json
 *   # 登録前の下書き(create-column.ts に渡す JSON)から候補を出す
 *   npx tsx scripts/link-column-attractions.ts suggest --file <payload.json>
 *
 *   # 登録済みの対応を見る
 *   npx tsx scripts/link-column-attractions.ts list [<columnSlug>]
 *
 *   # 1本のコラムの対応を、渡した slug の並びで丸ごと置き換える(0個で解除)
 *   npx tsx scripts/link-column-attractions.ts set <columnSlug> [<attractionSlug>...]
 *   # { "<columnSlug>": ["<attractionSlug>", ...] } の JSON でまとめて置き換える
 *   npx tsx scripts/link-column-attractions.ts apply <links.json>
 *
 * suggest は名前一致で拾うだけなので、通りすがりの言及も混ざる。
 * 出てきた抜粋を読み、そのスポット自体が話題になっているものだけを
 * set / apply に渡すこと(判断の目安は ContentAttraction のコメント)。
 *
 * set / apply はどちらも「置き換え」。渡さなかったスポットの対応は消える。
 * 並び順(displayOrder)は渡した順になる。
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import db from "../utils/db";
import {
  columnText,
  findMentions,
  loadAttractionMatchers,
  resolveAttractionSlugs,
} from "./lib/column-attractions";

async function findColumn(slug: string) {
  const column = await db.content.findFirst({
    where: { slug, category: "column" },
    select: { id: true, title: true, slug: true },
  });
  if (!column) throw new Error(`Column not found: ${slug}`);
  return column;
}

async function suggest(args: string[]) {
  const asJson = args.includes("--json");
  const fileIdx = args.indexOf("--file");
  const rest = args.filter(
    (a, i) =>
      a !== "--json" && (fileIdx === -1 || (i !== fileIdx && i !== fileIdx + 1)),
  );
  const matchers = await loadAttractionMatchers();

  type Target = { slug: string; title: string; text: string; linked: Set<string> };
  let targets: Target[];

  if (fileIdx !== -1) {
    const path = args[fileIdx + 1];
    if (!path) throw new Error("--file needs a path");
    const payload = JSON.parse(readFileSync(path, "utf-8"));
    targets = [
      {
        slug: "",
        title: payload.title,
        text: columnText(payload),
        linked: new Set<string>(payload.attractions ?? []),
      },
    ];
  } else {
    const columns = await db.content.findMany({
      where: { category: "column", ...(rest[0] ? { slug: rest[0] } : {}) },
      orderBy: { createdAt: "asc" },
      select: {
        slug: true,
        title: true,
        summary: true,
        mainText: true,
        sections: {
          select: {
            title: true,
            subtitle: true,
            description: true,
            displayOrder: true,
          },
        },
        attractionLinks: { select: { attraction: { select: { slug: true } } } },
      },
    });
    if (rest[0] && columns.length === 0) {
      throw new Error(`Column not found: ${rest[0]}`);
    }
    targets = columns.map((c) => ({
      slug: c.slug,
      title: c.title,
      text: columnText(c),
      linked: new Set(c.attractionLinks.map((l) => l.attraction.slug)),
    }));
  }

  const json: Record<string, string[]> = {};
  for (const t of targets) {
    const mentions = findMentions(t.text, matchers);
    if (mentions.length === 0 && t.linked.size === 0) continue;

    if (asJson) {
      json[t.slug] = mentions.map((m) => m.slug);
      continue;
    }

    console.log(`\n■ ${t.title}\n  ${t.slug ? `/column/${t.slug}` : "(下書き)"}`);
    for (const m of mentions) {
      const mark = t.linked.has(m.slug) ? "[済]" : "[  ]";
      console.log(`  ${mark} ${m.name} (${m.slug}) ×${m.count}`);
      console.log(`       …${m.excerpt}…`);
    }
    // 登録済みなのに本文から名前が消えているもの。書き換えで消えた可能性がある。
    const mentioned = new Set(mentions.map((m) => m.slug));
    for (const slug of t.linked) {
      if (!mentioned.has(slug)) {
        console.log(`  [済] ${slug} — 本文に名前が見当たらない`);
      }
    }
  }

  if (asJson) console.log(JSON.stringify(json, null, 2));
}

async function list(args: string[]) {
  const links = await db.contentAttraction.findMany({
    where: {
      content: { category: "column", ...(args[0] ? { slug: args[0] } : {}) },
    },
    orderBy: [{ contentId: "asc" }, { displayOrder: "asc" }],
    select: {
      content: { select: { slug: true, title: true } },
      attraction: { select: { slug: true, name: true, isPublished: true } },
    },
  });

  let current = "";
  for (const l of links) {
    if (l.content.slug !== current) {
      current = l.content.slug;
      console.log(`\n■ ${l.content.title}\n  /column/${l.content.slug}`);
    }
    const hidden = l.attraction.isPublished ? "" : " (非公開・表示されない)";
    console.log(`  - ${l.attraction.name} (${l.attraction.slug})${hidden}`);
  }
  console.log(`\n${links.length} links`);
}

/** 1本のコラムの対応を丸ごと置き換える。 */
async function replaceLinks(contentId: string, attractionIds: string[]) {
  await db.$transaction([
    db.contentAttraction.deleteMany({ where: { contentId } }),
    db.contentAttraction.createMany({
      data: attractionIds.map((attractionId, i) => ({
        contentId,
        attractionId,
        displayOrder: i,
      })),
    }),
  ]);
}

async function set(args: string[]) {
  const [columnSlug, ...attractionSlugs] = args;
  if (!columnSlug) {
    throw new Error("Usage: set <columnSlug> [<attractionSlug>...]");
  }
  const column = await findColumn(columnSlug);
  const ids = await resolveAttractionSlugs(attractionSlugs);
  await replaceLinks(column.id, ids);
  console.log(`${column.slug}: ${ids.length} links`);
}

async function apply(args: string[]) {
  const path = args[0];
  if (!path) throw new Error("Usage: apply <links.json>");
  const plan: Record<string, string[]> = JSON.parse(readFileSync(path, "utf-8"));

  // 1本でも誤りがあれば何も書かない。途中まで書かれると、
  // どこまで反映されたかを後から追うのが面倒になる。
  const resolved: { id: string; slug: string; attractionIds: string[] }[] = [];
  for (const [columnSlug, attractionSlugs] of Object.entries(plan)) {
    const column = await findColumn(columnSlug);
    try {
      const attractionIds = await resolveAttractionSlugs(attractionSlugs);
      resolved.push({ id: column.id, slug: column.slug, attractionIds });
    } catch (e) {
      throw new Error(`${columnSlug}: ${(e as Error).message}`);
    }
  }

  for (const r of resolved) {
    await replaceLinks(r.id, r.attractionIds);
    console.log(`${r.slug}: ${r.attractionIds.length} links`);
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "suggest":
      return suggest(args);
    case "list":
      return list(args);
    case "set":
      return set(args);
    case "apply":
      return apply(args);
    default:
      throw new Error("Usage: link-column-attractions.ts suggest|list|set|apply ...");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
