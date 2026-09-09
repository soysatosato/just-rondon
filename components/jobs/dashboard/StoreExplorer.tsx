// components/jobs/dashboard/StoreExplorer.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  STORE_STATUS_LABEL,
  type StoreAggregate,
  type StoreStatus,
} from "@/utils/service-charge";

/**
 * 店舗一覧。以前は3文字以上の検索をしないと何も出ない作りで、
 * 初めて来た人にはデータが1件も無いページに見えていた。
 * 対象店舗は数十件しかないので全件を渡し、絞り込みは手元で行う。
 */

const STATUS_STYLE: Record<StoreStatus, string> = {
  unpaid:
    "border-[#d03b3b]/40 bg-[#d03b3b]/10 text-[#a82f2f] dark:border-[#e05a5a]/40 dark:bg-[#e05a5a]/10 dark:text-[#e88a8a]",
  fixed: "border-border bg-muted text-foreground/80",
  shared:
    "border-[#2a78d6]/40 bg-[#2a78d6]/10 text-[#215fa9] dark:border-[#3987e5]/40 dark:bg-[#3987e5]/10 dark:text-[#8db8ee]",
  "no-charge": "border-border bg-transparent text-muted-foreground",
  unknown: "border-border bg-transparent text-muted-foreground",
};

type Tab = "all" | "unpaid" | "shared" | "no-charge";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "unpaid", label: "分配なしの報告" },
  { key: "shared", label: "分配されている" },
  { key: "no-charge", label: "徴収なし" },
];

/** 住所から末尾の「, London」「イギリス」などを落として短く見せる。 */
function shortAddress(address: string): string {
  return address
    .replace(/\s*イギリス\s*$/, "")
    .replace(/,?\s*(UK|United Kingdom)\s*$/i, "")
    .trim();
}

export default function StoreExplorer({
  stores,
}: {
  stores: StoreAggregate[];
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(
    () => ({
      all: stores.length,
      unpaid: stores.filter((s) => s.status === "unpaid").length,
      shared: stores.filter((s) => s.status === "shared").length,
      "no-charge": stores.filter((s) => s.status === "no-charge").length,
    }),
    [stores],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stores.filter((s) => {
      if (tab !== "all" && s.status !== tab) return false;
      if (!q) return true;
      return (
        s.storeName.toLowerCase().includes(q) ||
        s.storeAddress.toLowerCase().includes(q) ||
        (s.postcode ?? "").toLowerCase().includes(q)
      );
    });
  }, [stores, query, tab]);

  const INITIAL = 12;
  const visible = expanded ? filtered : filtered.slice(0, INITIAL);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setExpanded(false);
          }}
          placeholder="店舗名・住所・ポストコードで絞り込む"
          aria-label="店舗を絞り込む"
          className="h-11"
        />

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setExpanded(false);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                tab === t.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums opacity-70">
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {visible.map((s) => (
            <li key={s.placeId}>
              <Link
                href={`/jobs/service-charges/dashboard/${s.placeId}`}
                className="group flex items-start gap-4 bg-card p-4 transition hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate font-medium text-foreground">
                    {s.storeName || "（店舗名不明）"}
                  </p>
                  {s.storeAddress && (
                    <p className="truncate text-xs text-muted-foreground">
                      {shortAddress(s.storeAddress)}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium",
                        STATUS_STYLE[s.status],
                      )}
                    >
                      {STORE_STATUS_LABEL[s.status]}
                    </span>
                    {s.hourly !== null && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[0.6875rem] tabular-nums text-muted-foreground">
                        時給換算 £{s.hourly.toFixed(2)}
                      </span>
                    )}
                    {s.commentCount > 0 && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
                        現場の声 {s.commentCount}件
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pt-0.5">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">
                    {s.responseCount}件
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
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            条件に一致する店舗はありません
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            この店舗の情報は、まだ誰も登録していません。あなたが最初の回答者になれます。
          </p>
          <Button asChild className="mt-4">
            <Link href="/jobs/service-charges/survey">
              この店舗の情報を登録する
            </Link>
          </Button>
        </div>
      )}

      {filtered.length > INITIAL && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {expanded
              ? `${filtered.length}店舗をすべて表示中`
              : `${filtered.length}店舗中 ${INITIAL}店舗を表示中`}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          >
            {expanded ? "折りたたむ" : "すべて表示する"}
          </button>
        </div>
      )}
    </div>
  );
}
