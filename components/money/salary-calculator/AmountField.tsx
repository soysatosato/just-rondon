"use client";

import { useId, type KeyboardEvent } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import type { PayPeriod } from "@/lib/money/take-home/calculate";
import { formatGbp } from "@/lib/money/take-home/format";
import Segmented from "./Segmented";

const PERIOD_OPTIONS: { value: PayPeriod; label: string }[] = [
  { value: "year", label: "年収" },
  { value: "month", label: "月給" },
  { value: "week", label: "週給" },
  { value: "hour", label: "時給" },
];

/**
 * スライダーの右端と刻み。
 *
 * 右端を超える額は入力欄に直接打てる。スライダーは「だいたいの額を
 * 素早く試す」ための道具なので、よく使う範囲に解像度を寄せる。
 */
const SLIDER: Record<PayPeriod, { max: number; snap: number; keyStep: number }> = {
  year: { max: 200_000, snap: 500, keyStep: 1000 },
  month: { max: 16_000, snap: 50, keyStep: 100 },
  week: { max: 4_000, snap: 10, keyStep: 25 },
  hour: { max: 80, snap: 0.05, keyStep: 0.25 },
};

const SLIDER_RESOLUTION = 1000;

/**
 * 位置と額の対応は2乗にしてある。等間隔だと£200,000までの幅のうち
 * 大半の読者が使う£20,000〜£60,000が指1本ぶんに潰れてしまう。
 * 2乗なら左半分が£50,000まで。
 */
function positionFor(value: number, per: PayPeriod) {
  const ratio = Math.min(1, Math.max(0, value / SLIDER[per].max));
  return Math.round(Math.sqrt(ratio) * SLIDER_RESOLUTION);
}

function valueFor(position: number, per: PayPeriod) {
  const { max, snap } = SLIDER[per];
  const raw = (position / SLIDER_RESOLUTION) ** 2 * max;
  return Number((Math.round(raw / snap) * snap).toFixed(2));
}

export default function AmountField({
  text,
  pay,
  per,
  onTextChange,
  onBlur,
  onPayChange,
  onPerChange,
}: {
  text: string;
  pay: number | null;
  per: PayPeriod;
  onTextChange: (text: string) => void;
  onBlur: () => void;
  onPayChange: (value: number) => void;
  onPerChange: (per: PayPeriod) => void;
}) {
  const inputId = useId();
  const { keyStep } = SLIDER[per];

  // 矢印キーで額を上下させる。Shift で10倍。数字を消して打ち直すより速い。
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const step = keyStep * (e.shiftKey ? 10 : 1);
    const next = Math.max(0, (pay ?? 0) + (e.key === "ArrowUp" ? step : -step));
    onPayChange(Number(next.toFixed(2)));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
          給与の額面
        </label>
        <span className="text-[11px] text-muted-foreground">税・控除を引く前</span>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div
          className={cn(
            "group relative flex min-w-0 flex-1 items-center rounded-xl border bg-background px-4 shadow-sm transition",
            "focus-within:border-foreground/40 focus-within:ring-4 focus-within:ring-foreground/5",
          )}
        >
          <span className="text-2xl font-semibold text-muted-foreground" aria-hidden>
            £
          </span>
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={text}
            placeholder={per === "hour" ? "12.71" : "35,000"}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            aria-describedby={`${inputId}-hint`}
            className="h-14 w-full min-w-0 bg-transparent pl-1.5 text-3xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
          />
        </div>
        <Segmented
          name="pay-period"
          legend="額面の単位"
          value={per}
          options={PERIOD_OPTIONS}
          onChange={onPerChange}
          className="sm:w-60"
        />
      </div>
      <p id={`${inputId}-hint`} className="sr-only">
        矢印キーの上下で{formatGbp(keyStep, { pence: per === "hour" })}ずつ、Shift を押しながらで10倍ずつ変わります。
      </p>

      <SliderPrimitive.Root
        className="relative mt-4 flex h-6 w-full touch-none select-none items-center"
        min={0}
        max={SLIDER_RESOLUTION}
        step={1}
        value={[positionFor(pay ?? 0, per)]}
        onValueChange={([position]) => onPayChange(valueFor(position, per))}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-foreground/80" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-label="額面を調整"
          aria-valuetext={formatGbp(pay ?? 0, { pence: per === "hour" })}
          className="block h-5 w-5 rounded-full border-2 border-foreground bg-background shadow transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/15 active:scale-110"
        />
      </SliderPrimitive.Root>
      <div className="mt-1 flex justify-between text-[10.5px] tabular-nums text-muted-foreground">
        <span>£0</span>
        <span>{formatGbp(SLIDER[per].max / 4)}</span>
        <span>{formatGbp(SLIDER[per].max)}+</span>
      </div>
    </div>
  );
}
