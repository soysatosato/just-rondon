import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const rows = await db.attraction.findMany({ where:{isPublished:true}, select:{name:true,durationText:true,priceAdult:true,tagline:true,summary:true,image:true} });
  console.log("durationText 全種:");
  console.log([...new Set(rows.map(r=>r.durationText).filter(Boolean))].sort().join("\n"));
  console.log("\npriceAdult 全種:");
  console.log([...new Set(rows.map(r=>r.priceAdult).filter(Boolean))].sort().join("\n"));
  const tl = rows.map(r=>r.tagline?.length??0).sort((a,b)=>a-b);
  console.log("\ntagline 長さ: min",tl[0],"中央",tl[Math.floor(tl.length/2)],"max",tl[tl.length-1]);
  const im = rows.map(r=>r.image?.length??0).sort((a,b)=>a-b);
  console.log("image URL 長さ: 中央",im[Math.floor(im.length/2)],"max",im[im.length-1]);
}
main().finally(()=>db.$disconnect());
