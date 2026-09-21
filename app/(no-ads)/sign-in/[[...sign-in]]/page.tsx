import AuthCard from "@/components/stamps/AuthCard";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("ログイン");

/**
 * ログイン画面。
 *
 * 入れ子のセグメント([[...sign-in]])にしてあるのは、Clerk が
 * メール確認コードやパスワード再設定を /sign-in/factor-one のような
 * 子URLで出すため。ここを固定パスにすると、確認コードの画面で 404 になる。
 */
export default function SignInPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-8 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">ログイン</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          行った観光スポット・美術館・観たミュージカルにスタンプを押して、
          自分のスタンプ帳に残せます。記事を読むのにログインは要りません。
        </p>
      </div>
      <AuthCard mode="sign-in" />
    </section>
  );
}
