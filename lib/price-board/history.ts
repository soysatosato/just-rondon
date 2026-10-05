import snapshots from "./snapshots.json";
import type { PriceValue } from "./items";

/**
 * 物価ボードの月ごとの記録。
 *
 * 定数ファイルは「いまの値」しか持たないので、前月比を出すには確認のたびに
 * 値を書き留めておく必要がある。月次の確認(/add-monthly-changes)の最後に
 * scripts/snapshot-price-board.ts を実行すると、その時点の全品目の値と
 * ECB のレートが snapshots.json に1件追記される。手で書き換えないこと。
 *
 * 為替を一緒に残すのは、円での値上がりを「ポンドでの値上げ」と「為替」に
 * 分けて見せるため。日本の読者にとって、ロンドンが高くなった理由の半分は円安。
 */

export type PriceSnapshot = {
  /** "2026-10"。 */
  month: string;
  /** 全品目を確認した日(ISO)。 */
  checkedAt: string;
  jpyPerGbp: number;
  /** jpyPerGbp を ECB が公表した日。 */
  rateDate: string;
  /** 品目 id → その日の値(改定日を過ぎていれば改定後)。 */
  prices: Record<string, PriceValue>;
  /** その月の物価メモ。2〜3文。無い月もある。 */
  memo?: string;
  /** メモと一緒に読む月次号の slug(/changes/<slug>)。 */
  issue?: string;
};

const ALL = (snapshots as PriceSnapshot[])
  .slice()
  .sort((a, b) => a.month.localeCompare(b.month));

/** 最新の確認。ボードの「◯月◯日に確認」はこれ。 */
export function latestSnapshot(): PriceSnapshot | null {
  return ALL.at(-1) ?? null;
}

/** 最新の1つ前。前月比の基準。 */
export function previousSnapshot(): PriceSnapshot | null {
  return ALL.length >= 2 ? ALL[ALL.length - 2] : null;
}
