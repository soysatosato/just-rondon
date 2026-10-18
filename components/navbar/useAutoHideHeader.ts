"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * スマホのヘッダーを「下へ読むと隠れ、少し戻すと出る」形にする。
 *
 * 以前のヘッダーは追従せず、詳細ページ(10〜21画面ある)の途中では、
 * メニューを開くのに一番上まで戻るしかなかった。常に貼り付けると
 * 読んでいる間ずっと画面の1割を取られるので、上へ戻したときだけ出す
 * (NN/g の「partially persistent header」。スマホ向きとされる)。
 *
 * 出ている間はヘッダーの高さを CSS 変数 --sticky-top に書く。記事の章ナビ
 * など、ほかに画面上端へ貼り付く帯は top-[var(--sticky-top,0px)] にして、
 * ヘッダーの下へずれる(重なって隠れない)ようにしてある。
 * デスクトップ(xl 以上)ではヘッダーの入れ物が display:none で高さ0になり、
 * 変数も 0 になる。
 */

/** 向きが変わったとみなすスクロール量。指の小さな揺れで出し入れしない。 */
const THRESHOLD = 6;
/** ページの頭のこの範囲では常に出す。 */
const ALWAYS_SHOWN_ABOVE = 80;

export function useAutoHideHeader({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY;

        if (y < ALWAYS_SHOWN_ABOVE) {
          setHidden(false);
          lastY = y;
        } else if (delta > THRESHOLD) {
          setHidden(true);
          lastY = y;
        } else if (delta < -THRESHOLD) {
          setHidden(false);
          lastY = y;
        }
        // しきい値に届かない動きでは lastY を動かさない。ゆっくりした
        // スクロールも積み上がって、いずれしきい値を越える。
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // メニューを開いている間は隠さない。
  const effectiveHidden = hidden && !paused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;

    const apply = () => {
      root.style.setProperty(
        "--sticky-top",
        `${effectiveHidden ? 0 : el.offsetHeight}px`,
      );
    };
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [effectiveHidden]);

  // キーボードで隠れたヘッダーの中へ移ったときは出す。
  const reveal = useCallback(() => setHidden(false), []);

  return { ref, hidden: effectiveHidden, reveal };
}
