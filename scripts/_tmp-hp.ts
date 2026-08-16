import db from "../utils/db";
async function main() {
  const m = await db.musical.findUnique({ where: { slug: "harry-potter-cursed-child" },
    select: { runtimeMinutes: true, intervalMinutes: true, minAgeGuidance: true, englishForm: true, englishNote: true, factsVerifiedAt: true, tagline: true, summary: true, highlights: true }});
  console.log(m);
}
main().finally(()=>process.exit(0));
