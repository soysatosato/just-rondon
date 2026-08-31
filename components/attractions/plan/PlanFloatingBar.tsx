"use client";

import Link from "next/link";
import { CalendarRange } from "lucide-react";

import { usePlanCount } from "./plan-store";

/**
 * 画面下に貼りつく「プランを見る」。プランが空のときは何も出さない。
 *
 * 一覧でスポットを足しても、足した先(=プラン画面)への入口が
 * ページの最下部にしかないと、追加した実感のないまま一覧を
 * 眺め続けることになる。件数を出しているのは、いま何ヶ所選んだかが
 * 1日に詰め込みすぎたかどうかの最初の手がかりになるため。
 */
export default function PlanFloatingBar() {
  const count = usePlanCount();
  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <Link
        href="/sightseeing/plan"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
      >
        <CalendarRange className="h-4 w-4" aria-hidden />
        旅行プランを見る
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">
          {count}
        </span>
      </Link>
    </div>
  );
}
