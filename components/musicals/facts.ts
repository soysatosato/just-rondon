/**
 * 上演時間・年齢・英語まわりの表示ロジック。
 *
 * DB には数値と分類だけを持ち、読者に見せる文はここで組み立てる。
 * 作品ページと劇場ページの両方が同じ言い回しを使うので、
 * 表現を1か所に閉じ込めておく。
 */

/**
 * 英語のハードルを、断定ではなく形式で表す。
 *
 * 「難易度★3」のような一次元の指標にしないのは、英語力が読者ごとに
 * 違い、同じ作品でも原作を知っているかで体感が変わるため。
 * サイトが難易度を宣言すると、外れたときに読者の一晩が無駄になる。
 * 上演の形式という事実だけを出し、判断は読者に返す。
 */
export type EnglishForm =
  | "sung-through"
  | "dialogue-heavy"
  | "balanced"
  | "non-verbal";

export const ENGLISH_FORM_LABELS: Record<EnglishForm, string> = {
  "sung-through": "ほぼ全編が歌",
  "dialogue-heavy": "台詞が中心",
  balanced: "歌と台詞が半々",
  "non-verbal": "台詞にほとんど依存しない",
};

/**
 * 形式そのものの説明。作品固有の事情は englishNote に書く。
 *
 * ここで「だから簡単」「だから難しい」とは言わない。歌中心は歌詞が
 * 聞き取りにくい代わりに筋が単純なことが多く、台詞中心はその逆で、
 * どちらが楽かは読者の得手不得手で入れ替わる。
 */
export const ENGLISH_FORM_NOTES: Record<EnglishForm, string> = {
  "sung-through":
    "台詞での説明が少なく、筋は歌と場面展開で進みます。歌詞そのものは聞き取りにくいことがあるため、あらすじと曲順を先に読んでおくと追いやすくなります。",
  "dialogue-heavy":
    "会話のやりとりで筋が進みます。話の速さや言い回しに慣れが要る一方、状況説明は台詞の中で明示されることが多く、筋そのものは把握しやすい構成です。",
  balanced:
    "歌と台詞が交互に来る一般的な構成です。要点は歌で繰り返されることが多く、台詞を取りこぼしても筋を見失いにくくなっています。",
  "non-verbal":
    "言葉よりも音楽・ダンス・視覚表現で見せる作品です。英語の聞き取りが体験を大きく左右しません。",
};

export function isEnglishForm(value: string | null): value is EnglishForm {
  return value !== null && value in ENGLISH_FORM_LABELS;
}

/**
 * 上演時間の表示。休憩の内数を併記する。
 *
 * 「2時間30分」だけだと、劇場を出る時刻を読み違える。夕食の予約や
 * 終電から逆算する読者がいるので、休憩を含む総時間であることを
 * 明示する。
 */
export function formatRuntime(
  runtimeMinutes: number | null,
  intervalMinutes: number | null,
): string | null {
  if (runtimeMinutes === null) return null;

  const hours = Math.floor(runtimeMinutes / 60);
  const minutes = runtimeMinutes % 60;
  const base =
    hours > 0
      ? minutes > 0
        ? `${hours}時間${minutes}分`
        : `${hours}時間`
      : `${minutes}分`;

  if (intervalMinutes === null) return base;
  // 0 は「休憩なしで通す」。未確認(null)と区別して明示する。
  if (intervalMinutes === 0) return `${base}（休憩なし）`;
  return `${base}（休憩${intervalMinutes}分を含む）`;
}

/**
 * 推奨年齢。劇場の案内であって法的な入場制限ではないので、
 * 断定を避けた言い方にする。
 */
export function formatMinAge(minAgeGuidance: number | null): string | null {
  if (minAgeGuidance === null) return null;
  if (minAgeGuidance === 0) return "年齢の目安なし";
  return `${minAgeGuidance}歳以上が目安`;
}

/** 「2026年8月時点」。日まで出すと確認の精度以上に正確に見える。 */
export function formatFactsVerifiedAt(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月時点`;
}

export type MusicalFacts = {
  runtimeMinutes: number | null;
  intervalMinutes: number | null;
  minAgeGuidance: number | null;
  englishForm: string | null;
  englishNote: string | null;
};

/** 実用情報を1つでも持っているか。持たない作品では節ごと出さない。 */
export function hasAnyFacts(facts: MusicalFacts): boolean {
  return (
    facts.runtimeMinutes !== null ||
    facts.minAgeGuidance !== null ||
    isEnglishForm(facts.englishForm)
  );
}
