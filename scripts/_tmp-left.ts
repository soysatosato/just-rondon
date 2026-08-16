import db from "../utils/db";
async function main(){
  const ms=await db.musical.findMany({where:{storyHook:null},select:{slug:true,name:true}});
  console.log(ms.map(m=>m.slug).join("\n"), "\nTOTAL", ms.length);
}
main().finally(()=>process.exit(0));
