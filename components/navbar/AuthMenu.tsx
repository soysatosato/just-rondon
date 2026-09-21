"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton, useClerk } from "@clerk/nextjs";
import { Stamp, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STAMP_BOOK_HREF } from "@/lib/stamps";

/**
 * ナビゲーションのログイン部分。
 *
 * スタンプ帳へのリンクは、ログインしていてもいなくても常に出す。
 * 未ログインの人が押すと /stamps が「何が貯まるのか」を説明するので、
 * ログイン前の人にこそ見せる必要がある。
 *
 * ログインしている人には、顔写真も名前も出さない。Clerk の UserButton は
 * Google/LINE の顔写真を丸く出し、開くと氏名とメールアドレスを並べるので
 * 使っていない。ユーザーネームも出さないのは、ヘッダーが記事ページごと
 * キャッシュされた共通のHTMLで、名前を出すには描画後に取りに行く必要が
 * あるのと、名前の長さでヘッダーの幅が揺れるため。名前は /stamps と
 * /account で出す。
 *
 * デスクトップでログイン状態が要るのはアカウントのボタンとログインリンクだけ。
 * Clerk の読み込みが終わるまでこの2つは何も描かれないので、幅の変わるものを
 * ここに増やさないこと——ヘッダーがずれる。
 *
 * モバイルはメニューがモーダルのシート(Radix Dialog)の中にあるので、
 * 普通のリンクとボタンとして並べる。シートは開いている間 body の
 * pointer-events を切ってフォーカスも閉じ込めるため、Clerk の UserButton や
 * モーダルのように body 直下へ描かれる部品は、開きはしても押せない。
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
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-red-600 transition"
            onClick={onNavigate}
          >
            アカウント設定
          </Link>
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="text-left text-sm text-muted-foreground hover:text-red-600 transition"
              onClick={onNavigate}
            >
              ログアウト
            </button>
          </SignOutButton>
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
        <AccountDropdown />
      </SignedIn>
    </div>
  );
}

/** デスクトップのアカウントメニュー。人型のアイコンから開く。 */
function AccountDropdown() {
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="アカウント"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <UserRound className="h-4 w-4" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href="/account">アカウント設定</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut({ redirectUrl: "/" })}>
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
