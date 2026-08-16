/**
 * Musical.theatreName から Theatre を起こし、作品を紐付ける。
 *
 * 背景。劇場は作品ごとの文字列として持たれていて、住所も座標も作品側に
 * あった。作品が別の劇場へ移ると、劇場の情報まで一緒に動いてしまう
 * (実際 Six と Oliver! は移動し、Hadestown も Lyric に入り直している)。
 * 劇場を独立させ、作品から参照する形に移す。
 *
 * このスクリプトは何度流しても同じ結果になる(upsert + 紐付け済みは skip)。
 *
 * slug は下の THEATRE_SLUGS で人が決める。theatreName から機械的に
 * 作らないのは、URL がそのまま検索対象になるため。"His Majesty's Theatre"
 * を自動変換すると his-majestys-theatre のように揺れる余地が残り、
 * 一度公開した URL は後から変えられない。
 *
 * 実行:
 *   npx tsx scripts/migrate-musical-theatres.ts --dry   何をするか出すだけ
 *   npx tsx scripts/migrate-musical-theatres.ts         実行する
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * theatreName → slug と日本語名。
 *
 * 日本語名は作品ページの本文で劇場を呼ぶときに使う。英語名は検索語に
 * なるので Theatre.name にそのまま残し、こちらは併記用。
 *
 * 「劇場」で終える／終えないは実態に合わせている。Kit Kat Club は
 * Playhouse Theatre を改装した会場名で、日本語で「キットカット・クラブ劇場」
 * とは呼ばれないため、カタカナのままにする。
 */
const THEATRE_SLUGS: Record<string, { slug: string; nameJa: string }> = {
  "Adelphi Theatre": { slug: "adelphi", nameJa: "アデルフィ劇場" },
  "Apollo Victoria Theatre": {
    slug: "apollo-victoria",
    nameJa: "アポロ・ヴィクトリア劇場",
  },
  "Arts Theatre": { slug: "arts", nameJa: "アーツ劇場" },
  "Cambridge Theatre": { slug: "cambridge", nameJa: "ケンブリッジ劇場" },
  "Charing Cross Theatre": {
    slug: "charing-cross",
    nameJa: "チャリング・クロス劇場",
  },
  "County Hall Theatre": { slug: "county-hall", nameJa: "カウンティ・ホール劇場" },
  "Criterion Theatre": { slug: "criterion", nameJa: "クライテリオン劇場" },
  "Dominion Theatre": { slug: "dominion", nameJa: "ドミニオン劇場" },
  "Duchess Theatre": { slug: "duchess", nameJa: "ダッチェス劇場" },
  "Empress Museum, Earls Court": {
    slug: "empress-museum-earls-court",
    nameJa: "エンプレス・ミュージアム（アールズ・コート）",
  },
  "Fortune Theatre": { slug: "fortune", nameJa: "フォーチュン劇場" },
  "Gielgud Theatre": { slug: "gielgud", nameJa: "ギールグッド劇場" },
  "Gillian Lynne Theatre": {
    slug: "gillian-lynne",
    nameJa: "ジリアン・リン劇場",
  },
  "His Majesty's Theatre": {
    slug: "his-majestys",
    nameJa: "ヒズ・マジェスティーズ劇場",
  },
  "Kit Kat Club Theatre": {
    slug: "kit-kat-club",
    nameJa: "キットカット・クラブ（プレイハウス劇場）",
  },
  "Lyceum Theatre": { slug: "lyceum", nameJa: "ライシアム劇場" },
  "Lyric Theatre": { slug: "lyric", nameJa: "リリック劇場" },
  "Noël Coward Theatre": {
    slug: "noel-coward",
    nameJa: "ノエル・カワード劇場",
  },
  "Novello Theatre": { slug: "novello", nameJa: "ノヴェロ劇場" },
  "Palace Theatre": { slug: "palace", nameJa: "パレス劇場" },
  "Phoenix Theatre": { slug: "phoenix", nameJa: "フェニックス劇場" },
  "Piccadilly Theatre": { slug: "piccadilly", nameJa: "ピカデリー劇場" },
  "Prince Edward Theatre": {
    slug: "prince-edward",
    nameJa: "プリンス・エドワード劇場",
  },
  "Prince of Wales Theatre": {
    slug: "prince-of-wales",
    nameJa: "プリンス・オブ・ウェールズ劇場",
  },
  "Sondheim Theatre": { slug: "sondheim", nameJa: "ソンドハイム劇場" },
  "St Martin's Theatre": {
    slug: "st-martins",
    nameJa: "セント・マーチンズ劇場",
  },
  "Theatre Royal Drury Lane": {
    slug: "theatre-royal-drury-lane",
    nameJa: "シアター・ロイヤル・ドルリー・レーン",
  },
  "Troubadour Wembley Park Theatre": {
    slug: "troubadour-wembley-park",
    nameJa: "トゥルバドール・ウェンブリー・パーク劇場",
  },
  "Vaudeville Theatre": { slug: "vaudeville", nameJa: "ヴォードヴィル劇場" },
  "Victoria Palace Theatre": {
    slug: "victoria-palace",
    nameJa: "ヴィクトリア・パレス劇場",
  },
  "Wyndham's Theatre": { slug: "wyndhams", nameJa: "ウィンダムズ劇場" },
};

async function main() {
  const dry = process.argv.includes("--dry");

  const musicals = await prisma.musical.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      theatreName: true,
      theatreId: true,
      address: true,
      lat: true,
      lng: true,
    },
    orderBy: { name: "asc" },
  });

  const unknown = musicals
    .map((m) => m.theatreName)
    .filter((n) => !THEATRE_SLUGS[n]);

  if (unknown.length > 0) {
    // slug を勝手に作らない。未知の劇場が来たら人が THEATRE_SLUGS に
    // 足すまで止める。ここで自動生成すると、公開済みの URL と
    // 揺れたものが混ざる。
    console.error("THEATRE_SLUGS に無い劇場があります。追記してください:");
    for (const n of [...new Set(unknown)]) console.error(`  - ${n}`);
    process.exitCode = 1;
    return;
  }

  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const m of musicals) {
    const meta = THEATRE_SLUGS[m.theatreName];

    if (m.theatreId) {
      skipped++;
      continue;
    }

    if (dry) {
      console.log(
        `${m.name} → ${meta.slug} (${m.theatreName}) / ${m.address}`,
      );
      continue;
    }

    // 住所と座標は作品側の値をそのまま劇場へ移す。同じ劇場に複数作品が
    // ぶら下がる場合、最初の1件の値が残る(同一劇場なので同じはず)。
    const theatre = await prisma.theatre.upsert({
      where: { slug: meta.slug },
      create: {
        slug: meta.slug,
        name: m.theatreName,
        nameJa: meta.nameJa,
        address: m.address,
        lat: m.lat,
        lng: m.lng,
      },
      update: {},
    });
    if (theatre.createdAt.getTime() === theatre.updatedAt.getTime()) created++;

    await prisma.musical.update({
      where: { id: m.id },
      data: { theatreId: theatre.id },
    });
    linked++;
  }

  if (dry) {
    console.log(`\n--dry: ${musicals.length}件を確認しました。`);
    return;
  }

  console.log(
    `劇場を作成: ${created}件 / 作品を紐付け: ${linked}件 / 紐付け済みで skip: ${skipped}件`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
