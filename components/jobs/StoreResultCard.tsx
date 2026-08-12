// components/jobs/StoreResultCard.tsx
import Link from "next/link";

type Props = {
  placeId: string;
  storeName: string | null;
  storeAddress?: string | null;
  reviewCount: number;
};

/** 検索結果・一覧の両方で使う店舗カード。 */
export default function StoreResultCard({
  placeId,
  storeName,
  storeAddress,
  reviewCount,
}: Props) {
  return (
    <Link
      href={`/jobs/service-charges/dashboard/${placeId}`}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-foreground/30 hover:bg-muted/40"
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium text-foreground">
          {storeName || "（店舗名不明）"}
        </p>
        {storeAddress && (
          <p className="truncate text-xs text-muted-foreground">
            {storeAddress}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
          {reviewCount}件
        </span>
        <span
          aria-hidden
          className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
        >
          →
        </span>
      </div>
    </Link>
  );
}
