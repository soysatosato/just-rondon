import { auth, currentUser } from "@clerk/nextjs/server";

import DeleteAccountSection from "@/components/account/DeleteAccountSection";
import LoginMethodsSection from "@/components/account/LoginMethodsSection";
import UsernameSection from "@/components/account/UsernameSection";
import { toLoginMethods } from "@/lib/login-methods";
import { ensureProfile } from "@/lib/profile";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("アカウント設定");

/**
 * アカウント設定。上から、ユーザーネーム・ログイン方法・退会。
 *
 * どれも自前の欄で、Clerk の UserProfile は使わない。UserProfile は
 * メールアドレスを「追加」する作りで、パスワード・アクティブなデバイス・
 * 顔写真と氏名の欄も並ぶ。このサイトに要らない欄を CSS で隠していくより、
 * 要る欄だけ作るほうが少なくて済む。タブ付きの2段組みはモバイルでも
 * 窮屈だった。
 *
 * デスクトップでもモバイルでも、ここへは普通のリンクで来る。Clerk の
 * モーダルはモバイルのメニュー(シート)の中では押せない(理由は AuthMenu)。
 */
export default async function AccountPage() {
  const { userId, redirectToSignIn } = auth();

  // リンクはログイン中の人にしか出さないので、未ログインで来るのは
  // ログアウト後に「戻る」を押したときくらい。ログインしたらここに戻す。
  if (!userId) return redirectToSignIn();

  const [profile, user] = await Promise.all([
    ensureProfile(userId),
    currentUser(),
  ]);
  if (!user) return redirectToSignIn();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-10">
      <h1 className="text-2xl font-semibold">アカウント設定</h1>

      <UsernameSection initialUsername={profile.username} />

      <LoginMethodsSection initial={toLoginMethods(user)} />

      <DeleteAccountSection />
    </div>
  );
}
