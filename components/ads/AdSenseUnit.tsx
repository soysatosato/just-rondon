"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT } from "@/lib/adsense";

type Props = {
  /** lib/adsense.ts の AD_SLOTS から渡す。空文字なら何も描画しない。 */
  slot: string;
  format?: string;
  layout?: string;
  /** CLS防止のために先に確保する高さ(px)。 */
  reservedHeight?: number;
  className?: string;
};

export default function AdSenseUnit({
  slot,
  format = "auto",
  layout,
  reservedHeight = 280,
  className,
}: Props) {
  const pathname = usePathname();
  const insRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    // 既に埋まっている要素へ再pushすると AdSense が TagError を投げる。
    // この属性は AdSense 自身が done/unfilled を書き込むので、
    // StrictMode の二重実行対策も兼ねる。
    if (el.getAttribute("data-adsbygoogle-status")) return;

    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // TagError をレンダリングツリーに波及させない
    }
  }, [pathname, slot]);

  if (!slot) return null;

  return (
    <div className={className} style={{ minHeight: reservedHeight }}>
      <ins
        // 同じ位置のコンポーネントはルート遷移でDOMが再利用され、
        // 前ページの広告が残ってしまう。key で <ins> を作り直す。
        key={`${pathname}|${slot}`}
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  );
}
