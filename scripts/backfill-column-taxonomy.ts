// tags / seriesName / seriesOrder 追加時点で既に存在していたコラム15本に、
// 手作業で分類を与える一度きりのスクリプト。
// 冪等なので再実行しても安全（該当 slug が無ければスキップする）。
import "dotenv/config";
import db from "../utils/db";

type Assignment = {
  slug: string;
  tags: string[];
  seriesName?: string;
  seriesOrder?: number;
};

const WREN = "クリストファー・レン物語";
const WESTWOOD = "ヴィヴィアン・ウェストウッド物語";

const ASSIGNMENTS: Assignment[] = [
  {
    slug: "the-woman-who-sold-time-104-years-of-carrying-a-single-pocket-watch-across-london",
    tags: ["history", "person", "daily"],
  },
  {
    slug: "why-british-postboxes-change-their-letters-with-every-monarch-and-the-one-that-got-blown-up",
    tags: ["institution", "daily"],
  },
  {
    slug: "the-tree-that-sheds-its-soot-why-the-london-plane-alone-survived-the-air-of-the-industrial-revolution",
    tags: ["city", "history"],
  },
  {
    slug: "why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping",
    tags: ["institution", "history"],
  },
  {
    slug: "why-not-even-a-nazi-bomb-could-stop-the-tower-of-londons-ceremony-of-the-keys",
    tags: ["institution", "history", "city"],
  },
  {
    slug: "the-dame-who-rode-a-tank-from-the-palace-twirl-to-a-quiet-house-in-clapham-the-vivienne-westwood-story-part-3-final",
    tags: ["person", "history"],
    seriesName: WESTWOOD,
    seriesOrder: 3,
  },
  {
    slug: "she-dug-up-the-clothes-feminism-hated-the-punk-who-haunted-the-wallace-collection-the-vivienne-westwood-story-part-2",
    tags: ["person", "history"],
    seriesName: WESTWOOD,
    seriesOrder: 2,
  },
  {
    slug: "the-primary-school-teacher-who-sewed-punk-s-uniform-nine-years-at-430-king-s-road-the-vivienne-westwood-story-part-1",
    tags: ["person", "history"],
    seriesName: WESTWOOD,
    seriesOrder: 1,
  },
  {
    slug: "why-a-single-old-penny-keeps-big-ben-on-time",
    tags: ["city", "daily", "institution"],
  },
  {
    slug: "why-every-british-plug-has-a-fuse-built-inside",
    tags: ["daily"],
  },
  {
    slug: "a-dome-hidden-inside-the-dome-the-35-year-secret-of-st-paul-s-cathedral-the-christopher-wren-story-part-3-final",
    tags: ["person", "city", "history"],
    seriesName: WREN,
    seriesOrder: 3,
  },
  {
    slug: "how-a-london-church-steeple-gave-the-wedding-cake-its-shape-the-christopher-wren-story-part-2",
    tags: ["person", "city", "history"],
    seriesName: WREN,
    seriesOrder: 2,
  },
  {
    slug: "the-scientist-who-injected-a-dog-with-opium-later-redesigned-london-s-skyline-the-christopher-wren-story-part-1",
    tags: ["person", "city", "history"],
    seriesName: WREN,
    seriesOrder: 1,
  },
  {
    slug: "the-door-slammed-in-the-king-s-face-how-one-day-in-1642-still-choreographs-british-parliament",
    tags: ["institution", "history"],
  },
  {
    slug: "the-knowledge-why-london-cabbies-spend-four-years-memorising-the-city",
    tags: ["city", "daily"],
  },
];

async function main() {
  let updated = 0;
  let missing: string[] = [];

  for (const a of ASSIGNMENTS) {
    const existing = await db.content.findFirst({
      where: { slug: a.slug, category: "column" },
      select: { id: true },
    });

    if (!existing) {
      missing.push(a.slug);
      continue;
    }

    await db.content.update({
      where: { id: existing.id },
      data: {
        tags: a.tags,
        seriesName: a.seriesName ?? null,
        seriesOrder: a.seriesOrder ?? null,
      },
    });
    updated += 1;
  }

  console.log(`Updated ${updated} columns.`);
  if (missing.length) {
    console.log(`Slug not found (skipped):\n  ${missing.join("\n  ")}`);
  }

  const untagged = await db.content.findMany({
    where: { category: "column", tags: { isEmpty: true } },
    select: { slug: true },
  });
  if (untagged.length) {
    console.log(
      `\nWARNING: ${untagged.length} column(s) still have no tags:\n  ${untagged
        .map((c) => c.slug)
        .join("\n  ")}`,
    );
  } else {
    console.log("All columns have at least one tag.");
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
