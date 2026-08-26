"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type HeroSlide = {
  slug: string;
  name: string;
  engName: string;
  image: string;
};

/** 1カットの表示時間。長めに取らないとゆっくりのズームが「動いている」に見えない。 */
const DURATION_MS = 7000;

/**
 * ヒーローの背景に写真をクロスフェードで流す。
 *
 * 抽象的なぼかし装飾をやめてここを写真にしたのは、このサイトが
 * 何を扱っているかを一枚で伝えられるのが写真しかないため。
 *
 * 画像は next/image を通していない。next.config.mjs で
 * unoptimized: true にしている間は最適化が効かず、next/image を挟むと
 * priority の指定だけが目的の遠回りになる。1枚目は layout.tsx 側ではなく
 * ここで preload している。
 */
export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (slides.length <= 1) return;
    // 動きを減らす設定の読者にはクロスフェードもズームも出さない。
    // 1枚目で固定する。
    if (reduceMotion) return;

    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      DURATION_MS
    );
    return () => clearInterval(timer);
  }, [slides.length, reduceMotion]);

  if (slides.length === 0) return null;

  const current = slides[index];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-900">
      <AnimatePresence initial={false}>
        <motion.div
          key={current.slug}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        >
          <motion.img
            src={current.image}
            alt=""
            aria-hidden
            className="h-full w-full object-cover"
            // Ken Burns。静止画をゆっくり寄せると映像に見える。
            // 1.0 から始めると端に隙間が出る瞬間があるので 1.04 から。
            initial={reduceMotion ? false : { scale: 1.04 }}
            animate={reduceMotion ? undefined : { scale: 1.14 }}
            transition={{ duration: DURATION_MS / 1000 + 2, ease: "linear" }}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      {/*
        文字を白抜きで載せるための減光。上下を濃くして中央を抜くと、
        写真の主題(たいてい中央にある)を潰さずに見出しのコントラストを確保できる。
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/55 to-slate-950/85" />

      {/* 写真の出どころ。全画面写真は「どこの風景か」を言わないと落ち着かない。 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70"
          >
            {current.engName}
          </motion.p>
        </AnimatePresence>

        {/* 何枚目かの表示。押せる的にはせず、進行の目安だけ示す。 */}
        {slides.length > 1 && (
          <div className="flex shrink-0 gap-1.5">
            {slides.map((s, i) => (
              <span
                key={s.slug}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === index ? "w-6 bg-white/90" : "w-1.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
