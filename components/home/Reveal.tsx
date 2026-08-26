"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * スクロールで視界に入ったときに下から浮き上がる包み。
 *
 * トップページのセクションは server component なので、動きを付けるには
 * この client の包みを挟む。中身はそのまま children として渡るため、
 * 包んでも server component のままでいられる(props に関数を渡さない限り)。
 *
 * once: true にしているのは、戻ってきたときに再生し直すと、
 * 読み終えて上に戻る動作のたびに画面が動いて鬱陶しいため。
 *
 * amount は「要素の何割が入ったら発火するか」。0.15 にしているのは、
 * 背の高いセクションで 0.5 にすると、見出しが画面上端に来ても
 * まだ発火せず「出てこない」ように見えるから。
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * カードのグリッド用。子を1枚ずつ順に出す。
 *
 * Reveal をカード1枚ずつに巻いて delay を手で振ってもいいが、
 * 枚数が変わるたびに数字を振り直すことになる。stagger に任せる。
 *
 * 子は RevealItem で包む必要がある。variants は親から子へ伝播するが、
 * 伝播先が motion 要素でないと効かないため。
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealGroup の子。単体で使っても何も起きない。
 *
 * h-full を既定で当てているのは、この包みがグリッドの直接の子に
 * なるため。カード側の h-full は「親の高さいっぱい」の意味なので、
 * 間に入るこの div が伸びないと、行内でカードの高さが揃わなくなる。
 */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const cls = className ? `h-full ${className}` : "h-full";

  if (reduceMotion) return <div className={cls}>{children}</div>;

  return (
    <motion.div
      className={cls}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
