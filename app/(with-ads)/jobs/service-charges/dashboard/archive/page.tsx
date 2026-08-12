// app/(with-ads)/jobs/service-charges/dashboard/archive/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import Pagination from "@/components/home/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchServiceChargesPaged,
  fetchServiceChargeCount,
} from "@/utils/actions/jobs";
import StoreResultCard from "@/components/jobs/StoreResultCard";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ集計アーカイブ");

type Props = {
  searchParams?: {
    page?: string;
    q?: string;
    collected?: "yes" | "no";
  };
};

export default async function ArchivePage({ searchParams }: Props) {
  const currentPage = Number(searchParams?.page ?? "1");
  const itemsPerPage = 10;
  const q = searchParams?.q?.trim() || undefined;
  const collected = searchParams?.collected;
  const filter = { q, collected };

  const totalItems = await fetchServiceChargeCount(filter);
  const records = await fetchServiceChargesPaged(
    currentPage,
    itemsPerPage,
    filter
  );

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* パンくず */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link
            href="/jobs/service-charges/dashboard"
            className="transition hover:text-foreground"
          >
            調査データ
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">全件一覧</span>
        </nav>

        {/* ヘッダー */}
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            調査データ一覧
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            現場から寄せられた回答の全件一覧です。店舗名で絞り込めます。
          </p>
        </header>

        {/* 絞り込み */}
        <form className="mt-6 flex flex-wrap gap-2" method="GET">
          <Input
            name="q"
            placeholder="店舗名で絞り込み"
            defaultValue={q ?? ""}
            aria-label="店舗名で絞り込み"
            className="h-11 min-w-[12rem] flex-1"
          />
          <select
            name="collected"
            defaultValue={collected ?? ""}
            aria-label="徴収の有無で絞り込み"
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">すべて</option>
            <option value="yes">徴収あり</option>
            <option value="no">徴収なし</option>
          </select>
          <Button type="submit" size="lg" className="shrink-0">
            絞り込む
          </Button>
        </form>

        {/* 一覧 */}
        <section className="mt-8 space-y-3">
          <p className="text-xs text-muted-foreground">
            全 <span className="tabular-nums">{totalItems}</span> 件
          </p>

          {records.length > 0 ? (
            <div className="grid gap-2">
              {records.map((r) => (
                <StoreResultCard
                  key={r.placeId}
                  placeId={r.placeId}
                  storeName={r.storeName}
                  storeAddress={r._max.storeAddress}
                  reviewCount={r._count.placeId}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium text-foreground">
                条件に一致するデータは見当たりません
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                絞り込み条件を変えてお試しください。
              </p>
            </div>
          )}
        </section>

        {/* ページネーション */}
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            baseUrl="/jobs/service-charges/dashboard/archive"
            query={{ q, collected }}
          />
        </div>
      </div>
    </main>
  );
}
