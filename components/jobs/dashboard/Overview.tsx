// components/jobs/dashboard/Overview.tsx
//
// ダッシュボードの数字。recharts を使わないのは、
//  - 出すのは「4カテゴリの構成比」と「はい/いいえの比率」だけで、棒の長さは div で足りる
//  - チャートライブラリはクライアントでテーマ解決を待つため、初回に色が飛ぶ
//  - 凡例やツールチップに隠れず、全ての値がそのまま文字で読める
// ため。色は補強でしかなく、どの棒にも名前と件数と割合が直接書いてある。

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  ObligationTally,
  ServiceChargeOverview,
} from "@/utils/service-charge";
import type { DistributionType } from "@/utils/labels";

/**
 * 分配方法は「適法 ↔ 違法の可能性」という極性を持つので、
 * カテゴリ配色ではなく発散配色（青 ↔ 灰 ↔ 赤）を当てる。
 * 青と赤の組み合わせは色覚特性の影響を受けにくく、
 * light/dark どちらの背景でもコントラスト3:1を満たす値を選んである。
 */
const POLARITY = {
  lawful: {
    bar: "bg-[#2a78d6] dark:bg-[#3987e5]",
    dot: "bg-[#2a78d6] dark:bg-[#3987e5]",
  },
  neutral: {
    bar: "bg-muted-foreground/70",
    dot: "bg-muted-foreground/70",
  },
  unlawful: {
    bar: "bg-[#d03b3b] dark:bg-[#e05a5a]",
    dot: "bg-[#d03b3b] dark:bg-[#e05a5a]",
  },
} as const;

const DISTRIBUTION_POLARITY: Record<
  DistributionType,
  keyof typeof POLARITY
> = {
  equal: "lawful",
  gradient: "lawful",
  fixed: "neutral",
  none: "unlawful",
};

/** グラフの行に収める短縮形。正式名称は utils/labels.ts。 */
const DISTRIBUTION_SHORT: Record<DistributionType, string> = {
  equal: "全員に等分配",
  gradient: "役職・時間に応じて傾斜配分",
  fixed: "時給に固定額で上乗せ",
  none: "分配されていない",
};

function Tile({
  label,
  value,
  sub,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  muted?: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs leading-snug text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold tracking-tight md:text-3xl",
          muted ? "text-muted-foreground" : "tabular-nums",
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {sub}
        </p>
      )}
    </Card>
  );
}

