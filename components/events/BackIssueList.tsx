import Link from "next/link";
import { ArrowRight, Archive } from "lucide-react";

import { formatWeekRange } from "@/lib/weekly";

export interface BackIssueSummary {
  id: string;
  slug: string;
  title: string;
  headline: string;
  weekStart: Date;
  weekEnd: Date;
}

export default function BackIssueList({
  issues,
}: {
  issues: BackIssueSummary[];
}) {
  if (issues.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl dark:text-white">
        <Archive className="h-4 w-4 shrink-0 opacity-70" />
        バックナンバー
      </h2>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border dark:divide-neutral-800 dark:border-neutral-700">
        {issues.map((issue) => (
          <li key={issue.id}>
            <Link
              href={`/events/week/${issue.slug}`}
              className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 dark:hover:bg-neutral-800/40"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-muted-foreground dark:text-gray-400">
                  {formatWeekRange(issue.weekStart, issue.weekEnd)}
                </span>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed dark:text-gray-300">
                  {issue.headline}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
