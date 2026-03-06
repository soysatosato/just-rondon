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

export default function AdMaxOverlay({
  id = "79695e0a0c519cbdc2aa4d409afe80c4",
}: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.admaxads = window.admaxads || [];

    if (
      !window.admaxads.some((ad) => ad.admax_id === id && ad.type === "overlay")
    ) {
      window.admaxads.push({
        admax_id: id,
        type: "overlay",
      });
    }

    const tag = document.createElement("script");
    tag.src = "https://adm.shinobi.jp/st/t.js";
    tag.async = true;
    tag.charset = "utf-8";
    document.body.appendChild(tag);

    return () => {
      window.__admax_tag__ = undefined;
    };
  }, [id]);

  return null;
}
