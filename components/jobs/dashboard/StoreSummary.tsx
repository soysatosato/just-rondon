// components/jobs/dashboard/StoreSummary.tsx
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DISTRIBUTION_LABEL, type DistributionType } from "@/utils/labels";
import type { StoreAggregate } from "@/utils/service-charge";

const DISTRIBUTION_ORDER: DistributionType[] = [
  "equal",
  "gradient",
  "fixed",
  "none",
];

/** ダッシュボードの構成比と同じ発散配色。青＝適法／灰＝要確認／赤＝違法の可能性。 */
const BAR_COLOR: Record<DistributionType, string> = {
  equal: "bg-[#2a78d6] dark:bg-[#3987e5]",
  gradient: "bg-[#2a78d6] dark:bg-[#3987e5]",
  fixed: "bg-muted-foreground/70",
  none: "bg-[#d03b3b] dark:bg-[#e05a5a]",
};

/** 店舗の状態ごとの一言。回答が割れている店では最も深刻なものを採る。 */
const STATUS_NOTE: Record<
  StoreAggregate["status"],
  { title: string; body: string; tone: "alert" | "neutral" | "ok" }
> = {
  unpaid: {
    tone: "alert",
    title: "「まったく分配されていない」という回答があります",
    body: "2024年10月1日以降、チップとサービスチャージは全額が働いた人のものです。事実であれば Tipping Act 2023 に反している可能性が高い状態です。",
  },
  fixed: {
    tone: "neutral",
    title: "「時給に固定額で上乗せ」という回答があります",
    body: "上乗せという方式そのものは違法ではありません。店が集めた総額が全額スタッフに渡っているかどうかで結論が変わります。",
  },
  shared: {
    tone: "ok",
    title: "分配されているという回答が寄せられています",
    body: "配り方そのものには問題がなさそうです。残る論点は、集めた総額がそのまま分配に回っているかどうかです。",
  },
  "no-charge": {
    tone: "neutral",
    title: "サービスチャージを徴収していない職場です",
    body: "徴収していない職場では、Tipping Act 2023 の分配義務そのものが発生しません。",
  },
  unknown: {
    tone: "neutral",
    title: "分配方法についての回答がまだありません",
    body: "徴収の有無だけが分かっている状態です。分配方法の回答が集まると、ここに内訳が出ます。",
  },
};

const TONE_STYLE = {
  alert:
    "border-[#d03b3b]/40 bg-[#d03b3b]/[0.06] dark:border-[#e05a5a]/40 dark:bg-[#e05a5a]/[0.08]",
  neutral: "border-border bg-muted/40",
  ok: "border-[#2a78d6]/40 bg-[#2a78d6]/[0.05] dark:border-[#3987e5]/40 dark:bg-[#3987e5]/[0.08]",
} as const;

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs leading-snug text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}

export default function StoreSummary({ store }: { store: StoreAggregate }) {
  const note = STATUS_NOTE[store.status];
  const distributionAnswered = DISTRIBUTION_ORDER.reduce(
    (sum, type) => sum + store.distribution[type],
    0,
  );

  return (
    <div className="space-y-5">
      <div className={cn("rounded-xl border p-5", TONE_STYLE[note.tone])}>
        <p className="font-semibold text-foreground">{note.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {note.body}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="回答数" value={`${store.responseCount}`} sub="件" />
        <Tile
          label="徴収ありの回答"
          value={`${store.collectedCount}`}
          sub={`${store.responseCount}件中`}
        />
        {store.hourly !== null ? (
          <Tile
            label="時給換算（中央値）"
            value={`£${store.hourly.toFixed(2)}`}
            sub={`${store.hourlySampleSize}件の回答から`}
          />
        ) : null}
        {store.monthly !== null ? (
          <Tile
            label="1ヶ月の受取額（中央値）"
            value={`£${Math.round(store.monthly)}`}
            sub={`${store.monthlySampleSize}件の回答から`}
          />
        ) : null}
      </div>

      {distributionAnswered > 0 && (
        <Card className="p-5">
          <p className="text-sm font-medium">分配方法の内訳</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            分配方法に回答があった {distributionAnswered}件が対象
          </p>

          <ul className="mt-4 space-y-3">
            {DISTRIBUTION_ORDER.filter(
              (type) => store.distribution[type] > 0,
            ).map((type) => {
              const count = store.distribution[type];
              const pct = Math.round((count / distributionAnswered) * 100);
              return (
                <li key={type} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-foreground/90">
                      {DISTRIBUTION_LABEL[type]}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {count}件・{pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10",
                        BAR_COLOR[type],
                      )}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
