"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 写真の棚(PhotoRail)の横スクロール部分と、PC 用の前後ボタン。
 *
 * 棚はスクロールバーを隠しているので、マウスだけの PC では横に送る手段が
 * 無く、画面に入った5枚より先に気づかれなかった(横スクロールは PC では
 * 使われにくい: NN/g "Beware Horizontal Scrolling")。md 以上で左右に
 * ボタンを出し、押すと画面の8割ぶん送る。スマホは指で送れるので出さない。
 *
 * 端まで来た側のボタンは消す。押しても動かないボタンを残さないため。
 */
export default function RailScroller({
  label,
  children,
}: {
  /** 棚の名前。ボタンの読み上げ名に使う(「見逃せない名所を前へ」)。 */
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  // 縦位置は PC のカード写真(212×265px)の中央。
  const buttonClass =
    "absolute top-[8.25rem] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-md transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex";

  return (
    <div className="relative mt-5">
      {/*
        コンテナの左右パディングぶん外に出してから同じだけ内側に戻す。
        こうしないと、横スクロールの右端が本文の右端で切れて、
        「まだ続きがある」ことが見えなくなる。
      */}
      <div
        ref={ref}
        className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {!atStart && (
        <button
          type="button"
          onClick={() => page(-1)}
          aria-label={`${label}を前へ`}
          className={`${buttonClass} -left-5`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          onClick={() => page(1)}
          aria-label={`${label}を次へ`}
          className={`${buttonClass} -right-5`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
