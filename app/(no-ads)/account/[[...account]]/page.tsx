import { auth } from "@clerk/nextjs/server";

import DeleteAccountSection from "@/components/account/DeleteAccountSection";
import UsernameSection from "@/components/account/UsernameSection";
import AuthCard from "@/components/stamps/AuthCard";
import { ensureProfile } from "@/lib/profile";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("アカウント設定");

/**
 * アカウント設定。上から、ユーザーネーム・ログイン情報(Clerk)・退会。
 *
 * ユーザーネームはサイト側の DB(Profile)に持っていて Clerk は知らないので、
 * 自前の欄で変える。メールアドレス・パスワード・Google/LINE との連携は
 * Clerk の UserProfile に任せる。顔写真と氏名の欄、Clerk 側の削除ボタンは
 * 隠してある(理由は AuthCard)。
 *
 * デスクトップでもモバイルでも、ここへは普通のリンクで来る。Clerk の
 * モーダルはモバイルのメニュー(シート)の中では押せない(理由は AuthMenu)。
 *
 * 入れ子のセグメントにしてあるのは、Clerk が /account/security のような
 * 子URLで各タブを出すため。理由は /sign-in と同じ。
 */
export default async function AccountPage() {
  const { userId, redirectToSignIn } = auth();

  // リンクはログイン中の人にしか出さないので、未ログインで来るのは
  // ログアウト後に「戻る」を押したときくらい。ログインしたらここに戻す。
  if (!userId) return redirectToSignIn();

  const profile = await ensureProfile(userId);

  return (
    <div className="mx-auto flex w-full max-w-[55rem] flex-col gap-8 py-10">
      <h1 className="text-2xl font-semibold">アカウント設定</h1>

      <UsernameSection initialUsername={profile.username} />

      <section aria-labelledby="login-heading">
        <h2 id="login-heading" className="text-base font-semibold">
          ログイン情報
        </h2>
        <p className="mb-4 mt-1 text-sm leading-relaxed text-muted-foreground">
          メールアドレス・パスワード・Google や LINE との連携を変えられます。
        </p>
        <AuthCard mode="account" />
      </section>

      <DeleteAccountSection />
    </div>
  );
}
