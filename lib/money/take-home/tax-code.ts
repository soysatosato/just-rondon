import type { FlatTaxCode, TaxRegion } from "./tax-years";

/**
 * 給与明細に印字される税コード(tax code)を読む。
 *
 * 計算機に税コード欄を置いているのは、「明細の手取りが計算と合わない」
 * という相談の大半が税コードで説明できるから。渡英直後・転職直後は
 * BR や 0T、1257L M1 といった暫定のコードで多く引かれていることが多く、
 * 本人はそれに気づいていない。コードを入れれば差額が見える。
 *
 * 対応する形:
 * - 1257L / 1383M / 1131N / 1257T … 数字×10 が非課税枠
 * - K475 … 非課税枠がマイナス(課税所得に£4,750を足す)
 * - BR / D0 / D1(スコットランドは D2 / D3 も) … 全額に1つの税率
 * - 0T … 非課税枠なし。税率帯はそのまま使う
 * - NT … 課税なし
 * - 先頭の S はスコットランド、C はウェールズの納税者
 * - 末尾の W1 / M1 / X は非累積(緊急税コード)。年額の計算は同じになる
 *
 * 数字×10 をそのまま非課税枠にする。PAYE の月次計算は数字×10+9 を使うが、
 * HMRC 自身が「1257L は£12,570まで非課税」と説明しているので、読者が
 * 自分で確かめられる数字にそろえる(差は年£1.80)。
 */

export type ParsedTaxCode =
  | {
      kind: "allowance";
      /** 非課税枠。K コードでは負の値。 */
      allowance: number;
      isK: boolean;
      region: TaxRegion | null;
      nonCumulative: boolean;
      normalized: string;
    }
  | {
      kind: "flat";
      flatCode: FlatTaxCode;
      region: TaxRegion | null;
      nonCumulative: boolean;
      normalized: string;
    }
  | {
      kind: "no-tax";
      region: TaxRegion | null;
      nonCumulative: boolean;
      normalized: string;
    };

const PATTERN =
  /^(S|C)?(K\d{1,4}|\d{1,4}[LMNT]|BR|D[0-3]|NT)(W1|M1|X)?$/;

/**
 * 読めなければ null。空文字も null(=自動)。
 *
 * 「1257L M1」「1257L/M1」「s1257l」のような揺れは吸収する。
 * 明細によって空白やスラッシュの入れ方が違うため。
 */
export function parseTaxCode(input: string): ParsedTaxCode | null {
  const compact = input.toUpperCase().replace(/[\s/.\-]/g, "");
  if (!compact) return null;

  const match = compact.match(PATTERN);
  if (!match) return null;

  const [, prefix, body, suffix] = match;
  const region: TaxRegion | null =
    prefix === "S" ? "scotland" : prefix === "C" ? "england" : null;
  const nonCumulative = Boolean(suffix);
  const normalized = `${prefix ?? ""}${body}${suffix ? ` ${suffix}` : ""}`;

  if (body === "NT") {
    return { kind: "no-tax", region, nonCumulative, normalized };
  }

  if (body === "BR" || /^D[0-3]$/.test(body)) {
    const flatCode = body as FlatTaxCode;
    // D2 と D3 はスコットランドの税率帯にしか存在しない。
    if ((flatCode === "D2" || flatCode === "D3") && region === "england") {
      return null;
    }
    return { kind: "flat", flatCode, region, nonCumulative, normalized };
  }

  if (body.startsWith("K")) {
    return {
      kind: "allowance",
      allowance: -Number(body.slice(1)) * 10,
      isK: true,
      region,
      nonCumulative,
      normalized,
    };
  }

  return {
    kind: "allowance",
    allowance: Number(body.slice(0, -1)) * 10,
    isK: false,
    region,
    nonCumulative,
    normalized,
  };
}

/** 入力欄の下に出す、そのコードが何を意味するかの一文。 */
export function describeTaxCode(code: ParsedTaxCode): string {
  const regionNote =
    code.region === "scotland"
      ? "スコットランドの税率。"
      : code.region === "england" && code.normalized.startsWith("C")
        ? "ウェールズの税率(現在はイングランドと同じ)。"
        : "";
  const emergencyNote = code.nonCumulative
    ? "末尾の記号は緊急税コード(非累積)の印です。"
    : "";

  switch (code.kind) {
    case "no-tax":
      return `所得税を引かないコードです。${regionNote}${emergencyNote}`;
    case "flat":
      return `${
        code.flatCode === "BR"
          ? "非課税枠を使わず、全額に基本税率をかけるコードです。2つ目の仕事によく使われます。"
          : "非課税枠を使わず、全額に高い税率をかけるコードです。"
      }${regionNote}${emergencyNote}`;
    case "allowance":
      if (code.isK) {
        return `非課税枠がマイナスのコードです。課税される額に年£${Math.abs(
          code.allowance,
        ).toLocaleString("en-GB")}が足されます(社用車などの現物給与や未払いの税)。${regionNote}${emergencyNote}`;
      }
      if (code.allowance === 0) {
        return `非課税枠が£0のコードです。情報が足りないときの暫定コードで、多く引かれます。${regionNote}${emergencyNote}`;
      }
      return `年£${code.allowance.toLocaleString(
        "en-GB",
      )}まで所得税がかかりません。${regionNote}${emergencyNote}`;
  }
}
