import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONSULT_PATH } from "@/lib/jobs/consult";

const COPY = {
  default: {
    title: "同じ状況にいる方へ。経験者として相談に乗ります",
    body: "弁護士ではないので法律相談ではなく、代理もできません。ただ、Acasへの相談から回収まで一人で通った者として、次に何をすればいいかを一緒に整理できます。",
  },
  // 計算の章。自分の未払い額が出た直後は、いちばん相談したくなるところ。
  emphasis: {
    title: "数字が出たら、次に何をするか一緒に考えます",
    body: "未払いがあると分かっても、そこから先は一人だと止まりがちです。弁護士ではないので法律相談や代理はできませんが、Acasへの相談から回収まで一人で通った者として、期限と次の一歩を一緒に整理できます。",
  },
} as const;

/**
 * 相談フォームへの案内。当事者の記録の目次と各章の読み終わりに置く。
 * 相談は日本語でしか受けないので、英語版には出さない。
 */
export default function ConsultAsk({
  variant = "default",
  className,
}: {
  variant?: keyof typeof COPY;
  className?: string;
}) {
  const copy = COPY[variant];

  return (
    <section
      className={cn(
        "rounded-xl border p-5 sm:p-6",
        variant === "emphasis"
          ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/20"
          : "border-border bg-muted/40",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        日本語で相談できます・無料
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">
        {copy.title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {copy.body}
      </p>
      <div className="mt-4">
        <Button asChild size="lg">
          <Link href={CONSULT_PATH}>相談する</Link>
        </Button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        1週間を目安に、メールで返信します。
      </p>
    </section>
  );
}
