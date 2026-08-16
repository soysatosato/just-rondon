/**
 * category は DB 上 "historic" のような英字スラッグなので、そのまま出すと
 * 読者には意味が伝わらない。リンク先(フィルタ)はスラッグのまま、
 * 表示だけ日本語の短いラベルに置き換える。
 *
 * スポット詳細のチップと無料スポット一覧の見出しで共用する。
 */
export const categoryChipMap: Record<string, string> = {
  entertainment: "エンタメ・体験",
  tour: "ツアー・街歩き",
  garden: "庭園・公園",
  royal: "王室・宮殿",
  shop: "ショッピング",
  architecture: "建築・街並み",
  historic: "歴史・文化",
  seasonal: "季節限定",
  museum: "美術館・博物館",
};

export function categoryLabel(category: string): string {
  return categoryChipMap[category] ?? category;
}
