import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  PRICE_ITEMS,
  resolvePrice,
  samePrice,
  type PriceValue,
} from "../lib/price-board/items";
import type { PriceSnapshot } from "../lib/price-board/history";

/**
 * 物価ボードの月ごとの記録を1件残す。月次の確認の最後に実行する。
 *
 *   npx tsx scripts/snapshot-price-board.ts --dry                 # 前回との差を見るだけ
 *   npx tsx scripts/snapshot-price-board.ts                       # 今月分を記録
 *   npx tsx scripts/snapshot-price-board.ts --memo "…" --issue 2026-11
 *
 * 記録するのは「定数ファイルのいまの値」と「その日の ECB のレート」。
 * だから先に定数を直してから実行する(順番を逆にすると、古い値が
 * 確認済みとして残る)。
 *
 * 同じ月を2回実行すると上書きする。--memo / --issue を省いたときは、
 * 既にある値を残す。
 *
 *   --date 2026-10-05   確認日(省略時はロンドンの今日)
 *   --memo "…"          その月の物価メモ。2〜3文
 *   --issue 2026-11     メモと一緒に読む月次号の slug
 *   --dry               書き込まない
 */

const FILE = join(__dirname, "../lib/price-board/snapshots.json");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const fmt = (v: PriceValue) =>
  typeof v === "number" ? `£${v}` : `£${v.min}〜£${v.max}`;

async function main() {
  const dry = process.argv.includes("--dry");
  const checkedAt = arg("date") ?? londonToday();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) throw new Error("--date は 2026-10-05 の形");
  const month = checkedAt.slice(0, 7);

  const res = await fetch(
    `https://api.frankfurter.dev/v1/${checkedAt}?base=GBP&symbols=JPY`,
  );
  if (!res.ok) throw new Error(`Frankfurter responded ${res.status}`);
  const fx = (await res.json()) as { date: string; rates: { JPY: number } };

  const prices: Record<string, PriceValue> = {};
  for (const item of PRICE_ITEMS) prices[item.id] = resolvePrice(item, checkedAt);

  const all = JSON.parse(readFileSync(FILE, "utf8")) as PriceSnapshot[];
  const existing = all.find((s) => s.month === month);
  const prev = all
    .filter((s) => s.month < month)
    .sort((a, b) => a.month.localeCompare(b.month))
    .at(-1);

  const snapshot: PriceSnapshot = {
    month,
    checkedAt,
    jpyPerGbp: fx.rates.JPY,
    rateDate: fx.date,
    prices,
  };
  const memo = arg("memo") ?? existing?.memo;
  const issue = arg("issue") ?? existing?.issue;
  if (memo) snapshot.memo = memo;
  if (issue) snapshot.issue = issue;

  console.log(`${month} の記録(確認日 ${checkedAt}、£1 = ${fx.rates.JPY}円 / ECB ${fx.date})`);
  console.log(`品目 ${PRICE_ITEMS.length}件`);

  if (prev) {
    const fxChange = ((fx.rates.JPY - prev.jpyPerGbp) / prev.jpyPerGbp) * 100;
    console.log(
      `\n前回(${prev.month}、£1 = ${prev.jpyPerGbp}円)から為替だけで ${fxChange >= 0 ? "+" : ""}${fxChange.toFixed(1)}%`,
    );
    const changed = PRICE_ITEMS.filter(
      (item) => item.id in prev.prices && !samePrice(prev.prices[item.id], prices[item.id]),
    );
    const added = PRICE_ITEMS.filter((item) => !(item.id in prev.prices));
    console.log(changed.length ? "\nポンドで値が変わった品目:" : "\nポンドで値が変わった品目はなし");
    for (const item of changed) {
      console.log(`  ${item.label}: ${fmt(prev.prices[item.id])} → ${fmt(prices[item.id])}`);
    }
    for (const item of added) console.log(`  (新しい品目) ${item.label}: ${fmt(prices[item.id])}`);
  } else {
    console.log("\n前回の記録なし(初回)。前月比は次の記録から出る。");
  }

  if (dry) {
    console.log("\n--dry: 書き込みはしていない");
    return;
  }

  const next = all.filter((s) => s.month !== month).concat(snapshot);
  next.sort((a, b) => a.month.localeCompare(b.month));
  writeFileSync(FILE, JSON.stringify(next, null, 2) + "\n");
  console.log(`\n${existing ? "上書き" : "追記"}した: lib/price-board/snapshots.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
