/**
 * 読み物の「要点」(コラム・英国のいま)と「早わかり」(イギリス英語)。
 *
 * DB では Content.description にマークダウンの箇条書きで入っている。
 * 読み物のカテゴリはこの列を使っていなかった(街の記事だけが区の名前に
 * 使っている。lib/area-taxonomy.ts)ので、列を足すマイグレーションを
 * 増やさずに載せた。投入は作成・更新スクリプトの `keyPoints`(文字列の配列)。
 *
 * 書き方:
 *   - コラム・英国のいま: 記事の結論を3点前後。本文に書いてある事実だけで、
 *     要点にしか無い情報を足さない。検索から来た読者はここだけ読んで帰っても
 *     答えが持ち帰れるようにする。
 *   - イギリス英語: 「**意味**: …」「**場面**: …」のように見出しを太字で
 *     始めると、ラベルと値の表として描く(KeyPoints.tsx)。
 *
 * クライアントからも呼べるよう、このファイルには何も import しない。
 */

/** 箇条書きのマークダウンにする。空の項目は落とす。 */
export function formatKeyPoints(points: readonly string[]): string {
  return points
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((p) => `- ${p}`)
    .join("\n");
}

/** Content.description を項目の配列に戻す。箇条書きでない行は前の項目に続ける。 */
export function parseKeyPoints(markdown: string | null | undefined): string[] {
  if (!markdown?.trim()) return [];
  const items: string[] = [];
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const m = /^(?:[-*+]|\d+\.)\s+(.*)$/.exec(line);
    if (m) items.push(m[1].trim());
    else if (items.length > 0) items[items.length - 1] += ` ${line}`;
    else items.push(line);
  }
  return items.filter(Boolean);
}

export type LabeledPoint = { label: string; value: string };

/**
 * 「**意味**: とても嬉しい」の形の項目をラベルと値に分ける。
 * 区切りは半角・全角のコロン。形が違えば null。
 */
export function splitLabeledPoint(item: string): LabeledPoint | null {
  const m = /^\*\*([^*]{1,16})\*\*\s*[:：]\s*(.+)$/.exec(item);
  return m ? { label: m[1].trim(), value: m[2].trim() } : null;
}
