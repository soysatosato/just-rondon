import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import {
  CalendarDays,
  MapPin,
  Train,
  Ticket,
  ExternalLink,
  TriangleAlert,
  ChevronDown,
} from "lucide-react";
import type { WeeklyBriefItem } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getKindMeta, getSeverityMeta, getTimingLabel } from "@/lib/weekly";

/**
 * この字数を超える本文は折りたたむ。
 *
 * 実データの本文は300〜1400字で、中央値がおよそ530字。しきい値を中央値より
 * 下に置くことで大半の項目が畳まれ、一覧のスクロール量が減る。300字台の短い
 * 項目まで畳むと、開く手間だけ増えて読める量が変わらないため下限は残す。
 */
const COLLAPSE_THRESHOLD = 400;

function formatPeriod(start: Date | null, end: Date | null): string | null {
  if (!start && !end) return null;
  if (start && end) {
    if (start.getTime() === end.getTime()) return format(start, "M月d日");
    return `${format(start, "M月d日")}〜${format(end, "M月d日")}`;
  }
  return format((start ?? end) as Date, "M月d日");
}

export default function BriefItemCard({
  item,
  /**
   * 号の主役として大きく出すか。号の先頭1〜2件にだけ立てる想定で、
   * 文字だけのカードが延々と続くのを避けて「その週の顔」を作る。
   */
  featured = false,
}: {
  item: WeeklyBriefItem;
  featured?: boolean;
}) {
  const kind = getKindMeta(item.kind);
  const severity = getSeverityMeta(item.severity);
  const timingLabel = getTimingLabel(item.timing);
  const Icon = kind.icon;

  // 旅程を組み替える必要があるものは、他の項目に埋もれさせない。
  const isCritical = item.severity === "high";

  // 主役カードは開いた状態で見せる。畳むと大きくした意味が無くなる。
  const isCollapsible =
    !featured && item.description.length > COLLAPSE_THRESHOLD;

  const facts = [
    { icon: CalendarDays, label: formatPeriod(item.startDate, item.endDate) },
    { icon: MapPin, label: item.venue ?? item.area },
    { icon: Train, label: item.nearestStation },
    { icon: Ticket, label: item.priceInfo },
  ].filter((f): f is { icon: typeof CalendarDays; label: string } =>
    Boolean(f.label)
  );

  const body = (
    <div
      className={cn(
        "prose prose-sm max-w-none leading-relaxed text-muted-foreground marker:text-muted-foreground dark:prose-invert dark:text-gray-300 prose-headings:text-foreground prose-strong:text-foreground dark:prose-strong:text-white",
        featured && "sm:prose-base"
      )}
    >
      <ReactMarkdown>{item.description}</ReactMarkdown>
    </div>
  );

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md dark:bg-neutral-900",
        isCritical
          ? "border-red-500/40 shadow-sm dark:border-red-500/30"
          : "border-border dark:border-neutral-700",
        // 主役カードは枠を強めて、通常カードの列と地続きに見えないようにする。
        featured &&
          !isCritical &&
          "border-primary/30 shadow-sm dark:border-primary/30"
      )}
    >
      {/* 重要度が最も高い項目だけ、カード上端に色帯を引いて一覧の中で拾えるようにする。 */}
      {isCritical && <div className="h-1 w-full bg-red-500" />}

      <div className={cn("p-4 sm:p-5", featured && "sm:p-6 md:p-7")}>
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold",
              kind.iconWrapClass
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {kind.label}
          </span>

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

        <h3
          className={cn(
            "font-bold leading-snug dark:text-white",
            featured
              ? "text-lg sm:text-xl md:text-2xl"
              : "text-[15px] sm:text-base"
          )}
        >
          {item.title}
        </h3>

        {severity && (
          <p className="mt-1.5 text-xs text-muted-foreground dark:text-gray-400">
            {severity.action}
          </p>
        )}

        {/* 「まだ覆りうる」情報であることは、本文より先に伝える必要がある。 */}
        {item.status === "planned" && (
          <p className="mt-3 flex gap-2 rounded-lg border border-amber-600/30 bg-amber-600/5 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              予告の段階です。中止・変更になる可能性があるため、出発前に公式サイトで確認してください。
            </span>
          </p>
        )}

        {/* 縦積みのdlは狭い画面で場所を食う。折り返すチップにして情報密度を上げる。 */}
        {facts.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {facts.map(({ icon: FactIcon, label }) => (
              <li
                key={label}
                className={cn(
                  "inline-flex items-center gap-1.5 text-muted-foreground dark:text-gray-400",
                  featured ? "text-xs sm:text-sm" : "text-xs"
                )}
              >
                <FactIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        )}

        {isCollapsible ? (
          /*
           * 長い本文の折りたたみ。details/summary で組むのでクライアントJSは
           * 要らず、Ctrl+F の検索でも中身が拾える(閉じていてもブラウザが開く)。
           * group/body で開閉状態を子に伝え、矢印の向きと文言を切り替える。
           */
          <details className="group/body mt-3">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-open/body:rotate-180" />
              <span className="group-open/body:hidden">続きを読む</span>
              <span className="hidden group-open/body:inline">閉じる</span>
            </summary>
            <div className="mt-3">{body}</div>
          </details>
        ) : (
          <div className="mt-3">{body}</div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 dark:border-neutral-800">
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              公式サイト
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {/* 出典は必ず出す。ストライキや休館の情報は検証できて初めて価値がある。 */}
          {item.source === item.website ? (
            item.sourceName && (
              <span className="text-xs text-muted-foreground dark:text-gray-400">
                出典: {item.sourceName}
              </span>
            )
          ) : (
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline dark:text-gray-400"
            >
              出典{item.sourceName ? `: ${item.sourceName}` : ""}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
