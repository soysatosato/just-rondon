// components/jobs/survey/Choice.tsx
"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  /** 選択肢の下に出る補足。法的な位置づけなど。 */
  note?: string;
  /** 補足を警告色で出す。 */
  warn?: boolean;
};

/**
 * 選択肢1つぶんをカードにしたラジオ。
 *
 * 素のラジオボタンだと親指で押せる面積が丸そのものになり、スマートフォンでの
 * 誤タップが増える。この調査はほぼスマートフォンから答えられるので、
 * 行全体を当たり判定にしている。
 */
export default function Choice<T extends string>({
  name,
  value,
  onChange,
  options,
  columns = 1,
}: {
  name: string;
  value: T | null;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  columns?: 1 | 2;
}) {
  return (
    <RadioGroup
      name={name}
      value={value ?? ""}
      onValueChange={(v: string) => onChange(v as T)}
      className={cn(
        "grid gap-2",
        columns === 2 && "sm:grid-cols-2",
      )}
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        const selected = value === option.value;
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition",
              selected
                ? "border-foreground/60 bg-muted/60"
                : "border-border hover:border-foreground/30 hover:bg-muted/30",
            )}
          >
            <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
            <span className="min-w-0 space-y-1">
              <span className="block text-sm font-medium leading-snug text-foreground">
                {option.label}
              </span>
              {option.note && (
                <span
                  className={cn(
                    "block text-xs leading-relaxed",
                    option.warn ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {option.note}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

/** 設問1つぶんの枠。見出し・補足・中身の間隔をここで揃える。 */
export function Question({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[0.9375rem] font-semibold leading-snug text-foreground">
          {label}
          {optional && (
            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">
              任意
            </span>
          )}
        </p>
        {hint && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
