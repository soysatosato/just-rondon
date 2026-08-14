/**
 * 「いつ時点の情報か」を記事冒頭で明示するバッジ。
 *
 * 運賃・料金・制度は毎年変わる。読者が古い数字を鵜呑みにしないよう、
 * 本文を読み始める前に基準時点が目に入る位置に置く。
 *
 * 日単位の「最終更新」は表示しない(記事を触るたびに日付が変わり、
 * 実質的な更新が無くても更新したように見えてしまうため)。updatedAt は
 * JSON-LD の dateModified 用に呼び出し側から渡され続けているだけで、
 * ここでは使わない。
 */
export default function GuideFreshness({
  dataAsOf,
}: {
  dataAsOf: string;
  updatedAt?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        {dataAsOf}時点の情報
      </span>
    </div>
  );
}
