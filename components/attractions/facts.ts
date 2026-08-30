/**
 * priceAdult / durationText は表示用の自由文字列で、幅や注記を原文のまま
 * 保つ方針になっている(「£31〜 (大人1名につき子ども1名無料)」「1〜1時間半」)。
 * 絞り込みに使うには数値が要るが、列を増やして二重管理にすると原文と
 * ずれるので、表示は原文のまま、絞り込みだけここで解釈する。
 *
 * 解釈できない値は null を返し、呼び出し側は「その条件で絞ったときに
 * 落とす」扱いにする。推測で埋めると、料金の嘘を一覧に出すことになる。
 */

/**
 * 所要時間の目安を分に直す。
 *
 * 「45分〜1時間」のように単位が混ざる書き方があるので、単位付きの数値を
 * すべて拾って最大値を取る。「1〜1時間半」の先頭の 1 のように単位が
 * 付かない下限は拾われないが、欲しいのは上限(どれだけ時間を見ておくか)
 * なので都合がよい。
 */
export function parseDurationMinutes(text: string | null): number | null {
  if (!text) return null;
  const matches = text.matchAll(/(\d+(?:\.\d+)?)\s*(時間半|時間|分|日)/g);
  let max: number | null = null;
  for (const m of matches) {
    const n = Number(m[1]);
    if (!Number.isFinite(n)) continue;
    const minutes =
      m[2] === "日"
        ? n * 24 * 60
        : m[2] === "時間半"
          ? n * 60 + 30
          : m[2] === "時間"
            ? n * 60
            : n;
    if (max === null || minutes > max) max = minutes;
  }
  return max;
}

export type DurationSlug = "short" | "half" | "long";

export const DURATION_FILTERS: { slug: DurationSlug; label: string }[] = [
  { slug: "short", label: "1時間以内" },
  { slug: "half", label: "1〜3時間" },
  { slug: "long", label: "半日以上" },
];

export function durationBucket(text: string | null): DurationSlug | null {
  const m = parseDurationMinutes(text);
  if (m === null) return null;
  if (m <= 60) return "short";
  if (m <= 180) return "half";
  return "long";
}

/**
 * 大人料金の下限を数値で返す。無料は 0。
 *
 * 「£10前後（西側・東側込み）／東側のみ £4.50前後」のように複数の額を
 * 含む書き方があるので、先頭の額を採る。原文の先頭は代表額になっている。
 */
export function parsePriceGbp(text: string | null): number | null {
  if (!text) return null;
  const money = text.match(/£\s*(\d+(?:\.\d+)?)/);
  if (money) {
    const n = Number(money[1]);
    return Number.isFinite(n) ? n : null;
  }
  // £ を含まないのに「無料」と書いてあるものだけ 0 とみなす。
  // 「無料（遊泳池は有料）」のような但し書きは、主たる入場が無料なので 0 でよい。
  if (text.includes("無料")) return 0;
  return null;
}

export type PriceSlug = "free" | "under20" | "under40" | "over40";

export const PRICE_FILTERS: { slug: PriceSlug; label: string }[] = [
  { slug: "free", label: "無料" },
  { slug: "under20", label: "£20以下" },
  { slug: "under40", label: "£20〜40" },
  { slug: "over40", label: "£40より高い" },
];

export function priceBucket(text: string | null): PriceSlug | null {
  const p = parsePriceGbp(text);
  if (p === null) return null;
  if (p === 0) return "free";
  if (p <= 20) return "under20";
  if (p <= 40) return "under40";
  return "over40";
}
