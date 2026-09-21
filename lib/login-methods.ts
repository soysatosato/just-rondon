/**
 * /account の「ログイン方法」欄に出す中身。
 *
 * サーバー(currentUser)とブラウザ(useUser)の両方から同じ形に直す。
 * サーバーで作った値は最初の描画に使い、Clerk の読み込みが終わったら
 * ブラウザ側の値に切り替える。こうすると読み込みを待つ間に欄が空に
 * ならず、メールアドレスを変えた直後にも新しい値が出る。
 *
 * ログインはメールアドレスに届く確認コードか、Google・LINE の連携で
 * する。パスワードは新しく作らせない(Clerk のダッシュボードで切ってある)。
 * ただし切る前に登録した人のパスワードは Clerk が残し、そのまま使えるので、
 * 持っているかどうかだけは見る。
 */

/** Google・LINE などの連携。 */
export type LinkedAccount = {
  /** "google" や "line"。 */
  provider: string;
  /** 連携先のアカウントのメールアドレス。LINE は渡してこないことがある。 */
  email: string | null;
};

export type LoginMethods = {
  /**
   * ログインの確認コードが届くアドレス。1人1つ。
   * LINE だけで登録した人には無いことがある。
   */
  email: string | null;
  accounts: LinkedAccount[];
  /** パスワードを切る前に登録した人は true のことがある。 */
  hasPassword: boolean;
};

/** Clerk のユーザー。サーバー側とブラウザ側で型が別なので、使う所だけ書く。 */
type ClerkUserLike = {
  passwordEnabled: boolean;
  primaryEmailAddress: { emailAddress: string } | null;
  externalAccounts: {
    provider: string;
    emailAddress: string;
    verification: { status: string | null } | null;
  }[];
};

export function toLoginMethods(user: ClerkUserLike): LoginMethods {
  return {
    email: user.primaryEmailAddress?.emailAddress ?? null,
    accounts: user.externalAccounts
      // 連携の途中でやめたものはログインに使えないので出さない。
      .filter((account) => account.verification?.status === "verified")
      .map((account) => ({
        // サーバー側の API は "oauth_google" の形で返すので、
        // ブラウザ側の "google" に揃える。
        provider: account.provider.replace(/^oauth_/, ""),
        email: account.emailAddress || null,
      })),
    hasPassword: user.passwordEnabled,
  };
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  line: "LINE",
};

export function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}
