"use client";

import { useEffect, useRef } from "react";
import {
  loadAdMaxScript,
  registerAdMax,
  rerunAdMaxScript,
  unregisterAdMax,
} from "@/lib/admax";

type Props = {
  id?: string;
  width?: number;
  height?: number;
};

export default function AdMaxBanner({
  id = "00a385c4d645c59db6021c17ce7b4bea",
  width = 300,
  height = 250,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!ref.current) return;

      ref.current.innerHTML = "";

      registerAdMax(id, "banner");

      try {
        await loadAdMaxScript();

        if (cancelled) return;

        // overlayが先に script 読込済みの可能性があるので、
        // banner追加後は再評価を1回促す
        if (ref.current && ref.current.children.length === 0) {
          rerunAdMaxScript();
        }
      } catch (error) {
        console.error(error);
      }
    }

    init();

    return () => {
      cancelled = true;
      unregisterAdMax(id, "banner");

      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [id]);

  return (
    <div className="my-4 flex w-full justify-center">
      <div
        ref={ref}
        className="admax-ads"
        data-admax-id={id}
        style={{
          display: "inline-block",
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
