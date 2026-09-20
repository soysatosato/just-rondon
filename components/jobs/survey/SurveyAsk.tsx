// components/jobs/survey/SurveyAsk.tsx
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { surveyHref } from "./entry";

/**
 * アンケートへの依頼。サービスチャージ配下のどのページでも、同じ頼み方で出す。
 *
 * 以前は「診断をはじめる」という自分の得を前に出した枠を、各ページの最下部に
 * ほぼ同じ文面で置いていた。読み終えた人にしか見えず、ページを移ると同じ枠が
 * 何度も出るので定型文に見える。ここでは形を2つに分け、
 *  - 見出しの直下に1行(Line)、読み終わりに枠(Card)
 *  - 頼みごと(次にその店で働く人のために)を主、判定はおまけ
 *  - 匿名は一言だけ。何を保存しないかは並べない
 * という置き方にしてある。頼む相手の状況はページごとに違うので、
 * 呼び出し側が本文を渡す。
 */

/** 見出しの直下に置く1行。読み始める前の人に、答えられる立場だと気づかせる。 */
export function SurveyAskLine({
  children,
  href = surveyHref(),
  className,
}: {
  /** 「この店で働いたことがありますか。」など、そのページの読者への呼びかけ。 */
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm leading-relaxed transition hover:border-foreground/40 hover:bg-muted",
        className,
      )}
    >
      <PenLine
        aria-hidden
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
      />
      <span className="min-w-0 text-muted-foreground">
        {children}
        <span className="ml-1 font-medium text-foreground underline-offset-4 group-hover:underline">
          アンケートに答える（匿名・3分）
          <ArrowRight
            aria-hidden
            className="ml-0.5 inline h-3.5 w-3.5 align-[-0.15em]"
          />
        </span>
      </span>
    </Link>
  );
}

/** 読み終わりに置く枠。 */
export function SurveyAskCard({
  title,
  children,
  href = surveyHref(),
  label = "アンケートに答える",
  secondary,
  className,
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  /** ボタンの文言。店舗ページでは「この店について答える」。 */
  label?: string;
  /** 並べて置く2つめのボタン。 */
  secondary?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-muted/40 p-5 sm:p-6",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        匿名アンケート・3分
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link href={href}>{label}</Link>
        </Button>
        {secondary}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        答え終わると、その職場が法律どおりかの判定も出ます。
      </p>
    </section>
  );
}