/** 回答が集まっていない設問の置き場所。空白ではなく理由を書く。 */
function Pending({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}

function ObligationRow({
  label,
  hint,
  tally,
  goodIs,
}: {
  label: string;
  hint: string;
  tally: ObligationTally;
  /** 「はい」と「いいえ」のどちらが法律の求める側か。 */
  goodIs: "yes" | "no";
}) {
  if (tally.answered === 0) return null;

  const badCount = goodIs === "yes" ? tally.no : tally.yes;
  const badPct = Math.round((badCount / tally.answered) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{badPct}%</span>
          <span className="ml-1 text-xs">
            （{badCount}/{tally.answered}件）
          </span>
        </p>
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", POLARITY.unlawful.bar)}
          style={{ width: `${badPct}%` }}
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  );
}

export default function Overview({
  overview,
}: {
  overview: ServiceChargeOverview;
}) {
  const {
    totalResponses,
    totalStores,
    collectedStores,
    unpaidStores,
    fixedStores,
    distribution,
    distributionAnswered,
    hourly,
    monthly,
  } = overview;

  if (totalResponses === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          まだ調査データがありません
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          最初の回答をお待ちしています。
        </p>
      </Card>
    );
  }

  const unpaidPct =
    collectedStores > 0
      ? Math.round((unpaidStores / collectedStores) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* 見出しの数字 ------------------------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card className="flex flex-col justify-between p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              この調査でいちばん多い訴え
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              サービスチャージを徴収している{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {collectedStores}
              </span>{" "}
              店舗のうち
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-[#d03b3b] dark:text-[#e05a5a] md:text-6xl">
                {unpaidStores}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">
                店舗
              </span>
              <span className="text-sm text-muted-foreground">
                （{unpaidPct}%）
              </span>
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              で「まったく分配されていない」という回答が出ています
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            2024年10月1日以降、チップとサービスチャージは全額が働いた人のものです。
            雇用主が差し引けるのは税金と国民保険料だけで、それ以外の控除は違法です。
            {fixedStores > 0 && (
              <>
                {" "}
                このほか{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {fixedStores}
                </span>{" "}
                店舗で「時給に固定額で上乗せ」という回答があり、これは集めた総額が全額渡っているかどうかで結論が変わります。
              </>
            )}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Tile
            label="集まった回答"
            value={`${totalResponses}`}
            sub="件（すべて匿名）"
          />
          <Tile label="対象店舗" value={`${totalStores}`} sub="店舗" />
          {hourly.median !== null ? (
            <Tile
              label="サービスチャージの時給換算（中央値）"
              value={`£${hourly.median.toFixed(2)}`}
              sub={`${hourly.sampleSize}件の回答から。${
                hourly.min !== null && hourly.max !== null
                  ? `£${hourly.min.toFixed(2)}〜£${hourly.max.toFixed(2)}`
                  : ""
              }`}
            />
          ) : (
            <Tile
              label="サービスチャージの時給換算（中央値）"
              value="収集中"
              muted
              sub="勤務時間を聞く設問を2026年9月に追加しました"
            />
          )}
          {monthly.median !== null ? (
            <Tile
              label="1ヶ月の受取額（中央値）"
              value={`£${Math.round(monthly.median)}`}
              sub={`${monthly.sampleSize}件の回答から`}
            />
          ) : (
            <Tile label="1ヶ月の受取額（中央値）" value="収集中" muted />
          )}
        </div>
      </div>

      {/* 分配方法 ---------------------------------------------------- */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-base font-bold tracking-tight">
            集めたサービスチャージは、どう配られているか
          </h3>
          <p className="text-xs text-muted-foreground">
            徴収ありの回答{" "}
            <span className="tabular-nums">{distributionAnswered}</span>件が対象
          </p>
        </div>

        {distributionAnswered > 0 ? (
          <>
            <ul className="mt-5 space-y-4">
              {distribution.map((row) => {
                const pct = Math.round(
                  (row.count / distributionAnswered) * 100,
                );
                const polarity = POLARITY[DISTRIBUTION_POLARITY[row.type]];
                return (
                  <li key={row.type} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        {DISTRIBUTION_SHORT[row.type]}
                      </p>
                      <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {row.count}
                        </span>
                        件・{pct}%
                      </p>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10",
                          polarity.bar,
                        )}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">色の意味</span>
              {[
                { key: "lawful", label: "適法とされる配り方" },
                { key: "neutral", label: "総額しだいで結論が変わる" },
                { key: "unlawful", label: "違法の可能性が高い" },
              ].map((item) => (
                <span key={item.key} className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      "h-2 w-2 rounded-full",
                      POLARITY[item.key as keyof typeof POLARITY].dot,
                    )}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4">
            <Pending
              title="分配方法の回答がまだありません"
              body="サービスチャージを徴収している職場の回答が集まると、ここに構成比が出ます。"
            />
          </div>
        )}
      </section>

      {/* 雇用主の義務 ------------------------------------------------ */}
      <section>
        <h3 className="text-base font-bold tracking-tight">
          雇用主に義務づけられていることは、守られているか
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          「わからない」と答えた回答は分母から除いています。
        </p>

        {overview.writtenPolicy.answered +
          overview.onPayslip.answered +
          overview.kitchenIncluded.answered >
        0 ? (
          <div className="mt-5 space-y-5">
            <ObligationRow
              label="書面のチップポリシーを見たことがない"
              hint="分配のルールを書面にし、働く人が読める状態にしておくことは2024年10月からの法定義務です。"
              tally={overview.writtenPolicy}
              goodIs="yes"
            />
            <ObligationRow
              label="給与明細に別項目として載っていない"
              hint="別項目で出ていないと、いくら受け取ったのかを自分で確認できません。"
              tally={overview.onPayslip}
              goodIs="yes"
            />
            <ObligationRow
              label="キッチンスタッフには分配されていない"
              hint="分配の対象はその職場で働く人であり、フロアに限られません。"
              tally={overview.kitchenIncluded}
              goodIs="yes"
            />
          </div>
        ) : (
          <div className="mt-4">
            <Pending
              title="2026年9月に追加した設問です"
              body="書面のチップポリシー・給与明細への記載・キッチンへの分配の3つを聞き始めました。回答が集まり次第、ここに割合が出ます。"
            />
          </div>
        )}
      </section>
    </div>
  );
}
