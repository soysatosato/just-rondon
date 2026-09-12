// components/jobs/stores/StoreRow.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { storePath } from "@/lib/jobs/store-slug";
import {
  STORE_STATUS_LABEL,
  type StoreAggregate,
  type StoreStatus,
} from "@/utils/service-charge";

/**
 * 店舗一覧の1行。店舗別一覧・ダッシュボードの絞り込み・店舗ページの
 * 「近くの店舗」で同じ見え方にするため、行の中身はここだけに置く。
 */

export const STORE_STATUS_STYLE: Record<StoreStatus, string> = {
  unpaid:
    "border-[#d03b3b]/40 bg-[#d03b3b]/10 text-[#a82f2f] dark:border-[#e05a5a]/40 dark:bg-[#e05a5a]/10 dark:text-[#e88a8a]",
  fixed: "border-border bg-muted text-foreground/80",
  shared:
    "border-[#2a78d6]/40 bg-[#2a78d6]/10 text-[#215fa9] dark:border-[#3987e5]/40 dark:bg-[#3987e5]/10 dark:text-[#8db8ee]",
  "no-charge": "border-border bg-transparent text-muted-foreground",
  unknown: "border-border bg-transparent text-muted-foreground",
};

/** 住所から末尾の「, London」「イギリス」などを落として短く見せる。 */
export function shortAddress(address: string): string {
  return address
    .replace(/\s*イギリス\s*$/, "")
    .replace(/,?\s*(UK|United Kingdom)\s*$/i, "")
    .trim();
}

export default function StoreRow({ store }: { store: StoreAggregate }) {
  return (
    <li>
      <Link
        href={storePath(store.slug)}
        className="group flex items-start gap-4 bg-card p-4 transition hover:bg-muted/50"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate font-medium text-foreground">
            {store.storeName || "（店舗名不明）"}
          </p>
          {store.storeAddress && (
            <p className="truncate text-xs text-muted-foreground">
              {shortAddress(store.storeAddress)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium",
                STORE_STATUS_STYLE[store.status],
              )}
            >
              {STORE_STATUS_LABEL[store.status]}
            </span>
            {store.hourly !== null && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[0.6875rem] tabular-nums text-muted-foreground">
                時給換算 £{store.hourly.toFixed(2)}
              </span>
            )}
            {store.commentCount > 0 && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
                現場の声 {store.commentCount}件
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 pt-0.5">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
            {store.responseCount}件
          </span>
          <span
            aria-hidden
            className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}
