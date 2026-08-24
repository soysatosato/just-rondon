/**
 * クリスマスマーケット特集から前年の日程を外す。
 *
 *   npx tsx scripts/fix-christmas-market-years.ts            # 差分を表示
 *   npx tsx scripts/fix-christmas-market-years.ts --apply    # 書き換え
 *
 * 対象は app/(with-ads)/sightseeing/christmas-markets/data.ts の
 * 「期間」節と、page.tsx のメタデータ。
 *
 * ------------------------------------------------------------------
 * なぜ日程を消して「例年」にするか
 * ------------------------------------------------------------------
 * 掲載されていたのは2025年シーズンの実績日程だった(「2025年11月12日 〜
 * 2026年1月3日」など10件)。2026年8月時点で読むと、来場を検討している
 * 読者に対して1年古い会期を確定情報として出していることになる。
 *
 * かといって2026年の日程に差し替えるのも今はできない。各運営が
 * 正式発表するのは秋で、いま出回っているのは予想日程にすぎない。
 * 予想を断定形で書くのは、古い日程を残すのと同じ質の誤りになる。
 *
 * そこで「毎年おおむねこの時期」+「公式で確認」という形にする。
 * クリスマスマーケットは開催時期が年ごとに数日ずれるだけなので、
 * 月の粒度なら毎年正しく、しかも読者の計画には十分な精度がある。
 * 毎年書き換える運用に依存しない形にしておくのが狙い——実際、
 * 年号を入れた見出しは書き換えられないまま1年放置されていた。
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "app/(with-ads)/sightseeing/christmas-markets/data.ts");
const PAGE = path.join(ROOT, "app/(with-ads)/sightseeing/christmas-markets/page.tsx");

/** 「期間」節の置き換え。左が現在の文字列、右が置き換え後。 */
const PERIOD_REPLACEMENTS: [string, string][] = [
  [
    '"2025年11月12日 〜 2026年1月3日"',
    '"例年11月中旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月3日 〜 2026年1月上旬"',
    '"例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月11日 〜 2026年1月4日"',
    '"例年11月中旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月9日 〜 2026年1月2日"',
    '"例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月21日 〜 2025年12月22日"',
    '"例年11月下旬 〜 12月下旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月13日 〜 2025年12月28日（※クリスマス当日休業 / クリスマスイブは短縮営業）"',
    '"例年11月中旬 〜 12月下旬（※クリスマス当日休業 / クリスマスイブは短縮営業。正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月14日 〜 2026年1月1日（※クリスマス当日は休業）"',
    '"例年11月中旬 〜 1月上旬（※クリスマス当日は休業。正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月29日 〜 2026年1月上旬"',
    '"例年11月下旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月5日 〜 2026年1月5日"',
    '"例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
  [
    '"2025年11月7日 〜 2026年1月5日"',
    '"例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）"',
  ],
];

/** 本文中の「2025年は〜」という記述。年を特定しない書き方に直す。 */
const BODY_REPLACEMENTS: [string, string][] = [
  [
    "2025年は特に話題のスポットが **The Glasshouse Terrace**。",
    "近年とくに話題なのが **The Glasshouse Terrace**。",
  ],
  [
    "2025年は初めて**アイススケートリンクが設置**され、ひときわ華やかな雰囲気に。",
    "近年は**アイススケートリンクも設置**され、ひときわ華やかな雰囲気に。",
  ],
  [
    "近くの **パラディウム劇場の『Sleeping Beauty』** が2025年の人気演目。",
    "近くの **パラディウム劇場のパントマイム公演** が冬の人気演目。",
  ],
];

/** page.tsx のメタデータ。年号を外す。 */
const PAGE_REPLACEMENTS: [string, string][] = [
  [
    '"ロンドンのクリスマスマーケット特集 2025 | おすすめスポット・開催情報まとめ | ジャスト・ロンドン"',
    '"ロンドンのクリスマスマーケット特集 | おすすめスポット・開催情報まとめ | ジャスト・ロンドン"',
  ],
  [
    '"ロンドンのクリスマスマーケット2025年最新版。',
    '"ロンドンのクリスマスマーケットを厳選紹介。',
  ],
];

const APPLY = process.argv.includes("--apply");

function applyTo(file: string, pairs: [string, string][], label: string) {
  const original = fs.readFileSync(file, "utf8");
  let next = original;
  let hit = 0;
  const missed: string[] = [];

  for (const [from, to] of pairs) {
    if (!next.includes(from)) {
      missed.push(from);
      continue;
    }
    // 同じ文字列が複数箇所にあることを想定して全置換する。
    next = next.split(from).join(to);
    hit++;
    console.log(`  ${from}`);
    console.log(`    → ${to}`);
  }

  if (missed.length) {
    console.error(`\n  ✗ ${label}: 見つからなかった文字列が ${missed.length} 件`);
    missed.forEach((m) => console.error(`      ${m}`));
    process.exitCode = 1;
  }

  if (APPLY && next !== original) {
    fs.writeFileSync(file, next);
    console.log(`  → ${label} を書き換えました`);
  }
  return hit;
}

console.log(APPLY ? "== 書き換え ==\n" : "== ドライラン(--apply で書き換え) ==\n");

console.log("[data.ts / 期間]");
const a = applyTo(DATA, PERIOD_REPLACEMENTS, "data.ts");
console.log("\n[data.ts / 本文]");
const b = applyTo(DATA, BODY_REPLACEMENTS, "data.ts");
console.log("\n[page.tsx / メタデータ]");
const c = applyTo(PAGE, PAGE_REPLACEMENTS, "page.tsx");

console.log(`\n置き換え ${a + b + c} 件`);
if (!APPLY) console.log("\n--apply を付けると書き換えます。");
