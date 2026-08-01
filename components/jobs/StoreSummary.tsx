// components/jobs/StoreSummary.tsx
import { Card } from "@/components/ui/card";
import { DISTRIBUTION_LABEL, AMOUNT_PERIOD_LABEL } from "@/utils/labels";
import type { ServiceCharge } from "@prisma/client";

const DISTRIBUTION_ORDER = ["equal", "gradient", "fixed", "none"] as const;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
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

  const amountsByPeriod = (["weekly", "monthly"] as const)
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
      <p className="text-sm font-medium">この店舗のサマリー</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile label="レビュー件数" value={`${totalReviews}件`} />
        <StatTile label="サービスチャージ徴収率" value={`${collectionRate}%`} />
        {amountsByPeriod.map((a) => (
          <StatTile
            key={a.period}
            label={`平均金額（${AMOUNT_PERIOD_LABEL[a.period]}・${a.count}件）`}
            value={`£${Math.round(a.avg as number)}`}
          />
        ))}
      </div>

      {distributionRows.length > 0 && (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">
            分配方法の内訳（徴収ありの回答 {collectedReviews.length}件中）
          </p>
          <div className="space-y-2">
            {distributionRows.map((row) => {
              const pct = Math.round(
                (row.count / collectedReviews.length) * 100
              );
              return (
                <div key={row.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/90">{row.label}</span>
                    <span className="text-muted-foreground">
                      {row.count}件（{pct}%）
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
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
