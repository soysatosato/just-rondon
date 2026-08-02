import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Content } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getMonthNumber, getSeasonMeta } from "@/lib/events";
import SeasonBadge from "@/components/events/SeasonBadge";

export default function EventMonthCard({
  content,
  fallbackMonthNumber,
  basePath = "/events",
}: {
  content: Content;
  fallbackMonthNumber: number;
  basePath?: string;
}) {
  const monthNumber = getMonthNumber(content.slug, fallbackMonthNumber);
  const meta = getSeasonMeta(monthNumber);
  const Icon = meta.icon;

  return (
    <Link href={`${basePath}/${content.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-2xl border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-neutral-900 dark:border-neutral-700">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                meta.iconWrapClass
              )}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className="text-xs font-semibold tracking-widest text-muted-foreground">
              {String(monthNumber).padStart(2, "0")}
            </span>
          </div>

          <div className="flex-1">
            <SeasonBadge monthNumber={monthNumber} className="mb-2" />
            <h3 className="text-lg font-semibold leading-snug dark:text-white">
              {content.title}
            </h3>
            {content.summary && (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground dark:text-gray-400">
                {content.summary}
              </p>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
            詳細を見る <ArrowRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
