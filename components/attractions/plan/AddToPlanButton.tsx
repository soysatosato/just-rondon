"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { togglePlan, usePlanDay } from "./plan-store";

/**
 * 「旅行プランに追加」ボタン。一覧のカードと、スポット詳細ページに出る。
 *
 * 追加後にラベルを「追加済み」で止めず何日目かまで出すのは、
 * 行き先が最終日に決まるため。詳細ページから足した人には、その場で
 * どの日に入ったかが見えていないと、プラン画面を開いて初めて
 * 意図しない日に入っていたことに気づく。
 *
 * 押すと外れるトグルにしてある。「追加済み」を押して何も起きないより、
 * 取り消せるほうが迷わない。
 */
export default function AddToPlanButton({
  slug,
  name,
  variant = "card",
  className,
}: {
  slug: string;
  name: string;
  /** card: 一覧のカード内。detail: スポット詳細ページの本文幅。 */
  variant?: "card" | "detail";
  className?: string;
}) {
  const day = usePlanDay(slug);
  const added = day > 0;

  const label = added ? `プラン${day}日目に追加済み` : "旅行プランに追加";

  return (
    <div
      className={cn(
        variant === "detail" && "flex flex-wrap items-center gap-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => togglePlan(slug)}
        aria-pressed={added}
        aria-label={added ? `${name}をプランから外す` : `${name}をプランに追加`}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition",
          variant === "card"
            ? "w-full px-3 py-1.5 text-xs"
            : "px-5 py-2.5 text-sm",
          added
            ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
            : "border-border bg-background text-foreground hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400",
        )}
      >
        {added ? (
          <Check className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="truncate">{label}</span>
      </button>

      {variant === "detail" && added && (
        <Link
          href="/sightseeing/plan"
          className="text-sm font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-700 dark:text-indigo-400"
        >
          プランを見る
        </Link>
      )}
    </div>
  );
}
