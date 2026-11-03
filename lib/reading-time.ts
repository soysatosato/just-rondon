import { stripInlineMarkdown } from "./plain-text";

/**
 * 読み物の「約◯分」。和文の黙読は1分あたり500字前後を目安にする。
 *
 * コラムは1本3,000〜1万1,000字と幅があり、開く前に長さが分からなかった。
 * 長い記事ほど「あとで読む」か「いま読む」かを決める材料になる。
 */
const CHARS_PER_MINUTE = 500;

export function readingMinutes(parts: (string | null | undefined)[]): number {
  const chars = parts
    .filter((p): p is string => Boolean(p))
    .map((p) => stripInlineMarkdown(p).replace(/\s+/g, "").length)
    .reduce((a, b) => a + b, 0);
  return Math.max(1, Math.round(chars / CHARS_PER_MINUTE));
}
