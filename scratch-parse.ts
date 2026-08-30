import { PrismaClient } from "@prisma/client";
import { parseDurationMinutes, durationBucket, parsePriceGbp, priceBucket } from "./components/attractions/facts";
const db = new PrismaClient();
async function main() {
  const rows = await db.attraction.findMany({ where:{isPublished:true}, select:{name:true,durationText:true,priceAdult:true,isFree:true} });
  console.log("=== durationText 全種の解釈 ===");
  for (const v of [...new Set(rows.map(r=>r.durationText).filter(Boolean))].sort())
    console.log(String(parseDurationMinutes(v!)).padStart(5), durationBucket(v!)?.padEnd(6), "|", v);
  console.log("\n=== priceAdult 全種の解釈 ===");
  for (const v of [...new Set(rows.map(r=>r.priceAdult).filter(Boolean))].sort())
    console.log(String(parsePriceGbp(v!)).padStart(7), (priceBucket(v!)??"-").padEnd(8), "|", v);
  console.log("\n=== 解釈できなかった件数 ===");
  console.log("duration null:", rows.filter(r=>durationBucket(r.durationText)===null).length, "/", rows.length);
  console.log("price null:", rows.filter(r=>priceBucket(r.priceAdult)===null).length, "/", rows.length);
  console.log("\n=== isFree と priceAdult の食い違い ===");
  for (const r of rows) {
    const b = priceBucket(r.priceAdult);
    if (b === null) continue;
    if (r.isFree !== (b === "free")) console.log(`isFree=${r.isFree} price=${r.priceAdult} | ${r.name}`);
  }
}
main().finally(()=>db.$disconnect());
