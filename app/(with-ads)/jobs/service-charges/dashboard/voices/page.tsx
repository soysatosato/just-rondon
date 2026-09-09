// app/(with-ads)/jobs/service-charges/dashboard/voices/page.tsx
//
// 以前は店舗を機械的に並べる「全件一覧」だった。店舗を探すだけなら
// ダッシュボードの一覧で足りるので、ここは回答を1件ずつ新着順に読む場所にした。
// 自由記述はこれまで店舗ページに潜っていて、通しで読む導線が無かった。
export const dynamic = "force-dynamic";

import Link from "next/link";
import Pagination from "@/components/home/Pagination";
import { Button } from "@/components/ui/button";
import {
  fetchResponseCount,
  fetchResponseFeed,
} from "@/utils/actions/jobs";
import { cn } from "@/lib/utils";
import ResponseCard from "@/components/jobs/dashboard/ResponseCard";
import type { DistributionType } from "@/utils/labels";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ実態調査 回答一覧");

const FILTERS: { key: string; label: string; dist?: DistributionType }[] = [
  { key: "all", label: "すべて" },
  { key: "none", label: "分配なし", dist: "none" },
  { key: "fixed", label: "固定上乗せ", dist: "fixed" },
  { key: "gradient", label: "傾斜配分", dist: "gradient" },
  { key: "equal", label: "等分配", dist: "equal" },
];

type Props = {
  searchParams?: {
    page?: string;
    dist?: string;
    comment?: string;
  };
};

export default async function VoicesPage({ searchParams }: Props) {
  const currentPage = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const itemsPerPage = 10;
  const dist = FILTERS.find((f) => f.dist === searchParams?.dist)?.dist;
  const withComment = searchParams?.comment === "1";
  const filter = { dist, withComment };

  const [totalItems, records] = await Promise.all([
    fetchResponseCount(filter),
    fetchResponseFeed(currentPage, itemsPerPage, filter),
  ]);

  const activeKey = dist ?? "all";

  function href(next: { dist?: string; comment?: boolean }) {
    const params = new URLSearchParams();
    const d = next.dist ?? dist;
    const c = next.comment ?? withComment;
    if (d) params.set("dist", d);
    if (c) params.set("comment", "1");
    const qs = params.toString();
    return `/jobs/service-charges/dashboard/voices${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link
            href="/jobs/service-charges/dashboard"
            className="transition hover:text-foreground"
          >
            実態調査
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">回答一覧</span>
        </nav>

        <header className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            寄せられた回答をすべて読む
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            届いた順に、1件ずつそのまま並べています。自由記述は原文のままです。
            個人が特定される記述は掲載前に取り除いています。
          </p>
        </header>

        {/* 絞り込み */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={href({ dist: f.dist ?? "" })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  activeKey === f.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {f.label}
              </Link>
            ))}
          </div>

          <Link
            href={href({ comment: !withComment })}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              withComment
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            <span aria-hidden>{withComment ? "✓" : "＋"}</span>
            自由記述のある回答だけ
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          全 <span className="tabular-nums">{totalItems}</span> 件
        </p>

        {/* 一覧 */}
        <div className="mt-3 space-y-4">
          {records.length > 0 ? (
            records.map((r) => <ResponseCard key={r.id} record={r} />)
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-foreground">
                条件に一致する回答はありません
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                絞り込みを変えてお試しください。
              </p>
            </div>
          )}
        </div>

        {totalItems > itemsPerPage && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              baseUrl="/jobs/service-charges/dashboard/voices"
              query={{
                dist: dist ?? undefined,
                comment: withComment ? "1" : undefined,
              }}
            />
          </div>
        )}

        <section className="mt-12 rounded-xl border border-border bg-muted/40 p-5 text-center">
          <p className="font-semibold text-foreground">
            あなたの職場のことも書けます
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            所要3分・匿名。送信する前に、その場で判定と次にやることが出ます。
          </p>
          <Button asChild className="mt-4">
            <Link href="/jobs/service-charges/survey">診断をはじめる</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
