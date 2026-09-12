// components/jobs/dashboard/StoreExplorer.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StoreRow from "@/components/jobs/stores/StoreRow";
import { type StoreAggregate } from "@/utils/service-charge";

/**
 * 店舗一覧。以前は3文字以上の検索をしないと何も出ない作りで、
 * 初めて来た人にはデータが1件も無いページに見えていた。
 * 対象店舗は数十件しかないので全件を渡し、絞り込みは手元で行う。
 */

type Tab = "all" | "unpaid" | "shared" | "no-charge";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "unpaid", label: "分配なしの報告" },
  { key: "shared", label: "分配されている" },
  { key: "no-charge", label: "徴収なし" },
];

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
            <StoreRow key={s.placeId} store={s} />
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
