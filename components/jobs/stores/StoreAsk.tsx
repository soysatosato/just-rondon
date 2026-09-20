// components/jobs/stores/StoreAsk.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SurveyAskCard } from "@/components/jobs/survey/SurveyAsk";
import { STORES_BASE } from "@/lib/jobs/store-slug";
import type { StoreAggregate } from "@/utils/service-charge";

/**
 * 店舗ページの依頼。
 *
 * 店舗ページは検索から人が着地する唯一の場所で、その中には、その店で働いた
 * 経験のある人が混じっている。読んで終わりにせず、この店について何が
 * 埋まっていないかを名指しで見せて頼む。
 *
 * 「まだ分かっていないこと」を出すのは、頼みごとを具体的にするため。
 * 「アンケートに答えてください」より「この店は給与明細の扱いが分かっていない」の
 * ほうが、自分が答えられる側かどうかを読み手が判断できる。
 */
function gapsOf(store: StoreAggregate): string[] {
  const gaps: string[] = [];

  // 徴収していない職場では、分配についての設問がそもそも出ない。
  if (store.status === "no-charge") {
    if (store.commentCount === 0) gaps.push("働いた人が自分の言葉で書いた話");
    return gaps;
  }

  const distributionAnswered =
    store.distribution.equal +
    store.distribution.gradient +
    store.distribution.fixed +
    store.distribution.none;

  if (distributionAnswered === 0) gaps.push("集めたサービスチャージの配り方");
  if (store.hourly === null) gaps.push("時給換算でいくらになるか");
  if (store.writtenPolicy.answered === 0) {
    gaps.push("書面のチップポリシーがあるか");
  }
  if (store.onPayslip.answered === 0) gaps.push("給与明細に別項目で載るか");
  if (store.kitchenIncluded.answered === 0) {
    gaps.push("キッチンにも分配されているか");
  }
  if (store.commentCount === 0) gaps.push("働いた人が自分の言葉で書いた話");

  return gaps;
}

export default function StoreAsk({
  store,
  href,
  className,
}: {
  store: StoreAggregate;
  /** 店舗を選んだ状態で開くアンケートのURL。 */
  href: string;
  className?: string;
}) {
  const gaps = gapsOf(store);

  return (
    <SurveyAskCard
      title="次にこの店で働く人のために、教えてください"
      href={href}
      label="この店について答える"
      className={className}
      secondary={
        <Button asChild variant="outline" size="lg">
          <Link href={STORES_BASE}>他の店舗を見る</Link>
        </Button>
      }
    >
      <p>
        {store.responseCount === 1
          ? "この店について分かっているのは、いまのところ1件の回答ぶんだけです。2件目が届くと、1人の見え方なのか、店の運用なのかが見えてきます。"
          : `この店に届いている回答は${store.responseCount}件です。増えるほど、次にここで面接を受ける人が、働く前に知れることが増えます。`}
      </p>

      {gaps.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-foreground">
            この店について、まだ分かっていないこと
          </p>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
            {gaps.map((gap) => (
              <li key={gap} className="flex items-start gap-1.5 text-xs">
                <span
                  aria-hidden
                  className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60"
                />
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SurveyAskCard>
  );
}
