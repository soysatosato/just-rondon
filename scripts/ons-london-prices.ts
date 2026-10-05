import { ONS_LONDON_PRICES } from "../lib/food/prices";

/**
 * ONS の価格調査の元データ(price quotes)から、ロンドンの店頭価格の中央値を出す。
 * 物価ボードのパイントとコーヒー(lib/food/prices.ts の ONS_LONDON_PRICES)の更新用。
 * 読み取り専用。値は表示するだけで、定数は手で直す。
 *
 *   npx tsx scripts/ons-london-prices.ts            # 公開済みの最新月
 *   npx tsx scripts/ons-london-prices.ts 202608     # 月を指定
 *
 * 元データの要点:
 *   - 調査月の翌月中旬、CPI の公表と同じ日に出る。10月初めに取れるのは8月分
 *   - REGION=2 がロンドン(glossary の "Approximation to Government Office Regions")
 *   - VALIDITY が false の行は集計から外された値。月によって True / TRUE と表記が揺れる
 *   - 2026年3月から、スーパーで買う食品と酒(COICOP 1・2)の個別価格は非公開になった。
 *     パブとカフェは外食(COICOP 11)なので残っている
 */

const DATASET_PAGE =
  "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindicescpiandretailpricesindexrpiitemindicesandpricequotes";

const LONDON_REGION = "2";

/** ボードで使う品目。key は ONS_LONDON_PRICES のキー。 */
const BOARD_ITEMS: { key: keyof typeof ONS_LONDON_PRICES; desc: string }[] = [
  { key: "lagerPint", desc: "PREMIUM LAGER - PINT 4.3-7.5%" },
  { key: "coffee", desc: "RESTAURANT CUP OF COFFEE" },
];

/** 参考に並べるだけの品目。ボードには載せていない。 */
const REFERENCE_ITEMS = [
  "LAGER - PINT 3.4-4.2%",
  "DRAUGHT BITTER (PER PINT)",
  "FISH & CHIPS TAKEAWAY",
  "PUB -HOT MEAL",
];

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

async function findCsvUrl(month?: string): Promise<{ url: string; month: string }> {
  const html = await (await fetch(DATASET_PAGE)).text();
  const links = [...html.matchAll(/href="([^"]*upload-pricequotes(\d{6})\.csv)"/g)].map(
    (m) => ({ url: new URL(m[1], "https://www.ons.gov.uk").toString(), month: m[2] }),
  );
  if (links.length === 0) throw new Error("price quotes の CSV が見つからない(ページ構成が変わった?)");
  if (month) {
    const hit = links.find((l) => l.month === month);
    if (!hit) throw new Error(`${month} の CSV が無い。公開済み: ${links.map((l) => l.month).join(", ")}`);
    return hit;
  }
  return links.sort((a, b) => b.month.localeCompare(a.month))[0];
}

async function main() {
  const arg = process.argv[2];
  if (arg && !/^\d{6}$/.test(arg)) throw new Error("月は 202608 の形で指定する");

  const { url, month } = await findCsvUrl(arg);
  console.log(`ONS price quotes ${month}\n${url}\n`);

  const text = await (await fetch(url)).text();
  const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const cols = parseCsvLine(header);
  const at = (name: string) => {
    const i = cols.indexOf(name);
    if (i < 0) throw new Error(`列 ${name} が無い`);
    return i;
  };
  const iDesc = at("CS_DESC");
  const iValid = at("VALIDITY");
  const iPrice = at("PRICE");
  const iRegion = at("REGION");

  const london = new Map<string, number[]>();
  const uk = new Map<string, number[]>();
  for (const line of lines) {
    const r = parseCsvLine(line);
    if (r[iValid]?.toLowerCase() !== "true") continue;
    const price = Number(r[iPrice]);
    if (!(price > 0)) continue;
    const desc = r[iDesc];
    (uk.get(desc) ?? uk.set(desc, []).get(desc)!).push(price);
    if (r[iRegion] === LONDON_REGION) {
      (london.get(desc) ?? london.set(desc, []).get(desc)!).push(price);
    }
  }

  const row = (desc: string) => {
    const lo = london.get(desc) ?? [];
    const all = uk.get(desc) ?? [];
    if (lo.length === 0) return `${desc.padEnd(32)} ロンドンの有効な値なし`;
    return (
      `${desc.padEnd(32)} ロンドン ${String(lo.length).padStart(3)}件 ` +
      `中央値 £${round2(median(lo)).toFixed(2)}  ` +
      `(最安 £${Math.min(...lo).toFixed(2)} / 最高 £${Math.max(...lo).toFixed(2)})  ` +
      `英国全体の中央値 £${round2(median(all)).toFixed(2)}`
    );
  };

  console.log("■ ボードの品目");
  for (const { key, desc } of BOARD_ITEMS) {
    console.log(row(desc));
    const current = ONS_LONDON_PRICES[key];
    if (typeof current === "object") {
      console.log(`  いまの定数: £${current.median.toFixed(2)}(${current.quotes}件、${ONS_LONDON_PRICES.surveyMonth})`);
    }
  }

  console.log("\n■ 参考(ボードには載せていない)");
  for (const desc of REFERENCE_ITEMS) console.log(row(desc));

  console.log("\n■ lib/food/prices.ts に貼る値");
  const ym = `${month.slice(0, 4)}-${month.slice(4)}`;
  console.log(`  surveyMonth: "${ym}",`);
  for (const { key, desc } of BOARD_ITEMS) {
    const lo = london.get(desc) ?? [];
    if (lo.length) console.log(`  ${key}: { median: ${round2(median(lo))}, quotes: ${lo.length} },`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
