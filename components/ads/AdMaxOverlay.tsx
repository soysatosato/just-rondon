"use client";

import { useEffect, useRef } from "react";
import { loadAdMaxScript, registerAdMax, rerunAdMaxScript } from "@/lib/admax";

type Props = {
  id?: string;
};

export default function AdMaxOverlay({
  id = "2c910bfc0ab39ec7949e2abf514acabf",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!ref.current) return;

      registerAdMax(id, "switch");

      try {
        await loadAdMaxScript();

        if (cancelled) return;

        // 既にscript読込済みで、あとから枠だけ追加された場合の再評価
        if (ref.current.children.length === 0) {
          rerunAdMaxScript();
        }
      } catch (error) {
        console.error(error);
      }
    }

    init();

    return () => {
      cancelled = true;
      // layout常駐前提なら unregister はしなくてOK
    };
  }, [id]);

  return (
    <div
      ref={ref}
      className="admax-switch"
      data-admax-id={id}
      style={{ display: "inline-block" }}
    />
  );
}
