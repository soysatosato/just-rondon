"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    admaxads?: Array<{
      admax_id: string;
      type: "banner" | "overlay";
    }>;
    __admax_tag__?: unknown;
  }
}

type Props = {
  id?: string;
  width?: number;
  height?: number;
};

const SCRIPT_SRC = "https://adm.shinobi.jp/st/t.js";

export default function AdMaxBanner({
  id = "00a385c4d645c59db6021c17ce7b4bea",
  width = 300,
  height = 250,
}: Props) {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mountedRef.current) return;
    mountedRef.current = true;

    window.admaxads = window.admaxads || [];

    window.admaxads.push({
      admax_id: id,
      type: "banner",
    });

    const existingScript = document.querySelector(
      `script[src="${SCRIPT_SRC}"]`,
    ) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    } else {
      // 既存 script がある場合、AdMax 側の内部状態を軽くリセットして再評価を促す
      window.__admax_tag__ = undefined;

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    }

    return () => {
      if (!window.admaxads) return;

      window.admaxads = window.admaxads.filter(
        (ad) => !(ad.admax_id === id && ad.type === "banner"),
      );
    };
  }, [id]);

  return (
    <div className="my-4 flex w-full justify-center overflow-hidden">
      <div
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
