import Link from "next/link";

/**
 * このスポットが出てくるコラム。スポット詳細からコラムへの導線。
 *
 * 対応は ContentAttraction に人が登録したものだけで、名前が本文に
 * 出てくるだけのコラムは並ばない(理由はスキーマのコメント)。
 *
 * コラムの見出しは平均50字あるので、写真の上に重ねず横に並べる。
 * 何の話かは見出しと要約で伝える。「関連記事」とだけ置くと、
 * 観光ガイドの焼き直しだと思われて踏まれない。
 */
export type AttractionColumn = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  image: string | null;
  seriesName: string | null;
};

export default function AttractionColumnLinks({
  attractionName,
  columns,
}: {
  attractionName: string;
  columns: AttractionColumn[];
}) {
  if (columns.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {attractionName}が出てくるコラム
        </h2>
        <p className="text-sm text-muted-foreground">
          このスポットにまつわる歴史や逸話を、1本ずつ掘り下げた読み物です。
        </p>
      </div>

      <ul className="space-y-3">
        {columns.map((column) => (
          <li key={column.id}>
            <Link
              href={`/column/${column.slug}`}
              className="group flex gap-4 rounded-2xl border border-border p-3
                transition hover:border-amber-300 hover:shadow-md
                dark:hover:border-amber-800 sm:p-4"
            >
              {column.image && (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-36">
                  <img
                    src={column.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                {/* 回数は見出しの末尾に「第N回」として入っているので、
                    ここでは連載名だけを出す。 */}
                {column.seriesName && (
                  <p className="truncate text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    連載「{column.seriesName}」
                  </p>
                )}
                <p className="line-clamp-3 text-sm font-semibold leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400">
                  {column.title}
                </p>
                {column.summary && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {column.summary}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
