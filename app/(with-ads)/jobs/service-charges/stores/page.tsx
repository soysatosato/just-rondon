// app/(with-ads)/jobs/service-charges/stores/page.tsx
//
// 店舗別サービスチャージの一覧。検索から店名で来た人の受け皿であり、
// 各店舗ページ(/jobs/service-charges/stores/<slug>)への唯一の入口。
//
// 集計ダッシュボード(/jobs/service-charges/dashboard)は noindex のままにしてある。
// あちらは調査全体の数字を読む道具で、こちらは店名で引くための公開データ。
export const revalidate = 60 * 60;

import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import StoreDirectory from "@/components/jobs/stores/StoreDirectory";
import { fetchServiceChargeOverview } from "@/utils/actions/jobs";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import { STORES_BASE } from "@/lib/jobs/store-slug";

export async function generateMetadata(): Promise<Metadata> {
  const overview = await fetchServiceChargeOverview();

  return buildPageMetadata({
    path: STORES_BASE,
    title: "ロンドンの飲食店 店舗別サービスチャージ",
    description: truncateDescription(
      `ロンドンの飲食店${overview.totalStores}店舗・${overview.totalResponses}件の匿名回答を店舗ごとに公開しています。サービスチャージが分配されているか、時給換算でいくらになるか、働いた人の声まで店名から確かめられます。`,
      140,
    ),
    keywords: [
      "ロンドン 飲食店 サービスチャージ",
      "ロンドン レストラン バイト 評判",
      "サービスチャージ 分配 店舗",
      "ロンドン 和食レストラン 求人",
      "Tipping Act 2023 店舗",
      "ロンドン 日本食 バイト 時給",
    ],
  });
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs leading-snug text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}

export default async function StoresPage() {
  const overview = await fetchServiceChargeOverview();

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <JsonLd
        data={breadcrumbListJsonLd({ path: "/jobs/service-charges/stores" })}
      />

      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <Breadcrumbs path="/jobs/service-charges/stores" className="mb-6" />

        <header className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ロンドンの飲食店 実態調査
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[2.5rem] md:leading-[1.15]">
            店舗別サービスチャージ
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            面接を受ける前に、その店のサービスチャージがどう配られているかを知っておけます。
            ロンドンで実際に働いた人から匿名で集めた回答を、店舗ごとにまとめました。店名から探してください。
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(overview.firstAt)} 〜 {formatDate(overview.latestAt)}に寄せられた
            {overview.totalResponses}件・{overview.totalStores}店舗の回答にもとづく
          </p>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile
            label="公開している店舗"
            value={`${overview.totalStores}`}
            sub="店舗"
          />
          <Tile
            label="寄せられた回答"
            value={`${overview.totalResponses}`}
            sub="件"
          />
          <Tile
            label="「分配なし」の報告がある店舗"
            value={`${overview.unpaidStores}`}
            sub={`徴収ありの${overview.collectedStores}店舗中`}
          />
          {overview.hourly.median !== null ? (
            <Tile
              label="時給換算の中央値"
              value={`£${overview.hourly.median.toFixed(2)}`}
              sub={`${overview.hourly.sampleSize}件の回答から`}
            />
          ) : null}
        </section>

        <section className="mt-10 rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
          <h2 className="text-base font-bold tracking-tight">
            バッジの読み方
          </h2>
          <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              {
                term: "分配なしの報告あり",
                desc: "「集めたサービスチャージが1ポンドも渡っていない」という回答が1件でもある店舗です。事実なら Tipping Act 2023 に反している可能性が高い状態です。",
              },
              {
                term: "固定上乗せの報告あり",
                desc: "時給に固定額を足す方式。それ自体は違法ではありませんが、集めた総額が全額渡っているかで結論が変わります。",
              },
              {
                term: "分配されている",
                desc: "等分配または傾斜配分という回答です。配り方そのものには問題がなさそう、という意味です。",
              },
              {
                term: "サービスチャージなし",
                desc: "そもそも徴収していない職場。この場合は法律の分配義務が発生しません。",
              },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-sm font-semibold text-foreground">
                  {item.term}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            回答が割れている店舗では、いちばん深刻なものをバッジに出します。1件でも「分配されていない」という回答があれば、
            他に良い回答があっても赤く出ます。件数を添えているので、そこを見て判断してください。
          </p>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              エリア別の店舗一覧
            </h2>
            <Link
              href="/jobs/service-charges/dashboard"
              className="shrink-0 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              調査全体の集計を見る
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            ポストコードの地区記号でまとめています。同じエリアの店舗どうしは、
            客層も相場も近いので比べる意味があります。
          </p>

          <div className="mt-6">
            <StoreDirectory stores={overview.stores} />
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-base font-semibold text-foreground">
                探している店が無いときは、あなたが最初の1人になれます
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                設問に答えると、送信する前にその場で判定と次にやることが出ます。所要3分・匿名で、
                店舗名以外に個人が特定される情報は聞きません。
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/jobs/service-charges/survey">診断をはじめる</Link>
            </Button>
          </div>
        </section>

        <section className="mt-12 grid gap-3 sm:grid-cols-2">
          <Link
            href="/jobs/service-charges"
            className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              制度を知る
            </p>
            <p className="mt-1.5 font-semibold text-foreground">
              英国サービスチャージ完全ガイド
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              2024年10月に何が変わったのか。全額分配の義務、書面のチップポリシー、申立ての期限まで。
            </p>
          </Link>

          <Link
            href="/jobs/service-charges/case-story"
            className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              実例・裁判記録
            </p>
            <p className="mt-1.5 font-semibold text-foreground">
              未払いで審判所に申立てた記録
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Acasでの相談からEmployment Tribunalの判決、強制執行まで。認容された計算方法も公開しています。
            </p>
          </Link>
        </section>

        <section className="mt-12 border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-foreground">
            このデータの限界
          </h2>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <li>
              ・回答は自己申告で、裏付けを取っていません。同じ店でも人によって見え方は違います。
            </li>
            <li>
              ・1店舗あたりの回答数は多くありません。件数を添えているので、そこを見て判断してください。
            </li>
            <li>
              ・回答は寄せられた時点のもので、その後に運用が変わっている可能性があります。
            </li>
            <li>
              ・記載内容に事実と異なる点がある場合は、
              <Link
                href="/contact"
                className="underline underline-offset-4 transition hover:text-foreground"
              >
                お問い合わせ
              </Link>
              から店舗の方にご連絡いただければ確認・修正します。
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
