// app/(with-ads)/jobs/service-charges/survey/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Check } from "lucide-react";
import { noindexMetadata } from "@/lib/seo";
import {
  fetchServiceChargeOverview,
  fetchSurveyStore,
} from "@/utils/actions/jobs";
import SurveyForm from "@/components/jobs/survey/SurveyForm";
import { SURVEY_PROMISES } from "@/components/jobs/survey/entry";

export const metadata = noindexMetadata("サービスチャージ診断とアンケート");

type Props = {
  searchParams?: {
    /** 店舗ページやダッシュボードで選んだ店舗の id。 */
    store?: string;
    /** ダッシュボードで打ちかけた店名。 */
    q?: string;
  };
};

export default async function SurveyPage({ searchParams }: Props) {
  // 同じ名前のパラメータが重なると配列で届くので、文字列のときだけ使う。
  const storeId =
    typeof searchParams?.store === "string" ? searchParams.store : undefined;
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;

  // 診断ステップで「自分の時給換算が全体のどのあたりか」を返すため、
  // 集計を先に取っておく。回答は数十件なので1クエリで足りる。
  const [overview, initialStore] = await Promise.all([
    fetchServiceChargeOverview(),
    storeId ? fetchSurveyStore(storeId) : Promise.resolve(null),
  ]);
  const initialQuery = initialStore
    ? undefined
    : q?.trim().slice(0, 80) || undefined;

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link
            href="/jobs/service-charges/dashboard"
            className="transition hover:text-foreground"
          >
            実態調査
          </Link>
          <span className="mx-2 text-muted-foreground/50">/</span>
          <span className="text-foreground">診断とアンケート</span>
        </nav>

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            所要3分・匿名
          </p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            あなたの職場のサービスチャージは、
            <br className="hidden sm:block" />
            法律どおりに配られていますか
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            設問に答えると、送信する前に
            <span className="font-medium text-foreground">
              その場で判定と次にやることが出ます
            </span>
            。答えた内容はロンドンの飲食店の実態データとして匿名で集計され、
            同じ店で働く次の人が読めるようになります。
          </p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {SURVEY_PROMISES.map((p) => (
              <li
                key={p.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/80"
              >
                <Check
                  aria-hidden
                  className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500"
                />
                {p.short}
              </li>
            ))}
          </ul>
        </header>

        <div className="mt-8">
          {/* 別の店舗を選んで来直したときに、前の入力を持ち越さないよう key で作り直す。 */}
          <SurveyForm
            key={initialStore?.id ?? initialQuery ?? "blank"}
            hourlyMedian={overview.hourly.median}
            responseCount={overview.totalResponses}
            storeCount={overview.totalStores}
            initialStore={initialStore}
            initialQuery={initialQuery}
          />
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          このページは氏名・連絡先・IPアドレスを保存しません。店舗名と回答内容だけを記録します。
          回答の取り消しをご希望の場合は、店舗名と回答時期を添えてお問い合わせください。
        </p>
      </div>
    </main>
  );
}
