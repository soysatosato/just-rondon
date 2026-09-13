"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * 値が変わったとき、前の値から数え上げて見せる数字。
 *
 * 入力を1文字変えるたびに数字がパッと入れ替わると、どれくらい動いたのかが
 * 読めない。数え上げると「少し増えた」「大きく減った」が量として目に入る。
 *
 * 初回の描画は最終値のまま出す(サーバーで書き出した HTML と一致させ、
 * 読み込み直後に0から数え上げる演出で数字を読みにくくしないため)。
 */
export default function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    if (reduceMotion || Math.abs(current.current - value) < 0.005) {
      current.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(current.current, value, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        current.current = latest;
        setDisplay(latest);
      },
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return <span className={className}>{format(display)}</span>;
}
