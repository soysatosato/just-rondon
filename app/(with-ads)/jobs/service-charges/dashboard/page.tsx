// app/(with-ads)/jobs/service-charges/dashboard/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  fetchResponseFeed,
  fetchServiceChargeOverview,
} from "@/utils/actions/jobs";
import Overview from "@/components/jobs/dashboard/Overview";
import StoreExplorer from "@/components/jobs/dashboard/StoreExplorer";
import VoiceList from "@/components/jobs/dashboard/VoiceList";

import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("サービスチャージ実態調査");

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const [overview, voices] = await Promise.all([
    fetchServiceChargeOverview(),
    // 旧設問の畳み込みしか入っていない回答は VoiceList 側で落とすので、多めに取る。
    fetchResponseFeed(1, 12, { withComment: true }),
  ]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* ヘッダー */}
        <header className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ロンドンの飲食店 実態調査
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-[2.5rem] md:leading-[1.15]">
            サービスチャージは、
            <br className="hidden sm:block" />
            本当にスタッフに渡っているのか
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            2024年10月から、チップとサービスチャージは全額が働いた人のものになりました。
            では現場でそのとおりになっているのか。実際にロンドンの店で働いた人から匿名で集めた回答を、
            店舗ごとに公開しています。
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(overview.firstAt)} 〜 {formatDate(overview.latestAt)}に寄せられた
            {overview.totalResponses}件・{overview.totalStores}店舗の回答にもとづく
          </p>
        </header>

        {/* 集計 */}
        <section className="mt-10">
          <Overview overview={overview} />
        </section>

        {/* 診断への導線 */}
        <section className="mt-12 rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-base font-semibold text-foreground">
                自分の職場はどうなのか、3分で判定できます
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                設問に答えると、送信する前にその場で判定と次にやることが出ます。
                回答はこのページの集計に匿名で加わります。
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/jobs/service-charges/survey">診断をはじめる</Link>
            </Button>
          </div>
        </section>

        {/* 店舗一覧 */}
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-bold tracking-tight">店舗別の回答</h2>
            <Link
              href="/jobs/service-charges/stores"
              className="shrink-0 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              エリア別の一覧を見る
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            回答の状態が悪いものから並んでいます。バッジは、その店舗に寄せられた回答のうち
            <span className="font-medium text-foreground">最も深刻なもの</span>
            を示します。1件でも「分配されていない」という回答があれば、他に良い回答があっても赤く出ます。
          </p>

          <div className="mt-5">
            <StoreExplorer stores={overview.stores} />
          </div>
        </section>

        {/* 現場の声 */}
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-xl font-bold tracking-tight">現場の声</h2>
            <Link
              href="/jobs/service-charges/dashboard/voices"
              className="shrink-0 text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
            >
              すべての回答を読む
            </Link>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            回答者が自分の言葉で書いた部分です。原文のまま掲載しています。
          </p>

          <VoiceList records={voices} className="mt-5" />
        </section>

        {/* 法律の要点 */}
        <section className="mt-12 rounded-xl border border-border p-5 sm:p-6">
          <h2 className="text-base font-bold tracking-tight">
            数字を読む前に知っておくこと
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              {
                term: "全額がスタッフのもの",
                desc: "2024年10月1日以降、雇用主が差し引けるのは税金と国民保険料だけです。管理費や手数料の控除は違法です。",
              },
              {
                term: "分配ルールは書面で公開",
                desc: "分配の責任者・方法・サービスチャージの扱いを書面にし、働く人が読める状態にしておく義務があります。",
              },
              {
                term: "記録は3年、閲覧できる",
                desc: "雇用主には3年間の記録保存義務があり、従業員は過去3年分の支払い記録を閲覧する権利を持ちます。",
              },
              {
                term: "申立ての期限",
                desc: "未払いチップは12か月以内、ポリシーや記録の不開示は3か月以内。辞めたあとでも請求できます。",
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
          <p className="mt-5 text-sm">
            <Link
              href="/jobs/service-charges"
              className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
            >
              サービスチャージ完全ガイドを読む →
            </Link>
          </p>
        </section>

        {/* 導線 */}
        <section className="mt-12 grid gap-3 sm:grid-cols-2">
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
              Acasでの相談からEmployment
              Tribunalの判決、強制執行まで。実際に認容された計算方法も公開しています。
            </p>
          </Link>

          <Link
            href="/jobs/service-charges/case-story/check-your-service-charge"
            className="group block rounded-xl border border-border p-5 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              計算する
            </p>
            <p className="mt-1.5 font-semibold text-foreground">
              自分の未払い額を計算する
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              必要なのは売上記録・シフト表・給与明細の3つだけ。審判所で認容された計算式をそのまま公開。
            </p>
          </Link>

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
        </section>

        {/* 但し書き */}
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
              ・記載内容に事実と異なる点がある場合は、店舗の方からのご連絡で確認・修正します。
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
