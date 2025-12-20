// app/dashboard/archive/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import Pagination from "@/components/home/Pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchServiceChargesPaged,
  fetchServiceChargeCount,
} from "@/utils/actions/jobs";

type Props = {
  searchParams?: {
    page?: string;
  };
};

export default async function ArchivePage({ searchParams }: Props) {
  const currentPage = Number(searchParams?.page ?? "1");
  const itemsPerPage = 10;

  const totalItems = await fetchServiceChargeCount();
  const records = await fetchServiceChargesPaged(currentPage, itemsPerPage);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* ヘッダー */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">調査データ一覧</h1>
          <p className="text-sm text-muted-foreground">
            現場から寄せられたレビューの一覧です。
          </p>
        </div>

        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground space-y-1">
          <p>※ 当一覧ページへの再アクセスにはアンケート回答が必要です。</p>
          <p>※ 継続利用される場合は、ブックマークを推奨します。</p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/jobs/service-charges/dashboard">検索ページに戻る</Link>
        </Button>

        <p className="text-sm text-muted-foreground">全 {totalItems} 件</p>

        {/* 一覧 */}
        <div className="grid gap-3">
          {records.map((r) => (
            <Link
              key={r.placeId}
              href={`/jobs/service-charges/dashboard/${r.placeId}`}
            >
              <Card className="p-4 hover:bg-muted/40 transition">
                <p className="font-medium">{r.storeName || "（店舗名不明）"}</p>
                <p className="text-xs text-muted-foreground">
                  {r.storeAddress}
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {r._count.placeId} 件のレビュー
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* ページネーション */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          baseUrl="/dashboard/archive"
        />
      </div>
    </main>
  );
}
