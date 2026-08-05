// app/(with-ads)/jobs/service-charges/dashboard/archive/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import Pagination from "@/components/home/Pagination";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchServiceChargesPaged,
  fetchServiceChargeCount,
} from "@/utils/actions/jobs";
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
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* ヘッダー */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">調査データ一覧</h1>
          <p className="text-sm text-muted-foreground">
            現場から寄せられたレビューの一覧です。誰でも閲覧できます。
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/jobs/service-charges/dashboard">
            検索トップページに戻る
          </Link>
        </Button>

        {/* 絞り込みフォーム */}
        <form className="flex flex-wrap items-end gap-2 max-w-lg" method="GET">
          <div className="flex-1 min-w-[160px] space-y-1">
            <Input name="q" placeholder="店舗名で絞り込み" defaultValue={q ?? ""} />
          </div>
          <select
            name="collected"
            defaultValue={collected ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">すべて</option>
            <option value="yes">徴収あり</option>
            <option value="no">徴収なし</option>
          </select>
          <Button type="submit" size="sm">
            絞り込む
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">全 {totalItems} 件</p>

        {/* 一覧 */}
        {records.length > 0 ? (
          <div className="grid gap-3">
            {records.map((r) => (
              <Link
                key={r.placeId}
                href={`/jobs/service-charges/dashboard/${r.placeId}`}
              >
                <Card className="p-4 hover:bg-muted/40 transition">
                  <p className="font-medium">{r.storeName || "（店舗名不明）"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r._max.storeAddress}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {r._count.placeId} 件のレビュー
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">
            条件に一致するデータは見当たりません。
          </p>
        )}

        {/* ページネーション */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          baseUrl="/jobs/service-charges/dashboard/archive"
          query={{ q, collected }}
        />
      </div>
    </main>
  );
}
