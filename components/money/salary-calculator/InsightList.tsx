"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Info, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight, InsightTone } from "./insights";

const TONE: Record<
  InsightTone,
  { icon: typeof Info; label: string; ring: string; iconClass: string }
> = {
  warn: {
    icon: AlertTriangle,
    label: "注意",
    ring: "border-amber-300/80 bg-amber-50/70 dark:border-amber-900/70 dark:bg-amber-950/20",
    iconClass: "text-amber-700 dark:text-amber-400",
  },
  tip: {
    icon: Sparkles,
    label: "得する話",
    ring: "border-emerald-300/80 bg-emerald-50/60 dark:border-emerald-900/70 dark:bg-emerald-950/20",
    iconClass: "text-emerald-700 dark:text-emerald-400",
  },
  info: {
    icon: Info,
    label: "この条件だと",
    ring: "border-border bg-card",
    iconClass: "text-muted-foreground",
  },
};

/**
 * 計算結果から拾った「この条件の人が知っておくべきこと」。
 *
 * 注意・得する話は色つきの枠にし、アイコンと見出しの言葉でも区別する
 * (色だけに意味を持たせない)。条件を変えるとカードが入れ替わるので、
 * 出入りに動きを付けて「いま変わった」ことに気づけるようにしている。
 */
export default function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <section aria-labelledby="insights-heading">
      <h2 id="insights-heading" className="text-base font-bold tracking-tight">
        この条件で知っておきたいこと
      </h2>
      <ul className="relative mt-3 grid gap-3 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {insights.map((insight) => {
            const tone = TONE[insight.tone];
            const Icon = tone.icon;
            return (
              <motion.li
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn("flex gap-3 rounded-xl border p-4", tone.ring)}
              >
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone.iconClass)} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold tracking-wide text-muted-foreground">
                    {tone.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
                    {insight.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {insight.body}
                  </p>
                  {insight.href && insight.cta && (
                    <Link
                      href={insight.href}
                      className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-blue-700 underline-offset-4 hover:underline dark:text-blue-400"
                    >
                      {insight.cta}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
