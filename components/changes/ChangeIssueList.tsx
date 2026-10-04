import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatMonthJa } from "@/lib/changes";

export interface ChangeIssueSummary {
  id: string;
  slug: string;
  title: string;
  headline: string;
  monthStart: Date;
}

/** 月次号の既刊一覧。週次の BackIssueList と同じ組み。 */
export default function ChangeIssueList({
  issues,
  heading = "バックナンバー",
  eng = "Back Issues",
}: {
  issues: ChangeIssueSummary[];
  heading?: string;
  eng?: string;
}) {
  if (issues.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 border-t-2 border-foreground pt-3">
        <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {eng}
        </p>
        <h2 className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl dark:text-white">
          {heading}
        </h2>
      </div>

      <ul className="divide-y divide-border border-y border-border dark:divide-neutral-800 dark:border-neutral-800">
        {issues.map((issue) => (
          <li key={issue.id}>
            <Link
              href={`/changes/${issue.slug}`}
              className="group flex items-baseline gap-4 py-4 transition-colors hover:bg-muted/40 dark:hover:bg-neutral-900"
            >
              <span className="hidden shrink-0 font-serif text-xs tabular-nums tracking-[0.1em] text-muted-foreground sm:block dark:text-gray-500">
                {issue.slug.replace("-", ".")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold tabular-nums text-foreground/70 dark:text-gray-300">
                  {formatMonthJa(issue.monthStart)}号
                </span>
                <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-muted-foreground dark:text-gray-400">
                  {issue.headline}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
