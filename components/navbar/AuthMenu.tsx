"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Stamp } from "lucide-react";

import { STAMP_BOOK_HREF } from "@/lib/stamps";

/**
 * ナビゲーションのログイン部分。
 *
 * スタンプ帳へのリンクは、ログインしていてもいなくても常に出す。
 * 未ログインの人が押すと /stamps が「何が貯まるのか」を説明するので、
 * ログイン前の人にこそ見せる必要がある。
 *
 * ログイン状態が要るのはアバター(UserButton)とログインリンクだけ。
 * Clerk の読み込みが終わるまでこの2つは何も描かれないので、
 * 幅の変わるものをここに増やさないこと——ヘッダーがずれる。
 */
export default function AuthMenu({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  /** モバイルはシートの中に出るので、遷移時に閉じる。 */
  onNavigate?: () => void;
}) {
  if (variant === "mobile") {
    return (
      <div className="flex flex-col space-y-3 border-t border-border pt-3">
        <Link
          href={STAMP_BOOK_HREF}
          className="flex items-center gap-x-2 hover:text-red-600 transition"
          onClick={onNavigate}
        >
          <Stamp className="h-5 w-5" aria-hidden />
          スタンプ帳
        </Link>
        <SignedOut>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-red-600 transition"
            onClick={onNavigate}
          >
            ログイン / アカウント登録
          </Link>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-x-3">
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { userButtonAvatarBox: "h-7 w-7" } }}
            />
            <span className="text-sm text-muted-foreground">アカウント</span>
          </div>
        </SignedIn>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={STAMP_BOOK_HREF}
        aria-label="スタンプ帳"
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Stamp className="h-4 w-4" aria-hidden />
        スタンプ帳
      </Link>
      <SignedOut>
        <Link
          href="/sign-in"
          className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
        >
          ログイン
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { userButtonAvatarBox: "h-7 w-7" } }}
        />
      </SignedIn>
    </div>
  );
}
