/**
 * 毎年開催イベントの engName から古い年号を落とす（2026-08）。
 *
 * 年次イベントは会期が来るたびに name（日本語）だけ翌年に更新されてきた
 * 結果、engName に古い年号が残っていた。engName は h1 の日本語名のすぐ横に
 * 出て、JSON-LD の alternateName にも入る。つまり読者には
 *
 *   ハイドパーク ウィンターワンダーランド（2026）  HYDE PARK WINTER WONDERLAND 2025
 *
 * と、1つの見出しの中で年が食い違って見えている状態だった。
 *
 * 年号は name 側が持っていれば足りるので、engName からは落とす。
 * こうすると毎年の更新箇所が name だけになり、次の年もずれない。
 * slug の年号は URL の恒久性のため触らない（best-25-museums の
 * リダイレクトと同じ理由で、URL を毎年作り直すほうが害が大きい）。
 *
 * 冪等。--dry で差分だけ表示する。
 */
import db from "@/utils/db";

const DRY = process.argv.includes("--dry");

/** engName の末尾に付いた西暦。「2025」「2026」など。 */
const TRAILING_YEAR = /\s*\b20\d{2}\b\s*$/;

async function main() {
  const rows = await db.attraction.findMany({
    where: { engName: { not: null } },
    select: { id: true, slug: true, name: true, engName: true },
  });

  let changed = 0;
  for (const r of rows) {
    const eng = r.engName!;
    if (!TRAILING_YEAR.test(eng)) continue;

    const next = eng.replace(TRAILING_YEAR, "").trim();
    if (!next || next === eng) continue;

    console.log(`${r.slug}\n  name: ${r.name}\n  - ${eng}\n  + ${next}`);
    changed++;
    if (!DRY) {
      await db.attraction.update({
        where: { id: r.id },
        data: { engName: next },
      });
    }
  }

  console.log(`\n${DRY ? "[dry] " : ""}${changed} 件`);
}

main().finally(() => process.exit(0));
