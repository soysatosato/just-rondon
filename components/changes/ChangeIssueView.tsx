import Link from "next/link";
import { format } from "date-fns";
import { History } from "lucide-react";
import type { MonthlyChangeIssue, MonthlyChangeItem } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  TIMING_SECTIONS,
  formatMonthJa,
  getChangeIssueFreshness,
} from "@/lib/changes";
import ChangeEntry from "@/components/changes/ChangeEntry";

type IssueWithItems = MonthlyChangeIssue & { items: MonthlyChangeItem[] };

/**
 * 月次号の本体。題字 → 過去号の注意 → 「変わったこと」「これから変わること」。
 *
 * 組みは週次(components/events/WeeklyBriefView.tsx)に揃えている。
 * 同じサイトの「号」なので、罫の太さと欧文の添え方が違うと別の刷り物に見える。
 */
export default function ChangeIssueView({
  issue,
  now = new Date(),
}: {
  issue: IssueWithItems;
  now?: Date;
}) {
  const freshness = getChangeIssueFreshness(issue.monthStart, now);
  const monthLabel = formatMonthJa(issue.monthStart);

  const sections = TIMING_SECTIONS.map((section) => ({
    ...section,
    items: issue.items.filter((item) => item.timing === section.timing),
  })).filter(({ items }) => items.length > 0);

  // 号を通した番号。節ごとに 01 から振り直すと、同じ号に 01 が2つ現れる。
  const numberById = new Map<string, number>();
  let running = 0;
  for (const { items } of sections) {
    for (const item of items) numberById.set(item.id, ++running);
  }

  return (
    <div>
      <header className="mb-10">
        <div className="h-[3px] bg-foreground" />
        <div className="flex items-baseline justify-between gap-4 border-b border-foreground/20 py-2">
          <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
            What Changed in London
          </p>
          <p className="shrink-0 font-serif text-[11px] font-semibold tabular-nums tracking-[0.14em] text-muted-foreground">
            {issue.slug.replace("-", ".")}
          </p>
        </div>

        <div className="pt-6">
          <h1 className="text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-[2.75rem] dark:text-white">
            {issue.title}
          </h1>

          <p className="mt-4">
            <span
              className={cn(
                "inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]",
                freshness.isPast
                  ? "text-muted-foreground"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-1.5 w-1.5 rounded-full",
                  freshness.isPast ? "bg-muted-foreground" : "bg-emerald-600",
                )}
              />
              {freshness.label}の号
            </span>
          </p>

          <p className="mt-6 text-[17px] font-semibold leading-[1.9] sm:text-lg dark:text-gray-100">
            {issue.headline}
          </p>
          <p className="mt-5 max-w-[42rem] text-sm leading-[2] text-muted-foreground dark:text-gray-400">
            {issue.summary}
          </p>
        </div>

        {/*
         * いつ時点の調査かを出す。予告の項目は発表後に覆ることがあり、
         * 日付の無い「これから変わる」は誤情報になりうる。
         */}
        <p className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3 text-[11px] tabular-nums text-muted-foreground dark:border-neutral-800 dark:text-gray-500">
          <span>{format(issue.researchedAt, "yyyy年M月d日")} 調査</span>
          <span aria-hidden className="opacity-40">
            ／
          </span>
          <span>毎月はじめに更新</span>
        </p>
      </header>

      {freshness.isPast && (
        <div className="mb-8 flex gap-3 border-l-[3px] border-amber-500 bg-amber-500/[0.06] p-4">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-bold">この号は{freshness.label}({monthLabel})の情報です</p>
            <p className="mt-1 leading-relaxed">
              その後にまた改定されたり、予告が変わったりしている可能性があります。
              <Link href="/changes" className="font-bold underline underline-offset-4">
                最新号
              </Link>
              を確認してください。
            </p>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <section key={section.timing} id={section.anchor} className="mb-12 scroll-mt-16">
          <div className="mb-2">
            <div
              className={cn(
                "h-[3px] w-full",
                section.timing === "changed" ? "bg-emerald-600" : "bg-foreground/40",
              )}
            />
            <div className="flex items-start justify-between gap-4 pt-3">
              <div className="min-w-0">
                <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {section.eng}
                </p>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl dark:text-white">
                  {section.heading(monthLabel)}
                </h2>
                <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
                  {section.note}
                </p>
              </div>
              <span className="shrink-0 font-serif text-3xl leading-none tabular-nums text-muted-foreground/40 sm:text-4xl">
                {section.items.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-border dark:divide-neutral-800">
            {section.items.map((item, i) => (
              <ChangeEntry
                key={item.id}
                item={item}
                index={numberById.get(item.id) ?? i + 1}
                monthStart={issue.monthStart}
              />
            ))}
          </div>
        </section>
      ))}

      {issue.items.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground dark:text-gray-400">
          この月に特筆すべき変更はありませんでした。
        </p>
      )}
    </div>
  );
}
