/**
 * 「◯月のロンドン」の節。見出しの番号は節ナビ(GuideSectionNav)の
 * 番号と一致させる。旅の実用情報の節と同じ組み方にそろえてある。
 */
export default function MonthSection({
  n,
  id,
  title,
  children,
}: {
  n: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20 first-of-type:mt-0">
      <h2 className="mb-4 flex items-baseline gap-2.5 text-xl font-bold text-gray-900 dark:text-gray-100">
        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
