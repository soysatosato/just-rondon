import db from "../utils/db";
async function main() {
  const ms = await db.musical.findMany({
    where: { storyHook: null },
    orderBy: [{ recommendLevel: "desc" }],
    select: { slug: true, name: true, engName: true, original: true, summary: true, tagline: true, highlights: true, theatreName: true, description: true },
  });
  for (const m of ms) {
    console.log(`\n########## ${m.slug} | ${m.name} | ${m.engName} | ${m.theatreName}`);
    console.log(`TAGLINE: ${m.tagline} | ORIGINAL: ${m.original}`);
    console.log(`SUMMARY: ${m.summary}`);
    console.log(`HIGHLIGHTS: ${m.highlights.join(" / ")}`);
    console.log(`DESC:\n${m.description}`);
  }
  console.log("\nTOTAL", ms.length);
}
main().finally(() => process.exit(0));
