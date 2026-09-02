/**
 * 掴んで動かす操作の受け渡し。
 *
 * 掴んだ側(行)と落ちる先(別の日のカード)が別の枝にいるので、状態は
 * 両方の親である PlanBuilder が持ち、ここでは形だけを決めておく。
 *
 * index は「掴んだものを抜く前の並びで数えた番号」。抜いてから数えると、
 * 同じ日の中で後ろへ動かすときに1つずれる。ずれの補正は、元の位置を
 * 知っている落とす側(PlanBuilder)に閉じ込めてある。
 */

/** いま掴んでいるもの。掴んでいなければ null。 */
export type DragState = {
  slug: string;
  day: number;
  index: number;
} | null;

/** いま落ちる先。掴んでいないか、行の外にいれば null。 */
export type DropTarget = {
  day: number;
  index: number;
} | null;
