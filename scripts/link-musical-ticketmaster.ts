/**
 * Musical.ticketmasterAttractionId を埋める。
 *
 * 紐づけを自動でやらない理由。作品名での名寄せは実際に誤答を出した:
 *
 * - Lyric Theatre の "Hadestown (Touring)" が DB の Hadestown に一致した。
 *   ツアー公演で、しかも Lyric は DB 上 MJ The Musical の劇場。
 * - New Cross Inn の "Hell-Bent Cabaret" が Kit Kat Club の Cabaret に一致した。
 *
 * どちらも「劇場も名前もそれらしい別公演」で、機械には見分けがつかない。
 * 誤った日程を正しい作品として出すのは、日程を出さないより有害なので、
 * 下の対応表は人が1件ずつ TM の attraction を開いて確認したものだけを持つ。
 *
 * 確認手順(新しい作品を足すとき):
 *   1. venues.json?keyword=<劇場名>&countryCode=GB で venueId を得る
 *   2. events.json?venueId=<id> でその劇場の在庫を見る
 *   3. events.json?attractionId=<id> で会場と都市がロンドンか確かめる
 *   4. 確認できたら下の表に足す
 *
 * 実行: npx tsx scripts/link-musical-ticketmaster.ts
 *      npx tsx scripts/link-musical-ticketmaster.ts --dry
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * slug → Ticketmaster attraction ID。
 *
 * 2026-08-15 に events.json?attractionId=... を叩き、会場名と city が
 * ロンドンであること、DB の劇場と一致することを1件ずつ確認済み。
 */
const LINKS: Record<string, { attractionId: string; tmName: string; theatre: string }> = {
  "harry-potter-cursed-child": {
    // TM 側の表示名は "(NY)" だが、実データは Palace Theatre, London。
    // 名前で弾くと取りこぼすので、会場で確認して採用している。
    attractionId: "K8vZ917p1_0",
    tmName: "Harry Potter and the Cursed Child (NY)",
    theatre: "Palace Theatre",
  },
  "phantom-of-the-opera": {
    attractionId: "K8vZ91713Z0",
    tmName: "The Phantom of the Opera",
    theatre: "His Majesty's Theatre",
  },
  "les-miserables": {
    // TM は "Les Miserables"(アクセントなし)。DB は "Les Misérables"。
    attractionId: "K8vZ91713Z7",
    tmName: "Les Miserables",
    theatre: "Sondheim Theatre",
  },
  "disneys-the-lion-king": {
    attractionId: "K8vZ9175EgV",
    tmName: "Disney's The Lion King (UK)",
    theatre: "Lyceum Theatre",
  },
  hamilton: {
    attractionId: "K8vZ9174iH7",
    tmName: "Hamilton (UK)",
    theatre: "Victoria Palace Theatre",
  },
  "mamma-mia": {
    attractionId: "K8vZ9171LHV",
    tmName: "Mamma Mia! (International)",
    theatre: "Novello Theatre",
  },
  "matilda-the-musical": {
    attractionId: "K8vZ917CN40",
    tmName: "Matilda The Musical",
    theatre: "Cambridge Theatre",
  },
  "the-mousetrap": {
    attractionId: "K8vZ9171II0",
    tmName: "The Mousetrap",
    theatre: "St Martin's Theatre",
  },
  "the-book-of-mormon": {
    attractionId: "K8vZ9172Hm0",
    tmName: "The Book of Mormon (London)",
    theatre: "Prince of Wales Theatre",
  },
  "moulin-rouge": {
    attractionId: "K8vZ917__60",
    tmName: "Moulin Rouge! The Musical (UK)",
    theatre: "Piccadilly Theatre",
  },
  "the-devil-wears-prada": {
    attractionId: "K8vZ917hgV0",
    tmName: "The Devil Wears Prada (London)",
    theatre: "Dominion Theatre",
  },
  "stranger-things": {
    attractionId: "K8vZ917h_4V",
    tmName: "Stranger Things",
    theatre: "Phoenix Theatre",
  },
  wicked: {
    attractionId: "K8vZ91739jf",
    tmName: "Wicked (London)",
    theatre: "Apollo Victoria Theatre",
  },
  six: {
    // Arts Theatre から Vaudeville へ移転済み(2026-08-15 に確認し DB を更新)。
    attractionId: "K8vZ917pTE0",
    tmName: "SIX The Musical",
    theatre: "Vaudeville Theatre",
  },
  oliver: {
    // "(Touring)" 付きだが実データは Gielgud Theatre, London の243公演。
    // 同名の "Oliver"[K8vZ9171NiV] は米国の地方公演なので採ってはいけない。
    // 名前だけで選ぶと確実に間違える例。
    attractionId: "K8vZ917Gxt7",
    tmName: "Oliver! (Touring)",
    theatre: "Gielgud Theatre",
  },
  "my-neighbour-totoro": {
    // National Theatre 直販だと思っていたが、Gillian Lynne へ移って
    // TM に在庫が出ていた。劇場が変わると在庫の有無も変わる。
    attractionId: "K8vZ917Q_u0",
    tmName: "My Neighbour Totoro",
    theatre: "Gillian Lynne Theatre",
  },
  "the-play-that-goes-wrong": {
    // "(Touring)"[K8vZ917pKs0] と "(NY)"[K8vZ917qo07] は別公演。
    attractionId: "K8vZ917o5sf",
    tmName: "The Play That Goes Wrong",
    theatre: "Duchess Theatre",
  },
  titanique: {
    // "(NY)"[K8vZ917qp-0] はブロードウェイ、"La parodie musicale" は仏語版。
    attractionId: "K8vZ917qa5V",
    tmName: "Titanique",
    theatre: "Criterion Theatre",
  },
  "magic-mike-live": {
    attractionId: "K8vZ917flwV",
    tmName: "Magic Mike Live",
    theatre: "The Theatre at the Hippodrome Casino",
  },
  cabaret: {
    // 同名の別 attraction [K8vZpaFK5e] と、New Cross Inn の
    // "Hell-Bent Cabaret" が紛らわしい。会場が Playhouse であることで確定。
    attractionId: "K8vZ9171h0V",
    tmName: "Cabaret",
    theatre: "Playhouse Theatre (Kit Kat Club)",
  },
  hadestown: {
    // この attraction は436件のうち363件が Lyric Theatre, London で、
    // 残りは米国ツアー(Pittsburgh, Boston ほか)。fetchPerformances が
    // city=London で絞るので、ロンドン公演だけが入る。
    // "Hadestown (NY)"[K8vZ9179Y97] はブロードウェイなので採らない。
    attractionId: "K8vZ917bgM0",
    tmName: "Hadestown (Touring)",
    theatre: "Lyric Theatre",
  },
};

