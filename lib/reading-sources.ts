// 読み物の参考資料(Content.sources)の正典。
//
// 2026-10 の AdSense 不承認後の監査で、コラム74本のうち外部リンクのある記事が
// 0本だった。作成スキルは出典を調べていたが、チャットで報告するだけで
// ページには載せていなかった。題に「1942年の議事録」と書いた記事にも、
// その議事録へのリンクが無かった。
//
// 全記事に付けることはしない。載せるのは、記事の日付・数字・引用を実際に
// 資料を開いて確かめられたものだけ。孫引きの解説記事で欄を埋めると、
// 出典欄があること自体の信用が落ちる。出典の無い記事には欄ごと出さない。

export const SOURCE_KINDS = [
  // 議事録・法令・官報・当時の論文や著作など、話の元になった文書そのもの。
  { key: "original", label: "原典" },
  // 現物を所蔵する館・公文書館の所蔵品ページ。
  { key: "collection", label: "所蔵" },
  // その制度・行事を運営する機関自身の解説(議会・造幣局・気象庁など)。
  { key: "official", label: "公式" },
  // 後年の学術研究(査読論文・研究書)。
  { key: "study", label: "研究" },
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number]["key"];

export type ReadingSource = {
  kind: SourceKind;
  /** 何の資料か日本語で分かる名前。英語の原題は要らない。 */
  title: string;
  /** 発行元・所蔵元。 */
  publisher: string;
  /** 資料の年。「1942」「1855(第2版)」など。 */
  year?: string;
  /** 書籍などリンク先が無い資料は省略してよい。 */
  url?: string;
};

/** 欄が長くなると、どれが決め手の資料なのか分からなくなる。 */
export const MAX_SOURCES = 5;

/**
 * 出典にしないサイト。誰でも書き換えられる百科事典と、その転載サイト。
 * 記事の裏を取るときの入口に使うのは構わないが、載せるのはその先の原典。
 */
const BLOCKED_HOSTS = [/(^|\.)wikipedia\.org$/, /(^|\.)wikiwand\.com$/];

const KIND_LABELS = new Map<string, string>(
  SOURCE_KINDS.map((k) => [k.key, k.label]),
);

export function sourceKindLabel(kind: SourceKind): string {
  return KIND_LABELS.get(kind) ?? kind;
}

/** リンクの行に添える短いドメイン表記。www. は落とす。 */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * 投入スクリプト用。形が崩れていたら理由つきで止める。
 * 空配列は「出典なし」としてそのまま返す。
 */
export function validateSources(value: unknown): ReadingSource[] {
  if (!Array.isArray(value)) throw new Error("sources must be an array");
  if (value.length > MAX_SOURCES) {
    throw new Error(
      `sources has ${value.length} entries; keep it to ${MAX_SOURCES} or fewer ` +
        `(only the documents the article's facts were checked against)`,
    );
  }

  return value.map((raw, i) => {
    if (!isRecord(raw)) throw new Error(`sources[${i}] must be an object`);
    const { kind, title, publisher, year, url } = raw;

    if (typeof kind !== "string" || !KIND_LABELS.has(kind)) {
      throw new Error(
        `sources[${i}].kind must be one of: ${SOURCE_KINDS.map((k) => k.key).join(", ")}`,
      );
    }
    if (typeof title !== "string" || !title.trim()) {
      throw new Error(`sources[${i}].title is required`);
    }
    if (typeof publisher !== "string" || !publisher.trim()) {
      throw new Error(`sources[${i}].publisher is required`);
    }
    if (year !== undefined && (typeof year !== "string" || !year.trim())) {
      throw new Error(`sources[${i}].year must be a non-empty string`);
    }
    if (url !== undefined) {
      if (typeof url !== "string" || !/^https:\/\//.test(url)) {
        throw new Error(`sources[${i}].url must start with https://`);
      }
      const host = sourceHost(url);
      if (!host) throw new Error(`sources[${i}].url is not a valid URL`);
      if (BLOCKED_HOSTS.some((re) => re.test(host))) {
        throw new Error(
          `sources[${i}].url points to ${host}. Cite the document it summarises instead.`,
        );
      }
    }

    return {
      kind: kind as SourceKind,
      title: title.trim(),
      publisher: publisher.trim(),
      ...(year ? { year: (year as string).trim() } : {}),
      ...(url ? { url: url as string } : {}),
    };
  });
}

/** 表示用。DBの値が壊れていてもページは落とさず、欄を出さないだけにする。 */
export function parseSources(value: unknown): ReadingSource[] {
  if (value == null) return [];
  try {
    return validateSources(value);
  } catch {
    return [];
  }
}
