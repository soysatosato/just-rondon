// 「いまのイギリス」のテーマ分類。DB の Content.tags に入る値の正典。
// ここに無いタグは /modern-britain のフィルタに現れないので、タグを増やすときは
// 必ずここに追加する。
//
// コラム(lib/column-taxonomy.ts)とキーを分けているのは、扱う時間軸が違うため。
// あちらは「何が起源か」で切るので history / person が要るが、こちらは
// 「いま何が起きているか」で切るので、暮らし・金・世相の粒度が要る。

export const MODERN_BRITAIN_TAGS = [
  { key: "food", label: "食と店" },
  { key: "money", label: "物価・お金" },
  { key: "manners", label: "習慣・マナー" },
  { key: "media", label: "テレビ・ネット" },
  { key: "society", label: "世相・ニュース" },
] as const;

export type ModernBritainTagKey = (typeof MODERN_BRITAIN_TAGS)[number]["key"];

const TAG_LABELS = new Map<string, string>(
  MODERN_BRITAIN_TAGS.map((t) => [t.key, t.label]),
);

export function modernBritainTagLabel(key: string): string {
  return TAG_LABELS.get(key) ?? key;
}

export function isKnownModernBritainTag(
  key: string,
): key is ModernBritainTagKey {
  return TAG_LABELS.has(key);
}
