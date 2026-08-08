import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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
      <h2 className="mb-4 text-xl font-semibold dark:text-white">
        バックナンバー
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            href={`/events/week/${issue.slug}`}
            className="group block h-full"
          >
            <Card className="h-full rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground dark:text-gray-400">
                  {formatWeekRange(issue.weekStart, issue.weekEnd)}
                </span>
                <p className="line-clamp-3 flex-1 text-sm leading-relaxed dark:text-gray-300">
                  {issue.headline}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                  この号を読む <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
