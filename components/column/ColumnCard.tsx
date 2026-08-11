import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Content } from "@prisma/client";
import { tagLabel } from "@/lib/column-taxonomy";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function ColumnCard({ item }: { item: Content }) {
  return (
    <Link href={`/column/${item.slug}`} className="block">
      <Card className="w-full min-w-0 h-full border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        {item.image && (
          <div className="relative w-full h-32 sm:h-40">
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
        )}
        <CardHeader className="space-y-1 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </p>
            {item.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {tagLabel(t)}
              </span>
            ))}
          </div>
          <CardTitle className="text-base font-semibold">
            {item.title}
          </CardTitle>
        </CardHeader>

        {item.summary && (
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground px-4 pb-4">
            <p className="line-clamp-3">{item.summary}</p>
            <p className="text-right text-xs text-sky-600 dark:text-sky-300 font-medium">
              続きを読む →
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
