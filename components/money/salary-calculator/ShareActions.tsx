"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 条件つきのリンクを渡す。
 *
 * 計算機が被リンクを集めるのは、結果を誰かに見せたくなったときに
 * 「このページのこの条件」をそのまま渡せる場合だけ。コピーとネイティブの
 * 共有シート(スマホ)を並べ、X と LINE は文面つきで開く。
 * 文面に数字を入れるのは、SNS のカード画像は全員共通のため、
 * 結果を伝えられるのが本文だけだから。
 */
export default function ShareActions({
  query,
  shareText,
}: {
  /** 現在の条件のクエリ文字列(? なし)。 */
  query: string;
  shareText: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const url = () =>
    `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
    } catch {
      // クリップボードが使えない環境(一部のアプリ内ブラウザ)では選択用に出す。
      window.prompt("このリンクをコピーしてください", url());
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "イギリスの手取り計算機", text: shareText, url: url() });
    } catch {
      // 共有シートを閉じただけのときも例外になるので、何もしない。
    }
  };

  const openIntent = (target: "x" | "line") => {
    const link = url();
    const href =
      target === "x"
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`
        : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const button =
    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className={cn(
          button,
          copied
            ? "border-emerald-600/50 text-emerald-700 dark:text-emerald-400"
            : "border-border bg-background text-foreground hover:border-foreground/40",
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
        <span aria-live="polite">{copied ? "コピーしました" : "この条件のリンク"}</span>
      </button>
      {canShare && (
        <button
          type="button"
          onClick={share}
          className={cn(button, "border-border bg-background text-foreground hover:border-foreground/40")}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden />
          共有
        </button>
      )}
      <button
        type="button"
        onClick={() => openIntent("x")}
        className={cn(button, "border-border bg-background text-foreground hover:border-foreground/40")}
      >
        Xでポスト
      </button>
      <button
        type="button"
        onClick={() => openIntent("line")}
        className={cn(button, "border-border bg-background text-foreground hover:border-foreground/40")}
      >
        LINEで送る
      </button>
    </div>
  );
}
