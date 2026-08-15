// app/(with-ads)/jobs/service-charges/dashboard/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  fetchServiceCharges,
  fetchServiceChargeStats,
} from "@/utils/actions/jobs";
import ServiceChargeStats from "@/components/jobs/ServiceChargeStats";
import StoreResultCard from "@/components/jobs/StoreResultCard";

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
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* ヘッダー */}
        <header className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            実態調査データ
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            ロンドン日本食レストラン
            <br className="sm:hidden" />
            サービスチャージ調査
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            現場で働く人から寄せられた、サービスチャージの分配実態と労働環境の記録です。
            店舗名（英名）で検索できます。投稿はすべて匿名です。
          </p>
        </header>

        {/* 検索 */}
        <section className="mt-8">
          <form className="flex max-w-xl gap-2" method="GET">
            <Input
              name="q"
              placeholder="店舗名を英字で入力（3文字以上）"
              defaultValue={q}
              aria-invalid={hasQuery && !isSearchable}
              aria-label="店舗名で検索"
              className="h-11"
            />
            <Button type="submit" size="lg" className="shrink-0">
              検索
            </Button>
          </form>

          {hasQuery && !isSearchable && (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              検索は<strong className="text-foreground">3文字以上</strong>
              の英字で行ってください（例：
              <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
                yok
              </code>
              ）。
              <Link
                href="/jobs/service-charges/dashboard/archive"
                className="underline underline-offset-2 hover:text-foreground"
              >
                全件一覧から探す
              </Link>
              こともできます。
            </p>
          )}
        </section>

        {/* 検索結果 */}
        {isSearchable && (
          <section className="mt-8 space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold text-foreground">
                「{q}」の検索結果
              </h2>
              {records.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {records.length}店舗
                </p>
              )}
            </div>

            {records.length > 0 ? (
              <div className="grid gap-2">
                {records.map((r) => (
                  <StoreResultCard
                    key={r.placeId}
                    placeId={r.placeId}
                    storeName={r.storeName}
                    storeAddress={r.storeAddress}
                    reviewCount={r._count.placeId}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  該当する店舗は見当たりません
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                  この店舗の情報は、まだ誰も登録していません。あなたが最初の回答者になれます。
                </p>
                <Button asChild className="mt-4">
                  <Link href="/jobs/service-charges/survey">
                    この店舗の情報を登録する
                  </Link>
                </Button>
              </div>
            )}
          </section>
        )}

        {/* 全体の統計 */}
        <section className="mt-12 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-bold tracking-tight">全体の集計</h2>
            <Link
              href="/jobs/service-charges/dashboard/archive"
              className="shrink-0 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              全件一覧を見る
            </Link>
          </div>

          <ServiceChargeStats stats={stats} />
        </section>

        {/* 導線（回答 → 制度解説 → 実例の順で1つにまとめる） */}
        <section className="mt-12 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <p className="font-semibold text-foreground">
              あなたの職場の情報を登録する
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              所要3分・匿名。分配方法と受け取っている金額を聞いています。
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto">
              <Link href="/jobs/service-charges/survey">
                アンケートに回答する
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border p-5">
            <p className="font-semibold text-foreground">
              制度と法律を確認する
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              サービスチャージは Tipping Act 2023
              で全額スタッフに帰属すると定められています。
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full sm:w-auto"
            >
              <Link href="/jobs/service-charges">
                サービスチャージの仕組み
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border p-5">
            <p className="font-semibold text-foreground">
              未払いで申立てた実例を見る
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Acasでの相談からEmployment
              Tribunalの判決、強制執行まで。実際の計算方法も公開しています。
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full sm:w-auto"
            >
              <Link href="/jobs/service-charges/case-story">
                裁判記録を見る
              </Link>
            </Button>
          </div>
        </section>

        {/* あわせて読む */}
        <section className="mt-12">
          <p className="text-sm font-semibold text-foreground">あわせて読む</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link
              href="/jobs/minimum-wage"
              className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                給与明細の見方
              </p>
              <p className="mt-1.5 font-semibold text-foreground">
                最低賃金と給与明細のチェック方法
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                サービスチャージは最低賃金に算入されません。違法な天引きの見分け方も解説。
              </p>
            </Link>

            <Link
              href="/jobs/employment-contract"
              className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                労働契約の基本
              </p>
              <p className="mt-1.5 font-semibold text-foreground">
                雇用契約・就業規則で確認すべきこと
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                written statementや試用期間、解雇・退職の通知期間について。
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
