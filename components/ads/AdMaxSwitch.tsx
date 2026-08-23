"use client";

import { useEffect, useRef } from "react";
import {
  ADMAX_ENABLED,
  loadAdMaxScript,
  registerAdMax,
  unregisterAdMax,
} from "@/lib/admax";

type Props = {
  id?: string;
};

export default function AdMaxSwitch({
  id = "f588d5ab1ffd38172de3b94514384f61",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ADMAX_ENABLED) return;

    let cancelled = false;

    async function init() {
      if (!ref.current) return;

      ref.current.innerHTML = "";

      registerAdMax(id, "switch");

      try {
        await loadAdMaxScript();

        if (cancelled) return;
      } catch (error) {
        console.error(error);
      }
    }

    init();

    return () => {
      cancelled = true;
      unregisterAdMax(id, "switch");

      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [id]);

  // 審査中は枠ごと描画しない。空の div が残ると、広告が読み込めていない
  // 抜け殻のように見えてしまうため。
  if (!ADMAX_ENABLED) return null;

  return (
    <div className="my-4 flex w-full justify-center">
      <div
        ref={ref}
        className="admax-switch"
        data-admax-id={id}
        style={{
          display: "inline-block",
        }}
      />
    </div>
  );
}
