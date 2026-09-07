import Link from "next/link";
import type { Content } from "@prisma/client";
import { modernBritainTagLabel } from "@/lib/modern-britain-taxonomy";

/**
 * 論考1本ぶんのカード。
 *
 * 上端の色帯は slug から決める。以前は一覧の並び順から選んでいたが、
 * ページ送りを入れると同じ記事が面によって色を変えるため。
 */

const ACCENTS = [
  {
    stripe: "bg-indigo-500",
    wrap: "hover:border-indigo-300 dark:hover:border-indigo-800",
    more: "text-indigo-600 dark:text-indigo-400",
  },
  {
    stripe: "bg-cyan-500",
    wrap: "hover:border-cyan-300 dark:hover:border-cyan-800",
    more: "text-cyan-600 dark:text-cyan-400",
  },
  {
    stripe: "bg-fuchsia-500",
    wrap: "hover:border-fuchsia-300 dark:hover:border-fuchsia-800",
    more: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    stripe: "bg-lime-500",
    wrap: "hover:border-lime-300 dark:hover:border-lime-800",
    more: "text-lime-600 dark:text-lime-400",
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** slug から色を選ぶ。並び順が変わっても記事の色が変わらないようにするだけ。 */
function accentOf(slug: string) {
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum = (sum + slug.charCodeAt(i)) % 1000;
  return ACCENTS[sum % ACCENTS.length];
}

export default function ModernBritainCard({ item }: { item: Content }) {
  const accent = accentOf(item.slug);

  return (
    <Link
      href={`/modern-britain/${item.slug}`}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 ${accent.wrap}`}
    >
      <div className={`h-1.5 w-full shrink-0 ${accent.stripe}`} />

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
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col px-5 pb-5 pt-4">
        {/* 並びは createdAt の降順なので、通し番号を振ると記事を足すたびに
            全カードの番号がずれる。日付だけを出す。 */}
        <p className="text-[11px] text-muted-foreground">
          {formatDate(item.createdAt)}
        </p>

        <h3 className="mt-1.5 line-clamp-4 text-[15px] font-bold leading-snug tracking-tight text-foreground">
          {item.title}
        </h3>

        {item.summary && (
          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {modernBritainTagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        <p
          className={`mt-auto pt-4 text-right text-xs font-semibold transition-transform duration-200 group-hover:translate-x-0.5 ${accent.more}`}
        >
          続きを読む →
        </p>
      </div>
    </Link>
  );
}
