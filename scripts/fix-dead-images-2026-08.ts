/**
 * 死んでいる画像URLの修復（2026-08）。
 *
 * 1) Wikimedia のサムネイル生成が許可サイズのホワイトリスト制になり、
 *    2560px / 1024px / 800px を指定した URL が 400 を返すようになった。
 *    許可されているのは 250 / 500 / 1280 / 1920 など決まった幅だけ。
 *    → /thumb/ を使っている該当URLの幅を 1280px に寄せる。
 *
 * 2) フォース・プラインスの画像は Commons から元ファイルごと消えて 404。
 *    台座の作品は1〜2年で入れ替わるため、作品固有の写真は必ず古くなる。
 *    作品が写っていない「空の台座」の写真に差し替えて寿命を延ばす。
 *
 * 冪等。--dry で差分だけ表示する。
 */
import db from "@/utils/db";

const DRY = process.argv.includes("--dry");

/** Wikimedia が生成を許可するサムネ幅。ここに無い幅は 400 になる。 */
const ALLOWED_THUMB_WIDTH = 1280;

/** 消えた元ファイルの差し替え先。key は現在の URL。 */
const REPLACEMENTS: Record<string, string> = {
  "https://upload.wikimedia.org/wikipedia/commons/c/c9/Teresa_Margolles%27s_Fourth_Plinth_sculpture_2024-09-26.jpg":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/The_Fourth_Plinth_in_Trafalgar_Square_between_exhibits_-_the_empty_plinth.jpg/1280px-The_Fourth_Plinth_in_Trafalgar_Square_between_exhibits_-_the_empty_plinth.jpg",
};

/** 400 を返す幅のサムネURLだけを 1280px に書き換える。それ以外は素通し。 */
function repair(url: string): string {
  if (REPLACEMENTS[url]) return REPLACEMENTS[url];
  if (!url.includes("upload.wikimedia.org/") || !url.includes("/thumb/")) {
    return url;
  }
  return url.replace(
    /\/(\d+)px-/,
    (whole, width) =>
      Number(width) === ALLOWED_THUMB_WIDTH
        ? whole
        : `/${ALLOWED_THUMB_WIDTH}px-`,
  );
}

/** 実際に壊れていた URL だけを直したいので、対象を明示して取り違えを防ぐ。 */
const BROKEN = new Set<string>([
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Household_Cavalry_Museum_-_Joy_of_Museums.jpg/2560px-Household_Cavalry_Museum_-_Joy_of_Museums.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Wimbledon_Lawn_Tennis_Museum_%28485259229%29.jpg/2560px-Wimbledon_Lawn_Tennis_Museum_%28485259229%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Attus_Amip_displayed_at_Japan_House%2C_West_London.jpg/1024px-Attus_Amip_displayed_at_Japan_House%2C_West_London.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Design_Museum_%282%29_%28geograph_5246509%29.jpg/2560px-Design_Museum_%282%29_%28geograph_5246509%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Keats_House.jpg/2560px-Keats_House.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/RAF_Museum_Cosford_%2850091747782%29.jpg/2560px-RAF_Museum_Cosford_%2850091747782%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Coultauld_Galleries.jpg/2560px-Coultauld_Galleries.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/National_Army_Museum_-_Joy_of_Museums.jpg/2560px-National_Army_Museum_-_Joy_of_Museums.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Clink_Prison_Museum%2C_Soho_Wharf%2C_Clink_Street%2C_London%2C_United_Kingdom.JPG/1024px-Clink_Prison_Museum%2C_Soho_Wharf%2C_Clink_Street%2C_London%2C_United_Kingdom.JPG",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sir_John_Soane_Museum_%2813952611347%29.jpg/800px-Sir_John_Soane_Museum_%2813952611347%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/The_Viktor_Wynd_Museum_cabinet_of_curiosities_26.jpg/2560px-The_Viktor_Wynd_Museum_cabinet_of_curiosities_26.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Fashion_and_Textile_Museum%2C_Bermondsey%2C_SE1_%283612012652%29.jpg/2560px-Fashion_and_Textile_Museum%2C_Bermondsey%2C_SE1_%283612012652%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/The_V%26A_John_Madejski_Garden-8674_copy.jpg/2560px-The_V%26A_John_Madejski_Garden-8674_copy.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/London_Transport_Museum_%2842206944281%29.jpg/2560px-London_Transport_Museum_%2842206944281%29.jpg",
  ...Object.keys(REPLACEMENTS),
]);

async function main() {
  let changed = 0;

  const museums = await db.museum.findMany({
    select: { id: true, slug: true, image: true },
  });
  for (const m of museums) {
    if (!BROKEN.has(m.image)) continue;
    const next = repair(m.image);
    if (next === m.image) continue;
    console.log(`museum   ${m.slug}\n  - ${m.image}\n  + ${next}`);
    changed++;
    if (!DRY) {
      await db.museum.update({ where: { id: m.id }, data: { image: next } });
    }
  }

  const attractions = await db.attraction.findMany({
    select: { id: true, slug: true, image: true },
  });
  for (const a of attractions) {
    if (!BROKEN.has(a.image)) continue;
    const next = repair(a.image);
    if (next === a.image) continue;
    console.log(`spot     ${a.slug}\n  - ${a.image}\n  + ${next}`);
    changed++;
    if (!DRY) {
      await db.attraction.update({ where: { id: a.id }, data: { image: next } });
    }
  }

  const artworks = await db.artwork.findMany({
    select: { id: true, title: true, image: true },
  });
  for (const w of artworks) {
    if (!w.image || !BROKEN.has(w.image)) continue;
    const next = repair(w.image);
    if (next === w.image) continue;
    console.log(`artwork  ${w.title}\n  - ${w.image}\n  + ${next}`);
    changed++;
    if (!DRY) {
      await db.artwork.update({ where: { id: w.id }, data: { image: next } });
    }
  }

  console.log(`\n${DRY ? "[dry] " : ""}${changed} 件`);
}

main().finally(() => process.exit(0));
