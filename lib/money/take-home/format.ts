/**
 * 手取り計算機の数字の書き方。
 *
 * lib/jobs/rates.ts と lib/money/rates.ts にも gbp() があるが、どちらも
 * 「定数の額をそのまま書く」ためのもので、計算結果の端数を丸めない。
 * 計算機は£2,369.4166… を毎回出すので、丸め方をここで1つに決める。
 */

/** 通常は£単位に丸める。明細の再現だけペンスまで出す。 */
export function formatGbp(value: number, options: { pence?: boolean } = {}) {
  const safe = Number.isFinite(value) ? value : 0;
  const digits = options.pence ? 2 : 0;
  const rounded = Number(safe.toFixed(digits));
  // -0 を「-£0」と出さないため。
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  const sign = normalized < 0 ? "-" : "";
  return `${sign}£${Math.abs(normalized).toLocaleString("en-GB", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/** 差額。プラスにも符号を付ける。 */
export function formatGbpDelta(value: number, options: { pence?: boolean } = {}) {
  const text = formatGbp(value, options);
  return value > 0 && text !== "£0" && text !== "£0.00" ? `+${text}` : text;
}

/** 0.2834 → 28.3% */
export function formatPercent(ratio: number, digits = 1) {
  const safe = Number.isFinite(ratio) ? ratio : 0;
  return `${(safe * 100).toFixed(digits)}%`;
}

/**
 * 円の概算。桁の大きい額は「万円」で丸める。
 *
 * 為替は ECB の参考レートで、実際に日本へ送る額とは数%ずれる。
 * 1円単位まで出すと精度があるように見えてしまうので、あえて粗くする。
 */
export function formatYenApprox(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0円";
  if (value >= 100_000_000) return `${trim(value / 100_000_000, 2)}億円`;
  if (value >= 1_000_000) return `${Math.round(value / 10_000).toLocaleString("ja-JP")}万円`;
  if (value >= 10_000) return `${trim(value / 10_000, 1)}万円`;
  return `${(Math.round(value / 100) * 100).toLocaleString("ja-JP")}円`;
}

function trim(value: number, digits: number) {
  return Number(value.toFixed(digits)).toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
  });
}

/** 入力欄の表示。桁区切りを入れ、小数は2桁まで。 */
export function formatAmountInput(value: number) {
  if (!Number.isFinite(value)) return "";
  return value.toLocaleString("en-GB", { maximumFractionDigits: 2 });
}

/** 入力欄の文字列を数値にする。空や読めない値は null。 */
export function parseAmountInput(text: string): number | null {
  const cleaned = text.replace(/[£,\s]/g, "").replace(/[０-９．]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );
  if (!cleaned) return null;
  // 「35k」のような書き方も通す。求人票でよく見る表記のため。
  const k = cleaned.match(/^(\d+(?:\.\d+)?)k$/i);
  if (k) return Number(k[1]) * 1000;
  if (!/^\d*(?:\.\d*)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
