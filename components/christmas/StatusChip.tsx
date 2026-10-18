import type { DayStatus } from "@/lib/christmas/season";
import { cn } from "@/lib/utils";

/**
 * 「今日」の状態の札。色だけに頼らず、必ず文字で状態を書く。
 */
const STYLES: Record<DayStatus, string> = {
  open: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  before: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  "closed-day": "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  after: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  unknown: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300",
  unannounced: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300",
};

export function statusLabel(status: DayStatus, lights = false): string {
  switch (status) {
    case "open":
      return lights ? "点灯中" : "開催中";
    case "before":
      return "これから";
    case "closed-day":
      return "今日は休み";
    case "after":
      return "終了";
    case "unknown":
      return "今日の営業は未確認";
    case "unannounced":
      return "未発表";
  }
}

export default function StatusChip({
  status,
  lights = false,
  className,
}: {
  status: DayStatus;
  lights?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      {statusLabel(status, lights)}
    </span>
  );
}
