"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * ヒーロー下端の実数。「このサイトにはどれだけ載っているのか」を
 * 数字で一度に渡す。文章で「充実しています」と書くより速い。
 *
 * 値は DB の実件数。増減してもここは触らなくていい。
 */
export default function HeroStats({
  attractions,
  museums,
  musicals,
}: {
  attractions: number;
  museums: number;
  musicals: number;
}) {
  const items = [
    { label: "観光スポット", value: attractions, unit: "件" },
    { label: "美術館・博物館", value: museums, unit: "館" },
    { label: "上演中ミュージカル", value: musicals, unit: "作" },
  ];

  return (
    <dl className="mx-auto mt-8 flex max-w-lg items-start justify-center gap-6 sm:gap-10">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <dd className="text-2xl font-bold tabular-nums tracking-tight text-white sm:text-3xl">
            <Counter to={item.value} />
            <span className="ml-0.5 text-sm font-semibold text-white/70">
              {item.unit}
            </span>
          </dd>
          <dt className="mt-1 text-[10px] font-medium tracking-wide text-white/60 sm:text-xs">
            {item.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/** 0 から実数までカウントアップする。動きを減らす設定なら最終値をそのまま出す。 */
function Counter({ to }: { to: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? to : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, reduceMotion]);

  return <>{display}</>;
}
