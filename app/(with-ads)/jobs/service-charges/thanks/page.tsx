// app/(with-ads)/jobs/service-charges/thanks/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("ご回答ありがとうございました");

/**
 * 送信後の画面。
 *
 * 以前は「ありがとうございました」とダッシュボードへのボタンだけだった。
 * ここまで答えた人はたいてい自分の職場に疑問を持っていて、いちばん知りたいのは
 * 「で、自分は何をすればいいのか」なので、その手順を置く。
 */
const NEXT_STEPS = [
  {
    title: "給与明細を全部そろえる",
    body: "在職中なら、まず手元にある分をPDFか写真で保存します。辞めたあとでも請求できますが、記録は自分で持っておくのが確実です。",
  },
  {
    title: "チップポリシーの開示を求める",
    body: "「分配のルールを書いたものを見せてください」と伝えるだけです。書面にして働く人が読める状態にしておくことは雇用主の義務なので、断られた事実そのものが記録になります。",
    href: "/jobs/service-charges#section-286",
    linkLabel: "権利と請求の手順を読む",
  },
  {
    title: "過去3年分の支払い記録を請求する",
    body: "従業員には過去3年間のチップ支払い記録を閲覧する権利があり、雇用主には3年間の保存義務があります。総額が分かれば、自分の取り分が計算できます。",
  },
  {
    title: "未払い額を計算する",
    body: "審判所で実際に認容された計算方法を、数字ごと公開しています。必要な記録は売上記録・シフト表・給与明細の3つだけです。",
    href: "/jobs/service-charges/case-story/check-your-service-charge",
    linkLabel: "計算方法を見る",
  },
  {
    title: "期限を確認して、Acasに連絡する",
    body: "未払いチップの申立ては12か月以内、ポリシーや記録の不開示は3か月以内。審判所に申し立てる前に Acas の Early Conciliation を経ることが原則として必須です。相談は無料で、雇用主に連絡が行くこともありません。",
    href: "https://www.acas.org.uk/tips-and-service-charges",
    linkLabel: "Acas に相談する",
    external: true,
  },
];

export default function ThanksPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600 dark:text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            ご協力ありがとうございました
          </h1>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          回答は匿名で記録され、氏名・連絡先・IPアドレスは保存していません。
          店舗名とあわせて集計され、同じ店で働く次の人が読めるようになります。
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">
            自分の職場に疑問があるなら、この順番で
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            いきなり争う必要はありません。上から順に、記録を集めるところから始められます。
          </p>

          <ol className="mt-5 space-y-3">
            {NEXT_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-xl border border-border p-5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                  {step.href &&
                    (step.external ? (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                      >
                        {step.linkLabel} ↗
                      </a>
                    ) : (
                      <Link
                        href={step.href}
                        className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                      >
                        {step.linkLabel} →
                      </Link>
                    ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/jobs/service-charges/dashboard">
              集まったデータを見る
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/jobs/service-charges/case-story">
              審判所に申立てた記録を読む
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          このページの内容は一般的な情報提供で、法的助言ではありません。
          個別の事案については Acas または資格を持つ専門家にご相談ください。
        </p>
      </div>
    </main>
  );
}
