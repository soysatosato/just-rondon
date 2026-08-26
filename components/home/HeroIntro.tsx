"use client";

import { motion, useReducedMotion } from "framer-motion";

import TitleLogo from "@/components/home/TitleLogo";
import HeroSearch from "@/components/home/HeroSearch";

/**
 * ヒーロー左半分の文言。
 *
 * 写真の上ではなく無地の上に置くので、色はテーマの foreground に戻す。
 * 全画面写真に重ねていた頃は、ライトテーマでも読めるよう白に固定して
 * いたが、その必要が無くなった。
 *
 * 中央揃えをやめて左揃えにした。中央揃えの見出し+説明+検索窓という
 * 並びは、どのサイトのトップにもある形で、この配置そのものが
 * 「よくあるサイト」という印象を作っていた。
 */
export default function HeroIntro() {
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="max-w-xl">
      <motion.div {...rise(0)}>
        <TitleLogo />
      </motion.div>

      {/* ページ唯一の h1。 */}
      <motion.h1
        {...rise(0.08)}
        className="mt-7 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]"
      >
        ロンドン観光・旅行・
        <br className="hidden sm:block" />
        現地暮らしのガイド
      </motion.h1>

      {/*
        「日本語のロンドン情報サイト」だけでは他と区別がつかないので、
        扱っている幅(3日の旅行から数年の生活まで)を最初の1文に入れる。
      */}
      <motion.p
        {...rise(0.16)}
        className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base"
      >
        定番の観光スポットと無料で入れる美術館、ウエストエンドのミュージカル。
        毎週更新する現地の最新情報と、ビザ・住まい・仕事の実務まで。
        3日間の旅行から数年の生活まで、日本語でまとめています。
      </motion.p>

      <motion.div {...rise(0.24)} className="mt-8">
        <HeroSearch />
      </motion.div>
    </div>
  );
}
