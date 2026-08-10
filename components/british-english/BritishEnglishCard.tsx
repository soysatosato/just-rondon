import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Content } from "@prisma/client";

const ACCENTS = [
  {
    stripe: "bg-rose-500",
    wrap: "hover:border-rose-300 dark:hover:border-rose-800",
    eng: "text-rose-600 dark:text-rose-400",
    num: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
    more: "text-rose-600 dark:text-rose-400",
  },
  {
    stripe: "bg-sky-500",
    wrap: "hover:border-sky-300 dark:hover:border-sky-800",
    eng: "text-sky-600 dark:text-sky-400",
    num: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    more: "text-sky-600 dark:text-sky-400",
  },
  {
    stripe: "bg-amber-500",
    wrap: "hover:border-amber-300 dark:hover:border-amber-800",
    eng: "text-amber-600 dark:text-amber-400",
    num: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    more: "text-amber-600 dark:text-amber-400",
  },
  {
    stripe: "bg-emerald-500",
    wrap: "hover:border-emerald-300 dark:hover:border-emerald-800",
    eng: "text-emerald-600 dark:text-emerald-400",
    num: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    more: "text-emerald-600 dark:text-emerald-400",
  },
  {
    stripe: "bg-violet-500",
    wrap: "hover:border-violet-300 dark:hover:border-violet-800",
    eng: "text-violet-600 dark:text-violet-400",
    num: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    more: "text-violet-600 dark:text-violet-400",
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function BritishEnglishCard({
  item,
  index = 0,
}: {
  item: Content;
  index?: number;
}) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <Link href={`/british-english/${item.slug}`} className="group block">
      <Card
        className={`h-full w-full min-w-0 overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 ${accent.wrap}`}
      >
        <div className={`h-1.5 w-full ${accent.stripe}`} />

        <div className="px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${accent.num}`}
            >
              #{String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>

          {item.engTitle && (
            <p
              className={`mb-1.5 break-words text-2xl font-extrabold leading-tight tracking-tight sm:text-[26px] ${accent.eng}`}
            >
              {item.engTitle}
            </p>
          )}

          <h3 className="text-sm font-bold leading-snug text-foreground">
            {item.title}
          </h3>

          {item.summary && (
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {item.summary}
            </p>
          )}

          <p
            className={`mt-4 text-right text-xs font-semibold transition-transform duration-200 group-hover:translate-x-0.5 ${accent.more}`}
          >
            続きを読む →
          </p>
        </div>
      </Card>
    </Link>
  );
}
