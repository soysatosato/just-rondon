"use client";

import { motion, useReducedMotion } from "framer-motion";

import TitleLogo from "@/components/home/TitleLogo";
import HeroSearch from "@/components/home/HeroSearch";

/**
 * ヒーローの前景。背景の写真スライド(HeroSlideshow)の上に重なるので、
 * 文字色は写真前提の白で固定する。テーマの foreground を使うと
 * ライトテーマで白背景の文字色になり、写真の上で読めなくなる。
 *
 * 以前あった「旅行者向け / 在住者向け」のボタン2本は外した。
 * すぐ上の検索窓と役割が重なっていて、最初の一手が2箇所に割れていた。
 * 区分の振り分けは下の大区分セクションが担う。
 */
export default function HeroContent() {
  const reduceMotion = useReducedMotion();

  // 上から順に現れる。間隔を空けすぎると読み込みが遅く見えるので
  // 全体を 0.6 秒以内に収める。
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="relative">
      <motion.div
        {...rise(0)}
        className="text-center text-3xl font-extrabold tracking-tight text-white select-none md:text-4xl"
      >
        <TitleLogo onPhoto />
      </motion.div>

      {/* ページ唯一の h1。トップの主題を表す語をここに集約する。 */}
      <motion.h1
        {...rise(0.1)}
        className="mt-6 text-center text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl"
      >
        ロンドン観光・旅行・現地ガイド
      </motion.h1>

      <motion.p
        {...rise(0.18)}
        className="mt-3 mb-8 text-center text-base tracking-tight text-white/75 md:text-lg"
      >
        観光スポット・美術館・ミュージカル情報
      </motion.p>

      <motion.div {...rise(0.26)}>
        <HeroSearch />
      </motion.div>
    </div>
  );
}
