/**
 * 大英博物館の「クレオパトラのミイラ」が2行あったのを1行にまとめる(2026-10-30)。
 *
 *   npx tsx scripts/merge-cleopatra-artwork-2026-10.ts                   # 変更を出すだけ
 *   npx tsx scripts/merge-cleopatra-artwork-2026-10.ts --apply           # 1段目
 *   npx tsx scripts/merge-cleopatra-artwork-2026-10.ts --apply --delete  # 2段目(push 後)
 *
 * 2行はどちらも、テーベのソテル家の女性クレオパトラ(2世紀)のミイラを指す。
 *
 * - 6690fd10「クレオパトラのミイラ」: 検索で見られている側(Search Console の
 *   90日で約170表示、「クレオパトラ ミイラ」)。ただし写真は別の作品
 *   (嵐の神を描いた玄武岩のレリーフ)で、必見の印も無かった。
 * - ed145783「クレオパトラ:若い女性のミイラ」: 館のページの「見どころ作品」に
 *   出る側。写真は正しく、解説は scripts/rewrite-museum-artworks.ts で
 *   書き直したもの。制作年の欄だけ「紀元前後頃」で、本文の「紀元後2世紀ごろ」と
 *   食い違っていた。
 *
 * Google が覚えている 6690fd10 の URL を残し、写真・解説・見どころ・必見の印を
 * ed145783 から移す。制作年は 6690fd10 の「ローマ時代、2世紀前半」のまま。
 * 棺の蓋と底板(61c2115a・2003e74d)は別の資料なので残す。
 *
 * 2段に分けてあるのは、ed145783 の URL を 6690fd10 へ送る転送
 * (lib/museums/merged-artworks.js → next.config.mjs)が本番に出る前に行を
 * 消すと、その URL が中身の無いページになるため。
 *
 * - 1段目: 6690fd10 を直し、ed145783 の必見の印を外す(館のページに2枚
 *   並ばないように)。ed145783 のページはそのまま開ける。
 * - 2段目: 本番で転送が効いているのを確かめてから ed145783 を消す。
 *   転送が返らなければ消さずに止まる。
 *
 * 消した行はバックアップ(backup-db、2026-10-30 23:31)から戻せる。
 */

import db from "../utils/db";

const APPLY = process.argv.includes("--apply");
const DELETE = process.argv.includes("--delete");

const KEEP = {
  id: "6690fd10-3de2-453c-90b9-684ce80e89ea",
  title: "クレオパトラのミイラ",
};

const MERGED = {
  id: "ed145783-27ea-4f69-8df7-75ceadb7965b",
  title: "クレオパトラ：若い女性のミイラ",
};

const SITE = "https://www.just-rondon.com";
const artworkPath = (id: string) => `/museums/british-museum/artworks/${id}`;

/** 本番で ed145783 の URL が 6690fd10 へ恒久転送されているか。 */
async function redirectIsLive(): Promise<boolean> {
  const res = await fetch(`${SITE}${artworkPath(MERGED.id)}`, {
    redirect: "manual",
  });
  const location = res.headers.get("location") ?? "";
  return (
    (res.status === 301 || res.status === 308) &&
    location.endsWith(artworkPath(KEEP.id))
  );
}

async function main() {
  const [keep, merged] = await Promise.all([
    db.artwork.findUnique({
      where: { id: KEEP.id },
      include: { museum: { select: { slug: true } } },
    }),
    db.artwork.findUnique({
      where: { id: MERGED.id },
      include: { museum: { select: { slug: true } } },
    }),
  ]);

  if (!keep || keep.title !== KEEP.title) {
    throw new Error(`残す行 ${KEEP.id} が「${KEEP.title}」ではない`);
  }
  if (!merged) {
    console.log(`まとめる行 ${MERGED.id} はもう無い。適用済みとみなして終わる。`);
    return;
  }
  if (merged.title !== MERGED.title) {
    throw new Error(`まとめる行 ${MERGED.id} が「${MERGED.title}」ではない`);
  }
  if (
    keep.museum.slug !== "british-museum" ||
    merged.museum.slug !== "british-museum"
  ) {
    throw new Error("どちらかの行が大英博物館のものではない");
  }

  if (DELETE) {
    if (keep.image !== merged.image) {
      throw new Error("1段目がまだ。先に --apply だけで流す");
    }
    if (!(await redirectIsLive())) {
      throw new Error(
        `本番で ${artworkPath(MERGED.id)} がまだ転送されていない。push 後にもう一度`,
      );
    }
    console.log(`消す: ${merged.id} ${merged.title}(転送は本番で確認済み)`);
    if (!APPLY) {
      console.log("\n--apply を付けると書き込みます。");
      return;
    }
    await db.artwork.delete({ where: { id: MERGED.id } });
    console.log("\n消しました。");
    return;
  }

  const update = {
    image: merged.image,
    imageSource: merged.imageSource,
    imageCredit: merged.imageCredit,
    imageLink: merged.imageLink,
    description: merged.description,
    highlights: merged.highlights,
    mustSee: true,
    recommendLevel: Math.max(keep.recommendLevel, merged.recommendLevel),
  };

  console.log(`直す: ${keep.id} ${keep.title}(${keep.year} / ${keep.room})`);
  console.log(`  写真: ${keep.image}`);
  console.log(`     → ${update.image}`);
  console.log(`  必見: ${keep.mustSee} → ${update.mustSee}`);
  console.log(
    `  解説: ${keep.description?.length ?? 0}字 → ${update.description?.length ?? 0}字`,
  );
  console.log(
    `  見どころ: ${keep.highlights.length}件 → ${update.highlights.length}件`,
  );
  console.log(`必見を外す: ${merged.id} ${merged.title}(${merged.year})`);

  if (!APPLY) {
    console.log("\n--apply を付けると書き込みます。");
    return;
  }

  await db.$transaction([
    db.artwork.update({ where: { id: KEEP.id }, data: update }),
    db.artwork.update({ where: { id: MERGED.id }, data: { mustSee: false } }),
  ]);
  console.log(
    "\n書き込みました。push して転送が本番に出たら --apply --delete で行を消す。",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
