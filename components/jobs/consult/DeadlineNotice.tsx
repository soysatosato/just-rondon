import { AlertTriangle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACAS_EARLY_CONCILIATION_URL,
  type DeadlineAdvice,
} from "@/lib/jobs/claim-deadline";

const TONE = {
  ok: "border-border bg-muted/40",
  urgent:
    "border-amber-400/60 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-950/30",
  past: "border-red-400/60 bg-red-50 dark:border-red-800/60 dark:bg-red-950/30",
} as const;

/** 期限の目安。フォーム・送信直後・受付完了画面で同じ見た目で出す。 */
export default function DeadlineNotice({
  advice,
  className,
}: {
  advice: DeadlineAdvice;
  className?: string;
}) {
  const Icon = advice.tone === "ok" ? CalendarClock : AlertTriangle;

  return (
    <div
      role={advice.tone === "ok" ? undefined : "alert"}
      className={cn("flex gap-3 rounded-lg border p-4", TONE[advice.tone], className)}
    >
      <Icon
        aria-hidden
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          advice.tone === "ok" && "text-muted-foreground",
          advice.tone === "urgent" && "text-amber-600 dark:text-amber-400",
          advice.tone === "past" && "text-red-600 dark:text-red-400",
        )}
      />
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-semibold leading-snug text-foreground">
          {advice.headline}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {advice.body}
        </p>
        <a
          href={ACAS_EARLY_CONCILIATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
        >
          Acas Early Conciliation（無料）→
        </a>
      </div>
    </div>
  );
}
