// components/jobs/survey/WhyAnswer.tsx
import Link from "next/link";
import {
  ArrowRight,
  HeartHandshake,
  ListChecks,
  Scale,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  diagnose,
  type DiagnosisInput,
  type ServiceChargeOverview,
} from "@/utils/service-charge";
import { DiagnosisPreview } from "./DiagnosisPanel";
import { SURVEY_PROMISES, surveyHref, type SurveyPromiseKey } from "./entry";

const PROMISE_ICON: Record<SurveyPromiseKey, LucideIcon> = {
  scope: Store,
  short: ListChecks,
  preview: Scale,
  welcome: HeartHandshake,
};

/**
 * 見本の判定に使う回答。判定が「確認が必要」になり、警告・補足・
 * 次にやることが一通り出る組み合わせを選んである。
 */
const SAMPLE_INPUT: DiagnosisInput = {
  collected: "yes",
  distribution: "fixed",
  writtenPolicy: "unknown",
  onPayslip: "no",
  kitchenIncluded: null,
  workPeriod: "current",
  jobRole: "floor",
  monthlyAmount: null,
  monthlyHours: null,
};

/**
 * ダッシュボードの中ほど、集計を読み終えたところに置く「答える理由」。
 *
 * 集計を読んで「自分の店も」と思った人が、答える前に引っかかるのは
 * 「答えて意味があるのか」「店に知られないか」「何が返ってくるのか」。
 * 回答の届いていない店がどれだけ残っているか、何を約束するか、
 * 最後に出る判定の実物を、この順に並べる。
 */
export default function WhyAnswer({
  overview,
  candidateCount,
  id,
}: {
  overview: ServiceChargeOverview;
  /** アンケートの店舗候補の数。回答が届いている店舗の割合の分母。 */
  candidateCount: number;
  id?: string;
}) {
  const answeredStores = overview.totalStores;
  const unanswered = Math.max(0, candidateCount - answeredStores);
  const coverage =
    candidateCount > 0 ? Math.min(1, answeredStores / candidateCount) : 0;
  const singleAnswer = overview.stores.filter(
    (s) => s.responseCount === 1,
  ).length;
  const sample = diagnose(SAMPLE_INPUT);

  return (
    <section
      id={id}
      aria-labelledby="why-answer-title"
      className="overflow-hidden rounded-2xl border border-border"
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            回答のお願い
          </p>
          <h2
            id="why-answer-title"
            className="mt-2 text-xl font-bold leading-snug tracking-tight sm:text-2xl"
          >
            この調査は、働いた人の回答だけでできています
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            上の集計も、このあとに並ぶ現場の声も、ロンドンの店で働いた人が匿名で送ったものです。
            1件増えるたびに、次にその店の面接を受ける人が、働く前に知れることが増えます。
          </p>

          {candidateCount > 0 && (
            <div className="mt-6 rounded-xl bg-muted/50 p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium text-foreground">
                  回答が届いている店舗
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {answeredStores}
                  </span>
                  <span className="ml-1">
                    / {candidateCount}店舗（{Math.round(coverage * 100)}%）
                  </span>
                </p>
              </div>
              {/* 数字は上に書いてあるので、棒は読み上げない。 */}
              <div
                aria-hidden
                className="mt-3 h-2.5 overflow-hidden rounded-full bg-foreground/10"
              >
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${Math.max(coverage * 100, 1)}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                アンケートの店舗候補{candidateCount}店舗のうち、
                <span className="font-medium text-foreground">
                  {unanswered}店舗
                </span>
                にはまだ1件も回答がありません。
                {singleAnswer > 0 && (
                  <>
                    回答が1件だけの店舗も
                    <span className="font-medium text-foreground">
                      {singleAnswer}店舗
                    </span>
                    あり、2件目が届くと、1人の見え方なのか店の運用なのかが見えてきます。
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-muted/30 p-5 sm:p-7 lg:border-l lg:border-t-0">
          <p className="text-sm font-semibold text-foreground">
            答え終わると、こう返ってきます
          </p>
          <DiagnosisPreview diagnosis={sample} className="mt-3" />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            「時給に固定額で上乗せ」「チップポリシーはわからない」「給与明細に別項目なし」と答えた場合の、実際の判定です。
          </p>
        </div>
      </div>

      <ul className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {SURVEY_PROMISES.map((p) => {
          const Icon = PROMISE_ICON[p.key];
          return (
            <li key={p.key} className="bg-background p-4 sm:p-5">
              <Icon aria-hidden className="h-5 w-5 text-foreground" />
              <p className="mt-2.5 text-sm font-semibold text-foreground">
                {p.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-4 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <p className="text-sm leading-relaxed text-muted-foreground">
          これまでに届いた回答は
          <span className="font-semibold text-foreground">
            {overview.totalResponses}件
          </span>
          。あなたの回答が
          <span className="font-semibold text-foreground">
            {overview.totalResponses + 1}件目
          </span>
          になります。
        </p>
        <Button
          asChild
          size="lg"
          className="h-12 shrink-0 rounded-xl px-6 text-[0.9375rem] font-semibold"
        >
          <Link href={surveyHref()}>
            アンケートに答える（3分）
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}
