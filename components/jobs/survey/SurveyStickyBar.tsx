// components/jobs/survey/SurveyStickyBar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanCount } from "@/components/attractions/plan/plan-store";
import { surveyHref } from "./entry";

const DISMISS_KEY = "just-rondon-survey-bar-dismissed";

/**
 * 画面下に追従する、アンケートへの近道。
 *
 * 冒頭の入口を通り過ぎてから集計や現場の声を読み、「自分の店も」と思った人が
 * ページの上まで戻らなくて済むようにする。入口のカードや本文中の案内が
 * 画面に見えている間は同じものが2つ並ぶので隠す。閉じたらこのタブの間は出さない。
 *
 * 旅行プランの「プランを見る」も画面下に出るので、出ているときはその上に逃げる。
 */
export default function SurveyStickyBar({
  anchorId,
  hideWhenVisible = [],
}: {
  /** これより下へスクロールしたら出す要素(冒頭の入口)。 */
  anchorId: string;
  /** 画面に入っている間は隠す要素(本文中の案内やページ末尾)。 */
  hideWhenVisible?: string[];
}) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const planCount = usePlanCount();

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      // ストレージが使えない環境では、閉じたことを覚えないだけ。
    }
  }, []);

  // 配列のままだと描画のたびに別物になり、監視を張り直してしまう。
  const hideKey = hideWhenVisible.join(" ");

  useEffect(() => {
    if (dismissed) return;
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const hiders = hideKey
      .split(" ")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    let pastAnchor = false;
    const inView = new Set<Element>();

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === anchor) {
          pastAnchor =
            !entry.isIntersecting && entry.boundingClientRect.top < 0;
        } else if (entry.isIntersecting) {
          inView.add(entry.target);
        } else {
          inView.delete(entry.target);
        }
      }
      setShow(pastAnchor && inView.size === 0);
    });

    observer.observe(anchor);
    hiders.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [anchorId, hideKey, dismissed]);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // 同上。
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-x-3 z-40 transition-all duration-300 motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:w-[24rem] print:hidden",
        planCount > 0 ? "bottom-20" : "bottom-3 sm:bottom-6",
        // invisible は透明になり終わってから効くので、消えるときもフェードが見える。
        show
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-3 opacity-0",
      )}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-neutral-950 py-2.5 pl-4 pr-2 text-neutral-50 shadow-2xl shadow-black/25 ring-1 ring-black/10 dark:bg-neutral-900 dark:ring-white/15">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            あなたの職場は、法律どおり？
          </p>
          <p className="mt-0.5 truncate text-xs text-neutral-400">
            匿名・必須3問・送る前に判定が出ます
          </p>
        </div>
        <Link
          href={surveyHref()}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          3分で診断
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="閉じる"
          className="shrink-0 rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
