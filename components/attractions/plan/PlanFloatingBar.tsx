"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarRange } from "lucide-react";

import { usePlanCount } from "./plan-store";

/**
 * 画面下に貼りつく「プランを見る」。プランが空のときは何も出さない。
 *
 * 以前は観光スポット一覧の中だけに置いていた。スポット詳細ページから
 * 足した人には追加した先への入口が出ず、記事を読み進むうちに
 * プランを作っていること自体を忘れる。組みかけの旅程はサイトの
 * どこにいても持ち歩けるべきものなので、ルートレイアウトに移した。
 *
 * 件数を出しているのは、いま何ヶ所選んだかが「1日に詰め込みすぎたか」の
 * 最初の手がかりになるため。
 */

/** ここでは出さないページ。プラン画面自身と、別サイト扱いの lyrixplorer。 */
const HIDDEN_PREFIXES = ["/plan", "/lyrixplorer"];

export default function PlanFloatingBar() {
  const count = usePlanCount();
  const pathname = usePathname();

  if (count === 0) return null;
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 print:hidden">
      <Link
        href="/plan"
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
