import Link from "next/link";
import type { Content } from "@prisma/client";
import { tagLabel } from "@/lib/column-taxonomy";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * 一覧に並べる1本ぶんのカード。
 *
 * 見出しの平均が50字あるので、画像の上に重ねず下に置く。重ねると3行に
 * 折れて写真を潰し、どのカードも「文字の板」になってしまう。
 *
 * 高さは中身で決まる。連載回だけ帯が1本増えるが、grid の行の高さが揃うので
 * カード自体は h-full で伸ばして底を合わせる。
 */
export default function ColumnCard({
  item,
  seriesBadge,
}: {
  item: Content;
  /** 連載回のときだけ「連載名 第N回」。単発では渡さない。 */
  seriesBadge?: string;
}) {
  return (
    <Link
      href={`/column/${item.slug}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/5 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-amber-800"
    >
      {item.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
          {seriesBadge && (
            <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-amber-600/95 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
              {seriesBadge}
            </span>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
          <time className="font-medium text-muted-foreground">
            {formatDate(item.createdAt)}
          </time>
          {item.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {tagLabel(t)}
            </span>
          ))}
        </div>

        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug tracking-tight transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">
          {item.title}
        </h3>

        {item.summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        )}

        <span className="mt-auto pt-1 text-[11px] font-bold text-amber-700 opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber-400">
          続きを読む →
        </span>
      </div>
    </Link>
  );
}
