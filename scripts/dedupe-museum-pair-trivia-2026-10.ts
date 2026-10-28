/**
 * 観光と美術館を1ページにまとめた21館で、豆知識の重複した箇条を消す(2026-10-29)。
 *
 *   npx tsx scripts/dedupe-museum-pair-trivia-2026-10.ts          # 消す箇条を出すだけ
 *   npx tsx scripts/dedupe-museum-pair-trivia-2026-10.ts --apply  # 書き込む
 *
 * 美術館のページ(app/museums/[slug]/page.tsx)は、美術館側の豆知識(Trivia)の
 * カードの後ろに、観光側の見出しの無い豆知識(AttractionStory の trivia)を
 * 「ほかにも」として続けて出す。2つは別々に書かれたもので、同じ話が両方に
 * 入っている館があった(交通博物館の「チケットは1年間有効」、ソーンズ博物館の
 * 石棺の祝宴など)。カードのほうが詳しいので、観光側の箇条を消す。
 *
 * 消すのは次の3種類だけ。判断は1館ずつ本文を読んで決めた。
 * - 美術館側の豆知識カードと同じ話
 * - 美術館側の「これだけは見て帰る」と同じ作品を、同じ切り口で説明しているもの
 * - 「入場は無料」「◯◯駅から徒歩数分」など、同じページのファクトバーが持つ事実
 * 同じ作品でも切り口が違う話(『ひまわり』が客を迎える部屋の飾りだった、等)は残す。
 *
 * 観光側のページは美術館側へ転送しているので、ここで消した箇条はどこにも
 * 出なくなる。行はバックアップ(backup-db)から戻せる。
 *
 * 直した行は source を "authored" にする。scripts/migrate-sections-to-stories.ts は
 * "migrated" の行を作り直すので、そのままだと消した箇条が戻ってくる。
 * 箇条が残らない行は消す。
 */

import db from "../utils/db";
import { MUSEUM_ATTRACTION_PAIRS } from "../lib/museum-attraction-pairs";

const APPLY = process.argv.includes("--apply");

/**
 * 消す箇条。キーは Attraction.slug、値は箇条の書き出し(「- 」の後ろ)。
 * 書き出しで照合するので、本文が変わっていたら見つからずに止まる。
 */
const REMOVE: Record<string, string[]> = {
  // 疎開は美術館側のカード「戦時中は絵を疎開させ…」と同じ話。
  "national-gallery-london": ["**1939年、収蔵品はすべてウェールズの鉱山に疎開した**"],
  // 「自然の大聖堂」は美術館側のカードと同じ話。
  "natural-history-museum": ["**正面の建物は「自然の大聖堂」と呼ばれる**"],
  // 入場無料と予約は美術館側のカードとファクトバー、ワンダーラボは見どころにある。
  "science-museum": ["**入場は無料**", "**ワンダーラボはLevel 3**"],
  "tate-modern": ["**常設展示は無料**"],
  // 『オフィーリア』は見どころにある。
  "tate-britain": ["**ラファエル前派の主要作品が集まっている**", "**入場は無料**"],
  "london-transport-museum": ["**チケットは1年間有効**"],
  // 設立の時期は美術館側のカード「戦意高揚のためではなく記録のために」と同じ話。
  "imperial-war-museum": ["**設立は戦争が終わる前**", "**入場は無料**"],
  "museum-of-brands-london": [
    "収集の総数は50万点を超え",
    "ノッティング・ヒルのラドブローク・グローヴ寄りにある",
  ],
  "young-va-bethnal-green": ["入場無料", "ベスナル・グリーン駅から徒歩数分"],
  // 時報の球は美術館側のカード「タイムボールは1833年から…」と同じ話。
  "royal-observatory-greenwich": ["**屋根の赤い球は、時報装置**"],
  // 石棺の祝宴はカード、『放蕩息子の遍歴』は見どころにある。
  "sir-john-soanes-museum": [
    "地下にある**セティ1世の石棺**",
    "ホガースの連作『放蕩息子の遍歴』",
    "入場は無料",
  ],
  // 『タッデイの聖母』は美術館側のカード「英国唯一のミケランジェロの大理石」。
  "royal-academy-of-arts": ["中庭を入った正面の階段脇に、ミケランジェロの大理石浮彫"],
  // 2作品は見どころ、撮影地はカードにある。
  "kenwood-house-hampstead": [
    "レンブラントの自画像とフェルメールの『ギターを弾く女』",
    "屋敷も庭園も入場無料",
    "『ノッティングヒルの恋人』『ミス・ポター』",
  ],
  "queens-house-greenwich": ["入場は無料。旧王立海軍学校や国立海事博物館と同じ敷地内"],
};

async function main() {
  const known = new Set(MUSEUM_ATTRACTION_PAIRS.map((p) => p.attractionSlug));
  const report: string[] = [];

  for (const [slug, prefixes] of Object.entries(REMOVE)) {
    if (!known.has(slug)) throw new Error(`${slug} は対応表に無い`);

    const stories = await db.attractionStory.findMany({
      where: { attraction: { slug }, kind: "trivia" },
      select: { id: true, heading: true, body: true },
    });
    const loose = stories.filter((s) => !s.heading?.trim());
    if (loose.length !== 1) {
      throw new Error(`${slug}: 見出しの無い豆知識が${loose.length}本ある`);
    }
    const story = loose[0];

    const lines = story.body.split("\n");
    const kept: string[] = [];
    const removed = new Set<string>();
    for (const line of lines) {
      const text = line.replace(/^\s*-\s*/, "");
      const hit = prefixes.find((p) => text.startsWith(p));
      if (hit && /^\s*-\s/.test(line)) {
        removed.add(hit);
        report.push(`${slug}#${story.id} 消す: ${text.slice(0, 60)}…`);
      } else {
        kept.push(line);
      }
    }
    const missing = prefixes.filter((p) => !removed.has(p));
    if (missing.length > 0) {
      throw new Error(`${slug}: 見つからない箇条 ${missing.join(" / ")}`);
    }

    const body = kept.join("\n").trim();
    if (!/^\s*-\s/m.test(body)) {
      report.push(`${slug}#${story.id} 箇条が残らないので行を消す`);
      if (APPLY) await db.attractionStory.delete({ where: { id: story.id } });
    } else if (APPLY) {
      await db.attractionStory.update({
        where: { id: story.id },
        data: { body, source: "authored" },
      });
    }
  }

  console.log(report.map((r) => `- ${r}`).join("\n"));
  console.log(APPLY ? "\n書き込みました" : "\n(--apply で書き込みます)");
}

main().finally(() => db.$disconnect());
