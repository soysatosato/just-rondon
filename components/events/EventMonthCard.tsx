import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Content } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { eventMonthPath, getMonthNumber, getSeasonMeta } from "@/lib/events";
import SeasonBadge from "@/components/events/SeasonBadge";
import { getLondonClimate } from "@/lib/london-months/climate";

/**
 * archiveBasePath を渡すと、その年のアーカイブ(年入りの URL)へリンクする。
 * 渡さなければ年の無い月別ページ(/events/december)へ。
 *
 * 月別ページへのカードには平年の気温を添える。カレンダーで旅行の時期を
 * 決める人は、イベントと同じくらい「その月は寒いか」で月を絞るため。
 * アーカイブ(過去の年の行事)には要らないので出さない。
 */
export default function EventMonthCard({
  content,
  fallbackMonthNumber,
  archiveBasePath,
}: {
  content: Content;
  fallbackMonthNumber: number;
  archiveBasePath?: string;
}) {
  const monthNumber = getMonthNumber(content.slug, fallbackMonthNumber);
  const meta = getSeasonMeta(monthNumber);
  const Icon = meta.icon;
  const href = archiveBasePath
    ? `${archiveBasePath}/${content.slug}`
    : eventMonthPath(monthNumber);
  const climate = archiveBasePath ? null : getLondonClimate(monthNumber);

  return (
    <Link href={href} className="group block h-full">
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
            {climate && (
              <p className="mt-1 text-xs tabular-nums text-muted-foreground dark:text-gray-400">
                平年 最高{Math.round(climate.maxTemp)}℃ / 最低
                {Math.round(climate.minTemp)}℃・雨の日 月
                {Math.round(climate.rainDays)}日
              </p>
            )}
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
