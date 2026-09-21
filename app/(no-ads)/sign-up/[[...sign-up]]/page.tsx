import AuthCard from "@/components/stamps/AuthCard";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("アカウント登録");

/** アカウント登録。子URLが生える理由は /sign-in と同じ。 */
export default function SignUpPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-8 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">アカウント登録</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          スタンプ帳を作るためだけのアカウントです。
          行った場所の記録が端末を変えても残ります。
        </p>
      </div>
      <AuthCard mode="sign-up" />
    </section>
  );
}
