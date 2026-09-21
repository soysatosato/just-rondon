"use client";

import { SignIn, SignUp, UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";

/**
 * Clerk のログイン・登録・アカウント管理カード。
 *
 * ダークモードの色を Clerk 側に渡すためだけのラッパー。Clerk の既定は
 * 白いカードで、サイトが黒のときに画面の真ん中だけ白く光る。
 * 「別のサービスに飛ばされた」と読まれるのが一番まずいので、
 * 背景と文字色はサイトの globals.css と同じ値を渡して合わせる。
 *
 * @clerk/themes の baseTheme を入れていないのは、依存を1つ増やして
 * 得られるのがこの数行と同じ結果でしかないため。色の数値が増えたら
 * そのとき入れ替えればよい。
 */

/** globals.css の .dark と同じ値(HSL を16進に直したもの)。 */
const DARK_VARIABLES = {
  colorBackground: "#0a0a0a",
  colorInputBackground: "#171717",
  colorText: "#fafafa",
  colorInputText: "#fafafa",
  colorTextSecondary: "#a3a3a3",
} as const;

/** ボタンとリンクの色。スタンプと同じ rose-600 に揃える。 */
const BRAND = { colorPrimary: "#e11d48" } as const;

/**
 * アカウント管理(UserProfile)で隠す欄。
 *
 * - profile: 顔写真と氏名の欄。サイトは写真も本名も使わない方針で、
 *   ここに出るのは Google/LINE でログインしたときに Clerk に入ってきたもの。
 *   読者の名前は /account のユーザーネーム欄で変える。
 * - danger: Clerk の「アカウントを削除」。Clerk 側しか消えず、スタンプが
 *   DB に残る。退会は /account の自前の欄から(deleteAccountAction)。
 *   Clerk の Account Portal にも同じボタンがあるので、ダッシュボードでも
 *   本人による削除は切っておくこと。
 */
const ACCOUNT_HIDDEN_ELEMENTS = {
  profileSection__profile: { display: "none" },
  profileSection__danger: { display: "none" },
} as const;

/**
 * サイトの色に合わせた Clerk の見た目。
 *
 * カードのほか、openSignIn() で開くモーダル(StampButton)にも渡す。
 * モーダルはこのカードの外で開くので、渡さないとそこだけ白くなる。
 */
export function useAuthAppearance() {
  const { resolvedTheme } = useTheme();
  return {
    variables:
      resolvedTheme === "dark" ? { ...BRAND, ...DARK_VARIABLES } : BRAND,
    elements: {
      // Clerk のカードに自前の枠を付けない。影だけで浮かせる。
      cardBox: "shadow-sm",
      // Clerk のカードは画面幅によらず左右 2.5rem の内余白を取る。
      // 幅 375px の端末では、サイトの余白と合わせて入力欄が 255px まで
      // 詰まるので、モバイルだけ半分にする。Clerk のスタイルは head の
      // 先頭に入るので、同じ強さのクラスなら Tailwind 側が勝つ。
      card: "max-sm:px-5",
    },
  };
}

export default function AuthCard({
  mode,
}: {
  mode: "sign-in" | "sign-up" | "account";
}) {
  const appearance = useAuthAppearance();

  if (mode === "sign-in") return <SignIn appearance={appearance} />;
  if (mode === "sign-up") return <SignUp appearance={appearance} />;
  return (
    <UserProfile
      appearance={{
        ...appearance,
        elements: { ...appearance.elements, ...ACCOUNT_HIDDEN_ELEMENTS },
      }}
    />
  );
}
