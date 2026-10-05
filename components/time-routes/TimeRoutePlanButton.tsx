"use client";

import Link from "next/link";
import { CalendarPlus, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  addToPlanWithMinutes,
  usePlanDay,
  usePlanMinutes,
} from "@/components/attractions/plan/plan-store";

/**
 * 「この配分で旅程に入れる」。時間別の回り方の各段の下に出す。
 *
 * 押すと、そのスポットを段の分数つきで旅程(/plan)に入れる。すでに
 * 入っていれば時間だけを書き換えるので、別の段のボタンを押し直すと
 * 配分を切り替えられる。外す操作はここには置かない——3つの段のどれで
 * 外すのかが分かりにくいので、外すのは旅程の画面と「旅行プランに追加」の
 * ボタンに任せる。
 *
 * 美術館ページにも出るが、旅程は観光スポット(Attraction)を単位に
 * しているので、slug は対応する観光スポットのものを渡す。
 */
export default function TimeRoutePlanButton({
  slug,
  name,
  label,
  minutes,
}: {
  slug: string;
  name: string;
  /** 段の名前。「1時間」。 */
  label: string;
  minutes: number;
}) {
  const day = usePlanDay(slug);
  const current = usePlanMinutes(slug);
  const selected = day > 0 && current === minutes;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => addToPlanWithMinutes(slug, minutes)}
        aria-pressed={selected}
        aria-label={`${name}を${label}の配分で旅程に入れる`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition",
          selected
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-border bg-background text-foreground hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400",
        )}
      >
        {selected ? (
          <Check className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {selected
          ? `${label}の配分でプラン${day}日目に入っています`
          : `この配分(${label})で旅程に入れる`}
      </button>

      {day > 0 && (
        <Link
          href="/plan"
          className="text-sm font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-700 dark:text-indigo-400"
        >
          プランを見る
        </Link>
      )}
    </div>
  );
}
