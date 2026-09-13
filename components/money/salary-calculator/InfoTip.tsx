"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * 用語の説明。
 *
 * hover で開くツールチップにしないのは、この計算機を開く人の多くが
 * スマホで給与明細と見比べているから。タップで開いて、もう一度
 * タップするか外を触れば閉じる Popover にしてある。
 */
export default function InfoTip({
  label,
  children,
}: {
  /** 何の説明か。ボタンの読み上げに使う。 */
  label: string;
  children: ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        aria-label={`${label}の説明`}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 text-xs leading-relaxed text-muted-foreground"
      >
        <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
        {children}
      </PopoverContent>
    </Popover>
  );
}
