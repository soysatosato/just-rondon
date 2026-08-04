/**
 * 「いつ時点の情報か」を記事冒頭で明示するバッジ。
 *
 * 運賃・料金・制度は毎年変わる。読者が古い数字を鵜呑みにしないよう、
 * 本文を読み始める前に基準時点が目に入る位置に置く。
 */
export default function GuideFreshness({
  dataAsOf,
  updatedAt,
}: {
  dataAsOf: string;
  updatedAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        {dataAsOf}時点の情報
      </span>
      <time
        dateTime={updatedAt}
        className="text-gray-500 dark:text-gray-400"
      >
        最終更新: {updatedAt}
      </time>
    </div>
  );
}
