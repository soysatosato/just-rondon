"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { ServiceChargeStats as Stats } from "@/utils/actions/jobs";
import { AMOUNT_PERIOD_LABEL } from "@/utils/labels";

// Validated categorical palette (dataviz skill, fixed order — never cycled)
const PALETTE = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500"],
};

const DISTRIBUTION_SHORT_LABEL: Record<string, string> = {
  equal: "等分配",
  gradient: "グラデーション分配",
  fixed: "固定上乗せ",
  none: "分配なし",
};

const DISTRIBUTION_FULL_LABEL: Record<string, string> = {
  equal: "従業員に等分配されている",
  gradient: "役職・勤務時間等に応じたグラデーション分配",
  fixed: "時給に一定額として固定で上乗せ（大部分をオーナー側が取得）",
  none: "分配されていない（実質オーナー側が取得）",
};

const DISTRIBUTION_ORDER = ["equal", "gradient", "fixed", "none"];

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function ChartTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-md border bg-card px-3 py-2 shadow-sm text-xs space-y-0.5">
      <p className="font-semibold text-sm">{item.value}件</p>
      <p className="text-muted-foreground">{item.payload.tooltipLabel ?? item.name}</p>
    </div>
  );
}

export default function ServiceChargeStats({ stats }: { stats: Stats }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const palette =
    mounted && resolvedTheme === "dark" ? PALETTE.dark : PALETTE.light;

  if (stats.totalReviews === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        まだ調査データがありません。最初の回答をお待ちしています。
      </Card>
    );
  }

  const collectionRate = Math.round(
    (stats.collectedCount / stats.totalReviews) * 100
  );

  const collectionData = [
    {
      key: "collected",
      name: "徴収あり",
      value: stats.collectedCount,
      tooltipLabel: "サービスチャージを徴収している",
    },
    {
      key: "notCollected",
      name: "徴収なし",
      value: stats.notCollectedCount,
      tooltipLabel: "サービスチャージを徴収していない",
    },
  ].filter((d) => d.value > 0);

  const distributionData = DISTRIBUTION_ORDER.map((type, i) => {
    const found = stats.distribution.find((d) => d.type === type);
    return {
      type,
      name: DISTRIBUTION_SHORT_LABEL[type],
      tooltipLabel: DISTRIBUTION_FULL_LABEL[type],
      count: found?.count ?? 0,
      color: palette[i % palette.length],
    };
  });
  const hasDistributionData = distributionData.some((d) => d.count > 0);

  const amountTiles = stats.amountByPeriod.filter((a) => a.count > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile label="総レビュー数" value={`${stats.totalReviews}件`} />
        <StatTile label="登録店舗数" value={`${stats.totalStores}店舗`} />
        <StatTile label="サービスチャージ徴収率" value={`${collectionRate}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm font-medium mb-2">サービスチャージ徴収の有無</p>
          {collectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={collectionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={collectionData.length > 1 ? 3 : 0}
                  strokeWidth={2}
                  className="stroke-card"
                  label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                >
                  {collectionData.map((entry, i) => (
                    <Cell
                      key={entry.key}
                      fill={entry.key === "collected" ? palette[0] : palette[1]}
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={24}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              データがありません
            </p>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium mb-2">
            サービスチャージの分配方法（徴収ありの店舗）
          </p>
          {hasDistributionData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={distributionData}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
                barSize={20}
              >
                <CartesianGrid
                  horizontal={false}
                  className="stroke-muted"
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distributionData.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    className="fill-foreground text-xs"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              データがありません
            </p>
          )}
        </Card>
      </div>

      {amountTiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {amountTiles.map((a) => (
            <StatTile
              key={a.period}
              label={`平均サービスチャージ（${AMOUNT_PERIOD_LABEL[a.period as "weekly" | "monthly"]}・${a.count}件）`}
              value={`£${Math.round(a.avg)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
