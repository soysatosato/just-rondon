// components/jobs/StoreSummary.tsx
import { Card } from "@/components/ui/card";
import { DISTRIBUTION_LABEL, AMOUNT_PERIOD_LABEL } from "@/utils/labels";
import type { ServiceCharge } from "@prisma/client";

const DISTRIBUTION_ORDER = ["equal", "gradient", "fixed", "none"] as const;

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  );
}

export default function StoreSummary({
  reviews,
}: {
  reviews: ServiceCharge[];
}) {
  if (reviews.length === 0) return null;

  const totalReviews = reviews.length;
  const collectedReviews = reviews.filter((r) => r.serviceChargeCollected);
  const collectionRate = Math.round(
    (collectedReviews.length / totalReviews) * 100
  );

  const distributionCounts = collectedReviews.reduce<Record<string, number>>(
    (acc, r) => {
      const key = r.distributionType ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const distributionRows = DISTRIBUTION_ORDER.map((type) => ({
    type,
    label: DISTRIBUTION_LABEL[type],
    count: distributionCounts[type] ?? 0,
  })).filter((row) => row.count > 0);

  const amountsByPeriod = (["monthly", "weekly"] as const)
    .map((period) => {
      const values = collectedReviews
        .filter((r) => r.amountPeriod === period && r.amountValue != null)
        .map((r) => r.amountValue as number);
      return {
        period,
        count: values.length,
        avg: values.length
          ? values.reduce((a, b) => a + b, 0) / values.length
          : null,
      };
    })
    .filter((a) => a.count > 0);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight">この店舗のまとめ</h2>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="回答数"
          value={`${totalReviews}`}
          sub="件のレビュー"
        />
        <StatTile
          label="徴収率"
          value={`${collectionRate}%`}
          sub={`${collectedReviews.length}/${totalReviews}件が徴収あり`}
        />
        {amountsByPeriod.map((a) => (
          <StatTile
            key={a.period}
            label={`平均受取額（${AMOUNT_PERIOD_LABEL[a.period]}）`}
            value={`£${Math.round(a.avg as number)}`}
            sub={`${a.count}件の回答`}
          />
        ))}
      </div>

      {distributionRows.length > 0 && (
        <Card className="p-5">
          <p className="text-sm font-medium">分配方法の内訳</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            徴収ありの回答 {collectedReviews.length}件が対象
          </p>

          <div className="mt-4 space-y-3">
            {distributionRows.map((row) => {
              const pct = Math.round(
                (row.count / collectedReviews.length) * 100
              );
              return (
                <div key={row.type} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-foreground/90">{row.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {row.count}件・{pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/80"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
