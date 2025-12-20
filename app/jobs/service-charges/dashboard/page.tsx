// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  fetchServiceCharges,
  fetchServiceChargeCount,
} from "@/utils/actions/jobs";

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

  // 件数は常に取得
  const totalCount = await fetchServiceChargeCount();

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

        {/* 強調注意書き：3文字未満 */}
        {hasQuery && !isSearchable && (
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>検索条件が不十分です</AlertTitle>
            <AlertDescription>
              検索は <strong>3文字以上</strong> の英字で行ってください。
              <br />
              例：
              <code className="ml-1 rounded bg-muted px-1 py-0.5">yok</code>
            </AlertDescription>
          </Alert>
        )}

        {/* サブタイトル */}
        <p className="text-sm text-muted-foreground">
          {isSearchable
            ? "検索結果"
            : hasQuery
            ? "※ 検索は3文字以上でのみ実行されます"
            : "一覧表示で見るにはアンケートへのご協力が必要です"}
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
        <div className="rounded-lg border border-dashed p-6 text-center space-y-3">
          <p className="text-sm">
            現在 <span className="font-medium">全 {totalCount} 件</span>{" "}
            のレビューが集まっています。
          </p>
          <p className="text-sm text-muted-foreground">
            一覧表示で見るには、まずアンケートにご協力ください。
          </p>
          <Button asChild>
            <Link href="/jobs/service-charges/survey">
              アンケートに回答する
            </Link>
          </Button>
        </div>
        {/* 掲示板導線 */}
        <div className="max-w-2xl rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">
            雑談・情報交換用の掲示板もあります
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ちょっとした質問・雑談などは
            調査とは別の、雑談掲示板で自由に書き込めます。
          </p>
          <div className="mt-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/chatboard">雑談掲示板を見る</Link>
            </Button>
          </div>
        </div>
        {/* 制度解説リンク */}
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
