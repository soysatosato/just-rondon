import type { GuideCalloutData } from "@/components/guides/types";
import type { Day } from "./content";

/**
 * 分岐版(雨の日・子連れ・乗り継ぎ)の本文を組み立てる部品の語彙。
 *
 * トップレベルの8本はそれぞれ性質が違ったので専用のレイアウトを与えたが、
 * 分岐版3本は「制約付きの1日プラン」という同じ種類の文書で、
 * 出てくる型も同じ——判定・ルート・候補一覧・避けるもの・実務メモ。
 * だから3本ぶん別々に書かず、形の決まったブロックを組み合わせる。
 *
 * ブロックは種類ごとに描画の形が違う(verdicts はバッジ、timeline は
 * 時間帯の帯)。「同じ見た目のカードに流す」ためのものではないので、
 * 新しい形が要るときは kind を足すこと。prose に逃がさないこと。
 */
export type Block =
  /** markdown。判定や一覧に落とせない地の文だけに使う。 */
  | { kind: "prose"; body: string }
  /** 「する/しない」「必要/不要」を先頭のバッジで返す判定。 */
  | {
      kind: "verdicts";
      items: {
        label: string;
        verdict: string;
        tone: "good" | "bad" | "neutral";
        detail?: string;
      }[];
    }
  /** 見出し＋短い本文のカード。2列か3列。 */
  | {
      kind: "cards";
      cols?: 2 | 3;
      items: { head: string; body: string; note?: string; best?: boolean }[];
    }
  /** 箇条書き。tone を付けると ✓ / ✕ が出る。 */
  | {
      kind: "list";
      title?: string;
      tone?: "do" | "dont";
      items: string[];
    }
  /** 施設や選択肢の一覧。メタ情報を横に並べる(表にしない)。 */
  | {
      kind: "rows";
      items: {
        name: string;
        meta?: { label: string; value: string }[];
        note?: string;
        free?: boolean;
      }[];
    }
  /** 1日ぶんの時間割。親のモデルコースと同じ形。 */
  | { kind: "timeline"; day: Day }
  /** 手順。番号付き。 */
  | { kind: "steps"; items: string[] }
  /** 実務メモ。 */
  | { kind: "notes"; items: string[] }
  | ({ kind: "callout" } & GuideCalloutData);

export type VariantSection = {
  id: string;
  label: string;
  navLabel: string;
  /** 見出しの下に出る一行。 */
  subtitle?: string;
  blocks: Block[];
};
