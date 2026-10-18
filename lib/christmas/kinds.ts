import type { SeasonKind } from "./types";

/**
 * 種類の名前と並び。ブラウザの部品(StayPlanner)からも読むので、
 * データを持たない小さなモジュールに分けてある。
 */
export const KIND_LABELS: Record<SeasonKind, string> = {
  lights: "灯り",
  market: "マーケット",
  rink: "スケートリンク",
  event: "催し",
};

export const KIND_ORDER: readonly SeasonKind[] = ["lights", "market", "rink", "event"];
