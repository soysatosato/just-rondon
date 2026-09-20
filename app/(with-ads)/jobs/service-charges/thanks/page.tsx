// app/(with-ads)/jobs/service-charges/thanks/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import ShareActions from "@/components/money/salary-calculator/ShareActions";
import { surveyHref } from "@/components/jobs/survey/entry";
import { fetchStorePage } from "@/utils/actions/jobs";
import { storePath } from "@/lib/jobs/store-slug";

import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("ご回答ありがとうございました");

type Props = {
  searchParams?: {
    /** 回答した店舗の slug。送信処理が、候補から選ばれた店舗のときだけ付ける。 */
    store?: string;
  };
};

/**
 * 知り合いに渡す文面。渡す先は完了画面ではなくダッシュボード。
 * 受け取った人は、まず集計を見てから自分も答えるかを決めるので。
 */
const SHARE_PATH = "/jobs/service-charges/dashboard";
const SHARE_TEXT =
  "ロンドンの飲食店で働いたことがある人へ。サービスチャージがちゃんと配られているか、店舗ごとの実態が見られて、自分の職場も匿名・3分で判定できます。";

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

export default async function ThanksPage({ searchParams }: Props) {
  // 送った回答が実際に載ったことを、その店舗のページで確かめられるようにする。
  // slug が書き換えられていても、該当する店舗が無ければ何も出さないだけ。
  const storePage =
    typeof searchParams?.store === "string"
      ? await fetchStorePage(searchParams.store)
      : null;
  const store = storePage?.store;

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
          回答は匿名のまま店舗名とあわせて集計され、
          次にその店で働く人が読めるようになります。
        </p>

        {store && (
          <Link
            href={storePath(store.slug)}
            className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">回答を反映しました</p>
              <p className="mt-0.5 truncate font-semibold text-foreground">
                {store.storeName || "（店舗名不明）"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                この店への回答は{store.responseCount}件になりました
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
              店舗ページを見る →
            </span>
          </Link>
        )}

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

        {/* 答え終えた直後がいちばん「ほかにも」と思える。次の1件の入口を2つ置く。 */}
        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-border p-5">
            <p className="font-semibold text-foreground">
              ほかの店でも働いたことがありますか？
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              1店舗ずつ、何店舗でも答えられます。前に働いていた店の回答も、同じだけ役に立ちます。
            </p>
            <Button asChild variant="outline" className="mt-4 self-start">
              <Link href={surveyHref()}>別の店舗について答える</Link>
            </Button>
          </div>

          <div className="flex flex-col rounded-xl border border-border p-5">
            <p className="font-semibold text-foreground">
              ロンドンで働く知り合いに教える
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              1店舗あたりの回答が増えるほど、1人の見え方なのか店の運用なのかを見分けられるようになります。
            </p>
            <div className="mt-4">
              <ShareActions
                path={SHARE_PATH}
                shareText={SHARE_TEXT}
                title="サービスチャージ実態調査"
                copyLabel="リンクをコピー"
              />
            </div>
            {/* 回答した直後に同じ店のグループへ送ると、送った人が答えた人だと推測されやすい。 */}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              同じ店の人に送るときは少し日をおくと、誰が答えたか推測されにくくなります。
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/jobs/service-charges/stores">
              店舗別のデータを見る
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
