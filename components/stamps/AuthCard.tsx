"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";

/**
 * Clerk のログイン・登録カード。
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
  // ソーシャルボタンの枠線・カードの影が拠り所にする色。指定しないと
  // Clerk が colorBackground から自動算出し、黒背景では枠が実質消えて
  // ボタンが文字だけ浮いた見た目になる(globals.css の --border と同じ値)。
  colorNeutral: "#262626",
} as const;

/** ボタンとリンクの色。スタンプと同じ rose-600 に揃える。 */
const BRAND = { colorPrimary: "#e11d48" } as const;

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

export default function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const appearance = useAuthAppearance();

  return mode === "sign-in" ? (
    <SignIn appearance={appearance} />
  ) : (
    <SignUp appearance={appearance} />
  );
}
