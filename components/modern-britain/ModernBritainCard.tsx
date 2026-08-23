import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Content } from "@prisma/client";
import { modernBritainTagLabel } from "@/lib/modern-britain-taxonomy";

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

        {item.image && (
          <div className="relative h-32 w-full sm:h-40">
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
        )}

        <div className="px-5 pb-5 pt-4">
          {/* 並びは createdAt の降順なので、通し番号を振ると記事を足すたびに
              全カードの番号がずれる。日付だけを出す。 */}
          <div className="mb-3 flex items-center gap-2">
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
