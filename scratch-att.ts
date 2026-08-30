import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const total = await db.attraction.count({ where: { isPublished: true } });
  const all = await db.attraction.count();
  console.log("published:", total, "/ all:", all);
  const rows = await db.attraction.findMany({
    where: { isPublished: true },
    select: { slug:true, name:true, category:true, area:true, recommendLevel:true, mustSee:true,
      isForKids:true, isFree:true, priceAdult:true, durationText:true, nearestStation:true,
      openingHours:true, summary:true, tagline:true, views:true },
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });
  const by = (f:(r:any)=>any) => { const m=new Map<string,number>(); for(const r of rows){const k=String(f(r));m.set(k,(m.get(k)??0)+1);} return [...m].sort((a,b)=>b[1]-a[1]); };
  console.log("\ncategory:", by(r=>r.category));
  console.log("\narea:", by(r=>r.area));
  console.log("\nrecommendLevel:", by(r=>r.recommendLevel).sort());
  console.log("\nmustSee:", rows.filter(r=>r.mustSee).length, "kids:", rows.filter(r=>r.isForKids).length, "free:", rows.filter(r=>r.isFree).length);
  console.log("\n欠損 — priceAdult:", rows.filter(r=>!r.priceAdult).length,
    "durationText:", rows.filter(r=>!r.durationText).length,
    "nearestStation:", rows.filter(r=>!r.nearestStation).length,
    "openingHours:", rows.filter(r=>!r.openingHours).length,
    "summary:", rows.filter(r=>!r.summary).length,
    "tagline:", rows.filter(r=>!r.tagline).length,
    "area:", rows.filter(r=>!r.area).length);
  console.log("\nsummary長さ 中央値:", (()=>{const l=rows.map(r=>r.summary?.length??0).sort((a,b)=>a-b);return l[Math.floor(l.length/2)];})());
  console.log("durationText 例:", [...new Set(rows.map(r=>r.durationText).filter(Boolean))].slice(0,20));
  console.log("priceAdult 例:", [...new Set(rows.map(r=>r.priceAdult).filter(Boolean))].slice(0,15));
}
main().finally(()=>db.$disconnect());
