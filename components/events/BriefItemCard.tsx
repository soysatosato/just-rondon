import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { CalendarDays, MapPin, Train, Ticket, ExternalLink } from "lucide-react";
import type { WeeklyBriefItem } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getKindMeta, getSeverityMeta, getTimingLabel } from "@/lib/weekly";

function formatPeriod(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  if (start && end) {
    if (start.getTime() === end.getTime()) return format(start, "M月d日");
    return `${format(start, "M月d日")}〜${format(end, "M月d日")}`;
  }
  const single = (start ?? end) as Date;
  return format(single, "M月d日");
}

export default function BriefItemCard({ item }: { item: WeeklyBriefItem }) {
  const kind = getKindMeta(item.kind);
  const severity = getSeverityMeta(item.severity);
  const timingLabel = getTimingLabel(item.timing);
  const Icon = kind.icon;

  const period = formatPeriod(item.startDate, item.endDate);
  const facts = [
    period ? { icon: CalendarDays, label: period } : null,
    item.venue ? { icon: MapPin, label: item.venue } : null,
    item.nearestStation ? { icon: Train, label: item.nearestStation } : null,
    item.priceInfo ? { icon: Ticket, label: item.priceInfo } : null,
  ].filter((f): f is { icon: typeof CalendarDays; label: string } => f !== null);

  return (
    <Card className="rounded-2xl transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      <CardContent className="flex gap-4 p-5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            kind.iconWrapClass
          )}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={cn("text-[10px]", kind.badgeClass)}>
              {kind.label}
            </Badge>
            {severity && (
              <Badge
                variant="outline"
                className={cn("text-[10px]", severity.badgeClass)}
                title={severity.action}
              >
                {severity.label}
              </Badge>
            )}
            {/* 「今週」は既定なので出さない。「予告」だけを目立たせる。 */}
            {item.timing === "announced" && timingLabel && (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-[10px] text-primary"
              >
                {timingLabel}
              </Badge>
            )}
            {item.isFree && (
              <Badge
                variant="outline"
                className="border-emerald-600/40 bg-emerald-600/10 text-[10px] text-emerald-700 dark:text-emerald-400"
              >
                無料
              </Badge>
            )}
          </div>

          <h3 className="text-base font-semibold leading-snug dark:text-white">
            {item.title}
          </h3>

          {/* 「まだ覆りうる」情報であることは、本文より先に伝える必要がある。 */}
          {item.status === "planned" && (
            <p className="mt-2 rounded-lg border border-amber-600/30 bg-amber-600/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              予告の段階です。中止・変更になる可能性があるため、出発前に公式サイトで確認してください。
            </p>
          )}

          {facts.length > 0 && (
            <dl className="mt-3 space-y-1.5">
              {facts.map(({ icon: FactIcon, label }) => (
                <div
                  key={label}
                  className="flex gap-2 text-xs text-muted-foreground dark:text-gray-400"
                >
                  <FactIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0">{label}</span>
                </div>
              ))}
            </dl>
          )}

          <div className="prose prose-sm mt-3 max-w-none text-muted-foreground dark:prose-invert dark:text-gray-300">
            <ReactMarkdown>{item.description}</ReactMarkdown>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {item.website && (
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-2"
              >
                公式サイトを見る
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {/* 出典は必ず出す。ストライキや休館の情報は検証できて初めて価値がある。 */}
            {item.source !== item.website && (
              <a
                href={item.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-2 dark:text-gray-400"
              >
                出典{item.sourceName ? `: ${item.sourceName}` : ""}
              </a>
            )}
            {item.source === item.website && item.sourceName && (
              <span className="text-xs text-muted-foreground dark:text-gray-400">
                出典: {item.sourceName}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
