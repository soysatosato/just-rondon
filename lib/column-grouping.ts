import type { Content } from "@prisma/client";

export type ColumnSeries = {
  name: string;
  entries: Content[];
};

/**
 * コラム一覧を「連載」と「単発」に分ける。
 * 連載は seriesOrder 昇順、連載どうしは最新話の新しい順に並ぶ。
 * 1本しか無い seriesName は連載として扱わず単発に混ぜる（連載開始直後に
 * 「全1回」のセクションが出てしまうのを避けるため）。
 */
export function groupColumns(columns: Content[]): {
  series: ColumnSeries[];
  standalone: Content[];
} {
  const bySeries = new Map<string, Content[]>();
  const standalone: Content[] = [];

  for (const c of columns) {
    if (c.seriesName) {
      const list = bySeries.get(c.seriesName);
      if (list) list.push(c);
      else bySeries.set(c.seriesName, [c]);
    } else {
      standalone.push(c);
    }
  }

  const series: ColumnSeries[] = [];

  for (const [name, entries] of bySeries) {
    if (entries.length < 2) {
      standalone.push(...entries);
      continue;
    }
    series.push({
      name,
      entries: entries
        .slice()
        .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)),
    });
  }

  series.sort((a, b) => latestAt(b.entries) - latestAt(a.entries));
  standalone.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { series, standalone };
}

function latestAt(entries: Content[]): number {
  return Math.max(...entries.map((e) => e.createdAt.getTime()));
}

/** タグ絞り込み用に、実際に使われているタグと件数を集計する。 */
export function countTags(columns: Content[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of columns) {
    for (const t of c.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return counts;
}

/** 検索ボックス用。タイトル・要約・連載名を対象にした素朴な部分一致。 */
export function matchesQuery(column: Content, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [column.title, column.engTitle, column.summary, column.seriesName]
    .filter(Boolean)
    .some((field) => (field as string).toLowerCase().includes(q));
}
