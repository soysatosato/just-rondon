// components/jobs/dashboard/VoiceList.tsx
import Link from "next/link";
import { storePath, storeSlug } from "@/lib/jobs/store-slug";
import { cn } from "@/lib/utils";
import {
  excerpt,
  splitLegacyNote,
  type ChargeRecord,
} from "@/utils/service-charge";
import {
  DISTRIBUTION_LABEL,
  WORK_PERIOD_SHORT_LABEL,
  type DistributionType,
  type WorkPeriod,
} from "@/utils/labels";

/**
 * 現場の声。この調査でいちばん読まれているのは構成比ではなく、
 * ここに書かれた具体的な話のほうなので、店舗ページに潜らせず前に出す。
 */

const FIELD_LABEL = {
  serviceChargeComment: "サービスチャージ",
  mealComment: "賄い",
  generalComment: "職場について",
} as const;

type Field = keyof typeof FIELD_LABEL;

const FIELDS: Field[] = [
  "serviceChargeComment",
  "mealComment",
  "generalComment",
];

function formatMonth(date: Date): string {
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
}

export default function VoiceList({
  records,
  limit = 6,
  className,
}: {
  records: ChargeRecord[];
  /** 出す件数。2列で並べるので偶数にしておく。 */
  limit?: number;
  className?: string;
}) {
  const voices = records
    .map((r) => {
      const parts = FIELDS.map((field) => {
        const raw = r[field];
        if (!raw) return null;
        const { body } = splitLegacyNote(raw);
        if (!body) return null;
        return { field, body };
      }).filter((p): p is { field: Field; body: string } => p !== null);
      return { record: r, parts };
    })
    .filter((v) => v.parts.length > 0)
    .slice(0, limit);

  if (voices.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border p-8 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">
          まだ自由記述の回答がありません
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          あなたの職場のことを書いてもらえると、次に面接を受ける人が読めます。
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("grid gap-3 md:grid-cols-2", className)}>
      {voices.map(({ record, parts }) => {
        const unpaid = record.distributionType === "none";
        return (
          <li key={record.id}>
            <Link
              href={storePath(storeSlug(record))}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition hover:border-foreground/30 hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-medium text-foreground">
                  {record.storeName || "（店舗名不明）"}
                </p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {record.workPeriod
                    ? WORK_PERIOD_SHORT_LABEL[record.workPeriod as WorkPeriod]
                    : formatMonth(record.createdAt)}
                </p>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium",
                    unpaid
                      ? "border-[#d03b3b]/40 bg-[#d03b3b]/10 text-[#a82f2f] dark:border-[#e05a5a]/40 dark:bg-[#e05a5a]/10 dark:text-[#e88a8a]"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {record.serviceChargeCollected
                    ? record.distributionType
                      ? DISTRIBUTION_LABEL[
                          record.distributionType as DistributionType
                        ]
                      : "徴収あり"
                    : "サービスチャージなし"}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {parts.slice(0, 2).map((p) => (
                  <div key={p.field}>
                    <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
                      {FIELD_LABEL[p.field]}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {excerpt(p.body, 150)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground transition group-hover:text-foreground">
                この店舗の回答をすべて見る →
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
