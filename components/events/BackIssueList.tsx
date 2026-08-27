import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatWeekRange, getIssueDesignation } from "@/lib/weekly";

export interface BackIssueSummary {
  id: string;
  slug: string;
  title: string;
  headline: string;
  weekStart: Date;
  weekEnd: Date;
}

/**
 * 既刊の一覧。号を「発行番号のある刷り物」として並べる。
 * 会期の表記より発行番号を先に出すのは、号を横に見比べるときの目印になるから。
 */
export default function BackIssueList({
  issues,
}: {
  issues: BackIssueSummary[];
}) {
  if (issues.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 border-t-2 border-foreground pt-3">
        <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Back Issues
        </p>
        <h2 className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl dark:text-white">
          バックナンバー
        </h2>
      </div>

      <ul className="divide-y divide-border border-y border-border dark:divide-neutral-800 dark:border-neutral-800">
        {issues.map((issue) => {
          const designation = getIssueDesignation(issue.slug);
          return (
            <li key={issue.id}>
              <Link
                href={`/events/week/${issue.slug}`}
                className="group flex items-baseline gap-4 py-4 transition-colors hover:bg-muted/40 dark:hover:bg-neutral-900"
              >
                {designation && (
                  <span className="hidden shrink-0 font-serif text-xs tabular-nums tracking-[0.1em] text-muted-foreground sm:block dark:text-gray-500">
                    {designation}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold tabular-nums text-foreground/70 dark:text-gray-300">
                    {formatWeekRange(issue.weekStart, issue.weekEnd)}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-muted-foreground dark:text-gray-400">
                    {issue.headline}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
