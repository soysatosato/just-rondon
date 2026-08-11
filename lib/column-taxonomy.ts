// コラムのテーマ分類。DB の Content.tags に入る値の正典。
// ここに無いタグは /column のフィルタに現れないので、タグを増やすときは必ずここに追加する。

export const COLUMN_TAGS = [
  { key: "history", label: "歴史・事件" },
  { key: "person", label: "人物" },
  { key: "institution", label: "王室・制度" },
  { key: "daily", label: "暮らし・技術" },
  { key: "city", label: "ロンドンの街" },
] as const;

export type ColumnTagKey = (typeof COLUMN_TAGS)[number]["key"];

const TAG_LABELS = new Map<string, string>(
  COLUMN_TAGS.map((t) => [t.key, t.label]),
);

export function tagLabel(key: string): string {
  return TAG_LABELS.get(key) ?? key;
}

export function isKnownTag(key: string): key is ColumnTagKey {
  return TAG_LABELS.has(key);
}
