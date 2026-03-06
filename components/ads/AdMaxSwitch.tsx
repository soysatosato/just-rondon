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
  id: string;
};

export default function AdmaxSwitch({ id }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.admaxads) {
      window.admaxads = [];
    }

    const exists = window.admaxads.some((ad) => ad.admax_id === id);

    if (!exists) {
      window.admaxads.push({
        admax_id: id,
        type: "switch",
      });
    }

    const script = document.createElement("script");
    script.src = "https://adm.shinobi.jp/st/t.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();

      if (window.admaxads) {
        const index = window.admaxads.findIndex((ad) => ad.admax_id === id);
        if (index !== -1) {
          window.admaxads.splice(index, 1);
        }
      }

      window.__admax_tag__ = undefined;
    };
  }, [id]);

  return (
    <div
      className="admax-switch"
      data-admax-id={id}
      style={{
        display: "block",
        width: "100%",
        minWidth: "320px",
        minHeight: "100px",
      }}
    />
  );
}
