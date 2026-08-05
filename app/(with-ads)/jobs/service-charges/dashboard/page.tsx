// app/(with-ads)/jobs/service-charges/dashboard/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchServiceCharges,
  fetchServiceChargeStats,
} from "@/utils/actions/jobs";
import ServiceChargeStats from "@/components/jobs/ServiceChargeStats";

import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ集計ダッシュボード");

type Props = {
  searchParams?: {
    q?: string;
  };
};

export default async function DashboardPage({ searchParams }: Props) {
  const q = searchParams?.q?.trim() ?? "";

  // 状態判定
  const hasQuery = q.length > 0;
  const isSearchable = q.length >= 3;

  // 統計は常に取得
  const stats = await fetchServiceChargeStats();

  // 3文字以上のときのみ検索
  const records = isSearchable ? await fetchServiceCharges(q) : [];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* タイトル */}
        <h1 className="text-2xl font-semibold">調査データ検索（英名）</h1>

        {/* 説明 */}
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            ロンドン市内の日本食レストランにおける
            <span className="font-medium text-foreground">
              サービスチャージや労働環境の実態
            </span>
            を、現場の声として集約しています。
            <br />
            店舗名（英名）を入力することで、
            <span className="font-medium text-foreground">
              個別の店舗データを検索
            </span>
            できます。
          </p>
          <p className="text-sm text-muted-foreground">
            情報は匿名で投稿できます。調査は、働く人同士の協力によって
            成り立っています。
          </p>
        </div>

        {/* 検索フォーム */}
        <form className="max-w-md space-y-2" method="GET">
          <Input
            name="q"
            placeholder="Search by English store name (min 3 chars)"
            defaultValue={q}
            aria-invalid={hasQuery && !isSearchable}
          />
          <Button type="submit" size="sm">
            検索
          </Button>
        </form>
        {/* 注意書き：3文字未満 */}
        {hasQuery && !isSearchable && (
          <div className="max-w-md rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            検索は<strong className="text-foreground">3文字以上</strong>
            の英字で行ってください（例：
            <code className="mx-1 rounded bg-muted px-1 py-0.5">yok</code>
            ）。3文字未満でも、
            <Link
              href="/jobs/service-charges/dashboard/archive"
              className="underline underline-offset-2"
            >
              下の一覧ページ
            </Link>
            から探せます。
          </div>
        )}

        {/* サブタイトル */}
        <p className="text-sm text-muted-foreground">
          {isSearchable
            ? "検索結果"
            : hasQuery
              ? "※ 検索は3文字以上でのみ実行されます"
              : "店舗名で検索するか、下の一覧ページからも探せます"}
        </p>

        {/* 検索結果あり */}
        {isSearchable && records.length > 0 && (
          <div className="grid gap-3">
            {records.map((r) => (
              <Link
                key={r.placeId}
                href={`/jobs/service-charges/dashboard/${r.placeId}`}
              >
                <Card className="p-4 transition hover:bg-muted/40">
                  <p className="font-medium">
                    {r.storeName || "（店舗名不明）"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.storeAddress}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r._count.placeId} 件のレビュー
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 検索結果なし */}
        {isSearchable && records.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center space-y-3">
            <p className="text-sm">該当する店舗は見当たりません。</p>
            <p className="text-sm text-muted-foreground">
              この店舗の情報を、最初に登録できます。
            </p>
            <Button asChild>
              <Link href="/jobs/service-charges/survey">新しく登録する</Link>
            </Button>
          </div>
        )}
        <ServiceChargeStats stats={stats} />

        <div className="rounded-lg border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            寄せられた調査データはすべて、一覧ページでいつでも閲覧できます。
          </p>
          <Button asChild>
            <Link href="/jobs/service-charges/dashboard/archive">
              全件一覧を見る
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            まだ回答していない店舗があれば、
            <Link
              href="/jobs/service-charges/survey"
              className="underline underline-offset-2"
            >
              アンケートにご協力ください
            </Link>
            。
          </p>
        </div>

        <div className="max-w-2xl rounded-lg border bg-muted/40 p-4">
          <p className="text-sm font-medium">
            サービスチャージの制度について知りたい方へ
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            英国のサービスチャージは法律（Tipping Act
            2023）で厳密に定められています。
            調査データを見る前に、制度の全体像を確認したい方はこちら。
          </p>
          <div className="mt-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/jobs/service-charges">
                サービスチャージの仕組みと法律を解説
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
