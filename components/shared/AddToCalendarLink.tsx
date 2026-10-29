"use client";

import { CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * .ics を配るリンク(/calendar/...)。押すと端末のカレンダーに取り込む画面が開く。
 *
 * 押された数を GA4 に送る(calendar_add)。会員の「知らせて」メールを作る前に、
 * 日付を知らせてほしい読者がどれだけいるかを、この数で見る。
 */
export default function AddToCalendarLink({
  href,
  target,
  children,
  className,
}: {
  href: string;
  /** GA4 に送る識別子。「christmas」「event:<slug>」。 */
  target: string;
  children: React.ReactNode;
  className?: string;
}) {
  const track = () => {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", "calendar_add", { target });
  };

  return (
    <a
      href={href}
      rel="nofollow"
      onClick={track}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </a>
  );
}
