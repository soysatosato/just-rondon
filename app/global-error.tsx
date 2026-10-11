"use client";

import "./globals.css";

/**
 * ルートのレイアウト(ナビ・フッター・Clerk・プランの同期)ごと落ちたときの受け皿。
 *
 * ここまで来ると <head> は残らないので canonical は付けられない。それでも
 * Next.js 既定の英語のエラー画面ではなくこのサイトの文面にしておけば、
 * Googlebot が万一これを描画しても、ほかの Next.js サイトのエラー画面と
 * 「重複」とみなされて正規URLを外のサイトに取られることは無くなる
 * (経緯は app/error.tsx)。
 *
 * noindex は付けない。一時的なエラーを描画されただけでページが索引から
 * 落ちるほうが、重複扱いより戻すのに時間がかかる。
 *
 * レイアウトの部品は読み込まない。どれが落ちたのか分からないため。
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
          <p className="mb-2 text-sm text-muted-foreground">ジャスト・ロンドン</p>
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
            {/* レイアウトが落ちている前提なので、クライアント遷移ではなく素のリンクで読み直す。 */}
            <a
              href="/"
              className="rounded-lg border px-6 py-2.5 font-semibold transition hover:bg-muted"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
