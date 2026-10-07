/**
 * Instagram のカルーセル(5枚)の原稿の形と、1か所あたりの文字数の上限。
 *
 * 上限は版面(components/og/IgSlide.tsx)の文字寸法から逆算してある。
 * 登録スクリプト(scripts/create-instagram-posts.ts)はこれを超える原稿を
 * 弾き、版面も念のため超えた分を「…」で切る。どちらか片方だけ変えると、
 * 通った原稿が画像からはみ出すか、収まる原稿が登録で弾かれる。
 *
 * 字数は Array.from で数える(サロゲートペアを1字とする)。半角も1字と
 * 数えるので、英数字の多い原稿は実際より余裕を持って収まる。
 */

/** 投稿を作れる記事のカテゴリ。版面の配色と表紙の型がこれで決まる。 */
export const IG_CATEGORIES = ["column", "british-english"] as const;
export type IgCategory = (typeof IG_CATEGORIES)[number];

export function isIgCategory(value: string): value is IgCategory {
  return (IG_CATEGORIES as readonly string[]).includes(value);
}

export const IG_LIMITS = {
  /** 表紙の見出し。88〜70px で2〜3行。 */
  coverHead: 30,
  /** 表紙の副題。38px で2行。 */
  coverTail: 40,
  /** 要点の大きな札(年号・数字・短い語)。 */
  pointLabel: 8,
  /** 要点の見出し。56px で2行。 */
  pointTitle: 22,
  /** 要点の本文。40px で5行。 */
  pointBody: 100,
  /** 締めの見出し。 */
  closingTitle: 22,
  /** 締めの本文。下に誘導の枠が入るぶん、要点より短い。 */
  closingBody: 80,
  /** キャプション本文。誘導・クレジット・タグは表示時に足す。 */
  caption: 500,
  /** Instagram の上限(2025-12〜)。 */
  hashtags: 5,
} as const;

/** 要点の枚数。表紙・要点3枚・締めで5枚。 */
export const IG_POINT_COUNT = 3;
export const IG_SLIDE_COUNT = IG_POINT_COUNT + 2;

export type IgPoint = {
  /** 大きく置く札。年号「1340」、数字「600万語に1回」、語「直訳」など。 */
  label: string;
  title: string;
  body: string;
};

export function charLength(text: string): number {
  return Array.from(text).length;
}

/** 上限を超えた分を「…」で切る。版面がはみ出さないための保険。 */
export function clampText(text: string, max: number): string {
  const chars = Array.from(text.trim());
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : chars.join("");
}

/**
 * DB の points(Json)を読む。形が崩れていれば null。
 * 版面は null のとき要点の枚を描けないので、ルート側で404にする。
 */
export function parseIgPoints(value: unknown): IgPoint[] | null {
  if (!Array.isArray(value) || value.length !== IG_POINT_COUNT) return null;
  const points: IgPoint[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const { label, title, body } = item as Record<string, unknown>;
    if (typeof label !== "string" || typeof title !== "string" || typeof body !== "string") {
      return null;
    }
    points.push({ label, title, body });
  }
  return points;
}

/**
 * 原稿の検査。問題を文で返す(空なら通る)。
 *
 * 絵文字は弾く。版面の日本語フォントは Google Fonts のサブセットで、
 * 絵文字の字形を持たず豆腐になる。マークダウンの記号も版面では
 * 生のまま出るので弾く。
 */
export function validateIgCopy(copy: {
  coverHead: string;
  coverTail?: string | null;
  points: IgPoint[];
  closingTitle: string;
  closingBody: string;
  caption: string;
  hashtags: string[];
}): string[] {
  const problems: string[] = [];
  const check = (name: string, text: string | null | undefined, max: number, required = true) => {
    if (!text?.trim()) {
      if (required) problems.push(`${name} が空です`);
      return;
    }
    const n = charLength(text.trim());
    if (n > max) problems.push(`${name} が ${n}字です(上限 ${max}字)`);
    if (/\p{Extended_Pictographic}/u.test(text)) {
      problems.push(`${name} に絵文字があります(画像では豆腐になる)`);
    }
    if (/\*\*|`|^#+\s/m.test(text)) {
      problems.push(`${name} にマークダウンの記号があります(画像ではそのまま出る)`);
    }
  };

  check("coverHead", copy.coverHead, IG_LIMITS.coverHead);
  check("coverTail", copy.coverTail, IG_LIMITS.coverTail, false);
  if (copy.points.length !== IG_POINT_COUNT) {
    problems.push(`points は${IG_POINT_COUNT}件にしてください(${copy.points.length}件)`);
  }
  copy.points.forEach((p, i) => {
    check(`points[${i}].label`, p.label, IG_LIMITS.pointLabel);
    check(`points[${i}].title`, p.title, IG_LIMITS.pointTitle);
    check(`points[${i}].body`, p.body, IG_LIMITS.pointBody);
  });
  check("closingTitle", copy.closingTitle, IG_LIMITS.closingTitle);
  check("closingBody", copy.closingBody, IG_LIMITS.closingBody);

  // キャプションは画像ではないので絵文字は許す。長さだけ見る。
  const captionLength = charLength(copy.caption.trim());
  if (!captionLength) problems.push("caption が空です");
  if (captionLength > IG_LIMITS.caption) {
    problems.push(`caption が ${captionLength}字です(上限 ${IG_LIMITS.caption}字)`);
  }

  if (copy.hashtags.length > IG_LIMITS.hashtags) {
    problems.push(`hashtags が${copy.hashtags.length}個です(Instagram の上限は${IG_LIMITS.hashtags}個)`);
  }
  for (const tag of copy.hashtags) {
    if (!tag.trim() || /[#\s]/.test(tag)) {
      problems.push(`hashtags の「${tag}」は # と空白を含めずに書いてください`);
    }
  }

  return problems;
}
