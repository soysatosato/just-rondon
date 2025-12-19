// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { fetchServiceCharges } from "@/utils/actions/jobs";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams?: {
    q?: string;
  };
};

export default async function DashboardPage({ searchParams }: Props) {
  const q = searchParams?.q?.trim() ?? "";

  const records = await fetchServiceCharges(q);
  const isSearching = q.length > 0;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">調査データ検索（英名）</h1>
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            ロンドン市内の日本食レストランにおける
            <span className="font-medium text-foreground">
              サービスチャージや労働環境の実態
            </span>
            を、現場の声として集約しています。
          </p>

          <p className="text-sm text-muted-foreground">
            情報は匿名で投稿できます。該当店舗が未登録の場合は、
            アンケートから新しく追加できます。
          </p>

          <div>
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs/service-charges/survey">
                アンケートに回答する
              </Link>
            </Button>
          </div>
        </div>

        {/* 検索フォーム */}
        <form className="max-w-md space-y-2" method="GET">
          <Input
            name="q"
            placeholder="Search by English store name or area"
            defaultValue={q}
          />
          <Button type="submit" size="sm">
            検索
          </Button>
        </form>

        {/* サブタイトル */}
        <p className="text-sm text-muted-foreground">
          {isSearching ? "検索結果" : "最近追加されたレビュー"}
        </p>

        {/* 結果あり */}
        {records.length > 0 && (
          <div className="grid gap-3">
            {records.map((r) => (
              <Link
                key={r.placeId}
                href={`/jobs/service-charges/dashboard/${r.placeId}`}
              >
                <Card className="p-4 hover:bg-muted/40 transition">
                  <p className="font-medium">
                    {r.storeName || "（店舗名不明）"}
                  </p>
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
        )}

        {/* 検索結果なし */}
        {records.length === 0 && isSearching && (
          <div className="rounded-lg border border-dashed p-6 text-center space-y-3">
            <p className="text-sm">該当する店舗は見当たりません。</p>
            <p className="text-sm text-muted-foreground">
              従業員ですか？この店舗の情報を最初に登録できます。
            </p>
            <Button asChild>
              <Link href="/jobs/service-charges/survey">新しく登録する</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
