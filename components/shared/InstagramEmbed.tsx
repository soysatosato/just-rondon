"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Instagram の投稿を埋め込む。
 *
 * 店の写真を「借りて載せる」のではなく、店自身の投稿を埋め込む形にすると
 * 画像の複製が発生しないので、権利の面で最も安全に写真を出せる。
 *
 * 実装上の注意が3つある。
 *
 * 1. embed.js はページに1本だけ読む。コンポーネントごとに append すると、
 *    1つがアンマウントしたときに共有のスクリプトごと消えて、
 *    残りの埋め込みが二度と描画されなくなる。
 * 2. 交差監視で、画面に近づくまで読み込まない。埋め込み1つが数百KBの
 *    iframe になるので、1ページに複数置くと初期表示が目に見えて遅くなる。
 * 3. スクリプトが来なくても、リンクだけは必ず残るようにする。
 *    Instagram の埋め込みは広告ブロッカーに止められることが珍しくなく、
 *    その場合に空白が残るのは避けたい。
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const SCRIPT_SRC = "https://www.instagram.com/embed.js";

/** 読み込みは1ページにつき1回。結果を使い回す。 */
let scriptPromise: Promise<boolean> | null = null;

function loadEmbedScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.instgrm) return Promise.resolve(true);

  if (!scriptPromise) {
    scriptPromise = new Promise<boolean>((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(true);
      // ブロックされた場合。呼び出し側でリンク表示に倒す。
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export default function InstagramEmbed({
  url,
  /** 埋め込みが描画されるまで確保しておく高さ。CLS を防ぐ。 */
  reservedHeight = 480,
  className = "",
}: {
  url: string;
  reservedHeight?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 交差監視が使えない環境ではそのまま読み込む。
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      // 画面に入る少し手前から読み始める。
      { rootMargin: "400px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;

    let cancelled = false;
    loadEmbedScript().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        setBlocked(true);
        return;
      }
      // process() はページ内の未処理の blockquote をまとめて変換する。
      // 何度呼んでも既に変換済みのものには触らない。
      window.instgrm?.Embeds.process();
    });

    return () => {
      cancelled = true;
    };
  }, [inView]);

  if (blocked) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-sky-700 hover:underline dark:border-slate-600 dark:text-sky-300 ${className}`}
      >
        Instagram で写真を見る
      </a>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: inView ? undefined : reservedHeight }}
    >
      {inView && (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ width: "100%", margin: 0, minHeight: reservedHeight }}
        >
          {/*
            スクリプトが差し替える前に見えている中身。
            変換されればここごと iframe に置き換わる。
          */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-sky-700 underline dark:text-sky-300"
          >
            Instagram で写真を見る
          </a>
        </blockquote>
      )}
    </div>
  );
}
