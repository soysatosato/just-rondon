import Link from "next/link";
import type { Content } from "@prisma/client";

/**
 * 1語ぶんのカード。
 *
 * 挿絵が無い語のほうが多い(3分の2)ので、写真ではなく英単語そのものを
 * 顔にする。上端の色帯は語ごとに固定。以前は一覧の並び順から色を決めて
 * いたが、ページ送りを入れると同じ語が面によって色を変えるので、slug から
 * 決めるようにした。番号(#01)も並び順に依存していて、語を足すたびに全部
 * ずれるので出さない(ModernBritainCard と同じ判断)。
 */

const ACCENTS = [
  {
    stripe: "bg-rose-500",
    wrap: "hover:border-rose-300 dark:hover:border-rose-800",
    eng: "text-rose-600 dark:text-rose-400",
    more: "text-rose-600 dark:text-rose-400",
  },
  {
    stripe: "bg-sky-500",
    wrap: "hover:border-sky-300 dark:hover:border-sky-800",
    eng: "text-sky-600 dark:text-sky-400",
    more: "text-sky-600 dark:text-sky-400",
  },
  {
    stripe: "bg-amber-500",
    wrap: "hover:border-amber-300 dark:hover:border-amber-800",
    eng: "text-amber-600 dark:text-amber-400",
    more: "text-amber-600 dark:text-amber-400",
  },
  {
    stripe: "bg-emerald-500",
    wrap: "hover:border-emerald-300 dark:hover:border-emerald-800",
    eng: "text-emerald-600 dark:text-emerald-400",
    more: "text-emerald-600 dark:text-emerald-400",
  },
  {
    stripe: "bg-violet-500",
    wrap: "hover:border-violet-300 dark:hover:border-violet-800",
    eng: "text-violet-600 dark:text-violet-400",
    more: "text-violet-600 dark:text-violet-400",
  },
];

/** slug から色を選ぶ。並び順が変わっても語の色が変わらないようにするだけ。 */
function accentOf(slug: string) {
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum = (sum + slug.charCodeAt(i)) % 1000;
  return ACCENTS[sum % ACCENTS.length];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function BritishEnglishCard({ item }: { item: Content }) {
  const accent = accentOf(item.slug);

  return (
    <Link
      href={`/british-english/${item.slug}`}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 ${accent.wrap}`}
    >
      <div className={`h-1.5 w-full shrink-0 ${accent.stripe}`} />

      <div className="flex min-w-0 flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[11px] text-muted-foreground">
          {formatDate(item.createdAt)}
        </p>

        {item.engTitle && (
          <p
            className={`mt-1.5 break-words text-2xl font-extrabold leading-tight tracking-tight sm:text-[26px] ${accent.eng}`}
          >
            {item.engTitle}
          </p>
        )}

        <h3 className="mt-1.5 text-sm font-bold leading-snug text-foreground">
          {item.title}
        </h3>

        {item.summary && (
          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
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