/**
 * TM に在庫がないことを確認済みの作品。
 *
 * 直販(自劇場サイトのみ)なので、探し方を変えても出てこない。
 * 未調査と区別するために残す。ここにある作品は日程を表示しない。
 */
const NO_STOCK = [
  "operation-mincemeat", // Fortune Theatre。TM の在庫は米国公演のみ
  "witness-for-the-prosecution", // County Hall 直販
];

/**
 * 劇場が変わっていた作品(2026-08-15 に TM の在庫で確認し DB を更新済み)。
 *
 * 鮮度の問題が劇場名にも及んでいた実例として残す。上演作品そのものが
 * 入れ替わることがあるので、棚卸しでは作品名と劇場の組を見る必要がある。
 */
const RELOCATED = [
  "six", // Arts Theatre -> Vaudeville Theatre
  "oliver", // Barbican Theatre -> Gielgud Theatre
  "hadestown", // Walter Kerr Theatre(ブロードウェイ) -> Lyric Theatre
  "disneys-hercules", // Lyric Theatre -> Theatre Royal Drury Lane
  "mj-the-musical", // Lyric Theatre -> Prince Edward Theatre(終演済み)
  "operation-mincemeat", // Donmar Warehouse -> Fortune Theatre
  "my-neighbour-totoro", // National Theatre -> Gillian Lynne Theatre
  "the-play-that-goes-wrong", // Old Vic -> Duchess Theatre
  "titanique", // The Vaults -> Criterion Theatre
  "come-alive", // London Palladium -> Empress Museum, Earls Court
  "all-my-sons", // Apollo Theatre -> Wyndham's Theatre(終演済み)
  "the-importance-of-being-earnest", // Vaudeville -> Noël Coward(終演済み)
  "starlight-express", // Apollo Victoria -> Troubadour Wembley Park(終演済み)
];

async function main() {
  const dryRun = process.argv.includes("--dry");

  const slugs = Object.keys(LINKS);
  const found = await prisma.musical.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true },
  });
  const missing = slugs.filter((s) => !found.some((m) => m.slug === s));
  if (missing.length > 0) {
    console.error(`DB に存在しない slug: ${missing.join(", ")}`);
    console.error("対応表を直してください。何も更新していません。");
    process.exitCode = 1;
    return;
  }

  for (const [slug, link] of Object.entries(LINKS)) {
    console.log(`${dryRun ? "[dry] " : ""}${slug} -> ${link.attractionId} (${link.tmName} @ ${link.theatre})`);
    if (!dryRun) {
      await prisma.musical.update({
        where: { slug },
        data: { ticketmasterAttractionId: link.attractionId },
      });
    }
  }

  console.log(`\n紐づけ ${slugs.length}件 / 在庫なし ${NO_STOCK.length}件`);
  console.log(`うち劇場を修正済み: ${RELOCATED.join(", ")}`);
  const total = await prisma.musical.count();
  console.log(`未調査: ${total - slugs.length - NO_STOCK.length}件`);
  if (dryRun) console.log("\n--dry のため書き込んでいません。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
