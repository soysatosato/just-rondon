"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    admaxads?: Array<{
      admax_id: string;
      type: string;
    }>;
    __admax_tag__?: unknown;
  }
}

type Props = {
  id?: string;
};

export default function AdMaxBanner({
  id = "00a385c4d645c59db6021c17ce7b4bea",
}: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.admaxads = window.admaxads || [];

    const exists = window.admaxads.some(
      (ad) => ad.admax_id === id && ad.type === "banner",
    );

    if (!exists) {
      window.admaxads.push({
        admax_id: id,
        type: "banner",
      });
    }

    const script = document.querySelector(
      'script[src="https://adm.shinobi.jp/st/t.js"]',
    ) as HTMLScriptElement | null;

    if (!script) {
      const tag = document.createElement("script");
      tag.src = "https://adm.shinobi.jp/st/t.js";
      tag.async = true;
      tag.charset = "utf-8";
      document.body.appendChild(tag);
    } else {
      window.__admax_tag__ = undefined;
      const tag = document.createElement("script");
      tag.src = "https://adm.shinobi.jp/st/t.js";
      tag.async = true;
      tag.charset = "utf-8";
      document.body.appendChild(tag);
    }

    return () => {
      if (window.admaxads) {
        window.admaxads = window.admaxads.filter(
          (ad) => !(ad.admax_id === id && ad.type === "banner"),
        );
      }
      window.__admax_tag__ = undefined;
    };
  }, [id]);

  return (
    <div
      className="admax-ads"
      data-admax-id={id}
      style={{
        display: "inline-block",
        width: "300px",
        height: "250px",
      }}
    />
  );
}
