// components/jobs/dashboard/ResponseCard.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  excerpt,
  hourlyRate,
  splitLegacyNote,
  type ChargeRecord,
} from "@/utils/service-charge";
import {
  DISTRIBUTION_LABEL,
  JOB_ROLE_LABEL,
  WORK_PERIOD_SHORT_LABEL,
  YES_NO_UNKNOWN_LABEL,
  type DistributionType,
  type JobRole,
  type WorkPeriod,
  type YesNoUnknown,
} from "@/utils/labels";

/** 分配なしの回答だけ色を変える。それ以外は等しく地の色で並べる。 */
const UNPAID_BADGE =
  "border-[#d03b3b]/40 bg-[#d03b3b]/10 text-[#a82f2f] dark:border-[#e05a5a]/40 dark:bg-[#e05a5a]/10 dark:text-[#e88a8a]";

function Comment({ label, text }: { label: string; text: string }) {
  const { body, legacy } = splitLegacyNote(text);
  if (!body && !legacy) return null;

  return (
    <div>
      <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {body && (
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {body}
        </p>
      )}
      {legacy && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          いまは廃止した選択式設問への回答：{excerpt(legacy, 200)}
        </p>
      )}
    </div>
  );
}

export default function ResponseCard({
  record,
  showStoreName = true,
}: {
  record: ChargeRecord;
  /** 店舗ページでは店名の見出しが重複するので消す。 */
  showStoreName?: boolean;
}) {
  const hourly = hourlyRate(record);
  const unpaid = record.distributionType === "none";

  // 選択式の回答は、答えのあったものだけをタグとして並べる。
  const facts: string[] = [];
  if (record.workPeriod) {
    facts.push(WORK_PERIOD_SHORT_LABEL[record.workPeriod as WorkPeriod]);
  }
  if (record.jobRole) {
    facts.push(JOB_ROLE_LABEL[record.jobRole as JobRole]);
  }
  if (record.chargeRatePercent !== null) {
    facts.push(`料率 ${record.chargeRatePercent}%`);
  }
  if (hourly !== null) {
    facts.push(`時給換算 £${hourly.toFixed(2)}`);
  }
  if (record.writtenPolicy) {
    facts.push(
      `書面のポリシー：${YES_NO_UNKNOWN_LABEL[record.writtenPolicy as YesNoUnknown]}`,
    );
  }
  if (record.onPayslip) {
    facts.push(
      `給与明細に記載：${YES_NO_UNKNOWN_LABEL[record.onPayslip as YesNoUnknown]}`,
    );
  }
  if (record.kitchenIncluded) {
    facts.push(
      `キッチンにも分配：${YES_NO_UNKNOWN_LABEL[record.kitchenIncluded as YesNoUnknown]}`,
    );
  }

  const hasComment =
    record.serviceChargeComment || record.mealComment || record.generalComment;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border bg-muted/30 px-5 py-3">
        {showStoreName ? (
          <Link
            href={`/jobs/service-charges/dashboard/${record.placeId}`}
            className="min-w-0 truncate font-medium text-foreground underline-offset-4 hover:underline"
          >
            {record.storeName || "（店舗名不明）"}
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">
            {record.createdAt.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
            })}
            の回答
          </p>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium",
              unpaid ? UNPAID_BADGE : "border-border text-muted-foreground",
            )}
          >
            {record.serviceChargeCollected
              ? record.distributionType
                ? DISTRIBUTION_LABEL[
                    record.distributionType as DistributionType
                  ]
                : "徴収あり（分配方法は未回答）"
              : "サービスチャージなし"}
          </span>
          {showStoreName && (
            <span className="text-xs text-muted-foreground">
              {record.createdAt.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
              })}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {facts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {facts.map((f) => (
              <span
                key={f}
                className="rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {record.amountValue !== null && (
          <p className="text-sm text-muted-foreground">
            受け取っている額：
            <span className="font-medium tabular-nums text-foreground">
              {record.amountPeriod === "weekly" ? "週" : "月"}額 約£
              {record.amountValue}
            </span>
            {record.monthlyHours !== null && (
              <span className="ml-2 tabular-nums">
                （月{record.monthlyHours}時間の勤務）
              </span>
            )}
          </p>
        )}

        {hasComment ? (
          <div className="space-y-4">
            {record.serviceChargeComment && (
              <Comment
                label="サービスチャージ"
                text={record.serviceChargeComment}
              />
            )}
            {record.mealComment && (
              <Comment label="賄い" text={record.mealComment} />
            )}
            {record.generalComment && (
              <Comment label="職場について" text={record.generalComment} />
            )}
          </div>
        ) : (
          facts.length === 0 &&
          record.amountValue === null && (
            <p className="text-sm text-muted-foreground">
              選択式の設問のみの回答です。
            </p>
          )
        )}
      </div>
    </article>
  );
}
