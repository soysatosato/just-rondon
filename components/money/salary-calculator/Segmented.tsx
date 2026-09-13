"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: ReactNode;
  /** ラベルの下に小さく添える補足。 */
  sub?: ReactNode;
};

/**
 * 選択肢が2〜4個の切り替え。
 *
 * 見た目はボタンだが中身は radio にしてある。radio なら矢印キーでの移動、
 * スクリーンリーダーでの「3つ中2つ目、選択済み」の読み上げが
 * ブラウザ標準のまま手に入る。div と onClick で作ると全部自前になる。
 *
 * 選択中の背景は layoutId で次の選択肢へ滑らせる。どこからどこへ
 * 切り替わったのかが目で追えるので、税率が切り替わったことに気づける。
 */
export default function Segmented<T extends string>({
  name,
  legend,
  value,
  options,
  onChange,
  size = "md",
  stackOnMobile = false,
  className,
}: {
  /** radio の name。ページ内で一意にする(layoutId にも使う)。 */
  name: string;
  /** 画面には出さないが読み上げられる見出し。 */
  legend: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
  /** 長いラベルを持つとき、狭い画面で縦に積む。 */
  stackOnMobile?: boolean;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="sr-only">{legend}</legend>
      <div
        className={cn(
          "grid gap-1 rounded-xl bg-muted/80 p-1 ring-1 ring-inset ring-border/60",
          stackOnMobile
            ? "grid-cols-1 sm:auto-cols-fr sm:grid-flow-col"
            : "auto-cols-fr grid-flow-col",
        )}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label key={option.value} className="relative min-w-0">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              {checked && (
                <motion.span
                  layoutId={`${name}-thumb`}
                  aria-hidden
                  className="absolute inset-0 rounded-lg bg-background shadow-sm ring-1 ring-border/70"
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
                />
              )}
              <span
                className={cn(
                  "relative flex h-full cursor-pointer select-none flex-col items-center justify-center rounded-lg text-center leading-tight transition-colors",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-background",
                  size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
                  checked
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{option.label}</span>
                {option.sub && (
                  <span className="mt-0.5 text-[10.5px] font-normal leading-snug text-muted-foreground">
                    {option.sub}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
