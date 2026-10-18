"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchStore } from "./search-store";

/**
 * サイト内検索を開くボタン。
 *
 *   icon:  スマホのヘッダー。44px 四方の虫眼鏡。
 *   field: 入力欄の形。デスクトップのヘッダー・トップのヒーロー・404。
 *          押すと検索の画面が開き、そのまま打てる(入力欄に見えて打てない
 *          部品にはしない——以前のトップの検索窓がそうだった)。
 */
export default function SearchTrigger({
  variant,
  placeholder = "サイト内を検索",
  className,
}: {
  variant: "icon" | "field";
  placeholder?: string;
  className?: string;
}) {
  const openSearch = useSearchStore((state) => state.openSearch);

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={() => openSearch()}
        aria-label="サイト内を検索"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-md border border-input bg-background transition hover:bg-accent",
          className,
        )}
      >
        <Search className="h-5 w-5" aria-hidden />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openSearch()}
      className={cn(
        "flex w-full items-center gap-2 rounded-full border border-input bg-background px-4 text-left text-muted-foreground shadow-sm transition hover:border-foreground/30",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{placeholder}</span>
      <kbd className="hidden shrink-0 rounded border border-border px-1.5 font-sans text-[11px] text-muted-foreground lg:inline">
        /
      </kbd>
    </button>
  );
}
