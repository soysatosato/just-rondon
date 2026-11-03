import type { ThemeIndexEntry, ThemeIndexItem } from "@/components/reading/ThemeIndex";
import { READING_THEMES } from "./reading-topics";

/**
 * テーマの表(lib/reading-topics.ts)を、いま公開されている記事だけで組む。
 *
 * 表には予約中・下書きの記事も書いてある(書いた時点で束ねておくため)。
 * 公開済みの記事の一覧(items)に無いパスは落とす。残りが minItems 本に
 * 満たないテーマは出さない(1〜2本では「テーマ」の体をなさない)。
 */
export function buildThemeIndex(
  items: Map<string, ThemeIndexItem>,
  {
    include,
    minItems = 3,
  }: { include: (key: string) => boolean; minItems?: number },
): ThemeIndexEntry[] {
  return READING_THEMES.filter((t) => include(t.key))
    .map((t) => ({
      key: t.key,
      label: t.label,
      blurb: t.blurb,
      guides: t.guides,
      items: t.members
        .map((path) => items.get(path))
        .filter((i): i is ThemeIndexItem => Boolean(i)),
    }))
    .filter((t) => t.items.length >= minItems);
}
