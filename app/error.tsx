"use client";

import Link from "next/link";

/**
 * ページの描画中に起きたエラーの受け皿。
 *
 * これが無いと、エラーは Next.js 既定の「Application error: a client-side
 * exception has occurred」画面まで突き抜ける。既定の画面は <html> から
 * 描き直すので、<head> の canonical も本文も消え、文面はどの Next.js
 * サイトでも同じになる。2026-08 に Googlebot がこの画面を描画したページ
 * (ブランド3本・/money・/plan・コラムなど30本ほど)は、同じく既定の画面に
 * なった無関係なサイト(747live.bet・access.ms.gov)と「重複」とみなされ、
 * 正規URLをそちらに取られた。
 *
 * ここはルートのレイアウトの内側にあるので、エラーになっても <head>
 * (canonical)・ナビ・フッターは残り、差し替わるのは本文だけになる。
 * レイアウト自体が落ちたときは app/global-error.tsx が受ける。
 */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-bold">ページを表示できませんでした</h1>
      <p className="mb-8 text-muted-foreground">
        読み込みの途中で問題が起きました。もう一度読み込むと表示されることがあります。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition hover:opacity-90"
        >
          もう一度読み込む
        </button>
        <Link
          href="/"
          className="rounded-lg border px-6 py-2.5 font-semibold transition hover:bg-muted"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
