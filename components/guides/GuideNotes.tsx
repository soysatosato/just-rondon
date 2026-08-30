/**
 * 「実務メモ」。本文の主張から外れる補足を、本文と視覚的に分ける。
 * TravelGuideLayout の tips と同じ見た目にそろえてある。
 */
export default function GuideNotes({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
      <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
        実務メモ
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
        {items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
