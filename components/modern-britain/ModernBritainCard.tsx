import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Content } from "@prisma/client";
import { modernBritainTagLabel } from "@/lib/modern-britain-taxonomy";

const ACCENTS = [
  {
    stripe: "bg-indigo-500",
    wrap: "hover:border-indigo-300 dark:hover:border-indigo-800",
    num: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    more: "text-indigo-600 dark:text-indigo-400",
  },
  {
    stripe: "bg-cyan-500",
    wrap: "hover:border-cyan-300 dark:hover:border-cyan-800",
    num: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
    more: "text-cyan-600 dark:text-cyan-400",
  },
  {
    stripe: "bg-fuchsia-500",
    wrap: "hover:border-fuchsia-300 dark:hover:border-fuchsia-800",
    num: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
    more: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  {
    stripe: "bg-lime-500",
    wrap: "hover:border-lime-300 dark:hover:border-lime-800",
    num: "bg-lime-100 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300",
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

export default function ModernBritainCard({
  item,
  index = 0,
}: {
  item: Content;
  index?: number;
}) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <Link href={`/modern-britain/${item.slug}`} className="group block">
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

          <h3 className="text-base font-bold leading-snug tracking-tight text-foreground">
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
            className={`mt-4 text-right text-xs font-semibold transition-transform duration-200 group-hover:translate-x-0.5 ${accent.more}`}
          >
            続きを読む →
          </p>
        </div>
      </Card>
    </Link>
  );
}
