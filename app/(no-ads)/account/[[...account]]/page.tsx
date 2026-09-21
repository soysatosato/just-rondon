import { auth } from "@clerk/nextjs/server";

import AuthCard from "@/components/stamps/AuthCard";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("アカウント管理");

/**
 * アカウント管理(メールアドレス・パスワード・連携アカウントの変更)。
 *
 * デスクトップでは UserButton のモーダルで足りるが、モバイルのメニューは
 * モーダルのシートの中にあり、Clerk のモーダルを重ねると押せなくなる
 * (理由は AuthMenu に書いた)。シートからは普通のリンクでここへ来る。
 *
 * 入れ子のセグメントにしてあるのは、Clerk が /account/security のような
 * 子URLで各タブを出すため。理由は /sign-in と同じ。
 */
export default function AccountPage() {
  const { userId, redirectToSignIn } = auth();

  // リンクはログイン中の人にしか出さないので、未ログインで来るのは
  // ログアウト後に「戻る」を押したときくらい。ログインしたらここに戻す。
  if (!userId) return redirectToSignIn();

  return (
    <section className="flex flex-col items-center gap-8 py-10">
      <h1 className="text-2xl font-semibold">アカウント管理</h1>
      <AuthCard mode="account" />
    </section>
  );
}
