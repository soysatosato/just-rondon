"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteAccountAction } from "@/utils/actions/account";

/**
 * /account の退会欄。
 *
 * Clerk の画面にある削除ボタンは隠してあり(AuthCard)、退会はここからだけ。
 * 理由は deleteAccountAction に書いた。
 *
 * 元に戻せない操作なので2回押させるが、ダイアログは重ねず、同じ場所で
 * 「本当に削除しますか」に切り替える。
 */
export default function DeleteAccountSection() {
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await deleteAccountAction();
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
      setBusy(false);
      return;
    }

    // アカウントはもう無い。手元のログイン状態を片付けてトップへ戻す。
    // セッションもアカウントと一緒に消えているので signOut が失敗しうる。
    // そのときはページごと読み直し、Clerk に状態を取り直させる。
    try {
      await signOut({ redirectUrl: "/" });
    } catch {
      window.location.assign("/");
    }
  };

  return (
    <section
      aria-labelledby="delete-account-heading"
      className="rounded-xl border border-red-200 p-5 dark:border-red-900/60 sm:p-6"
    >
      <h2 id="delete-account-heading" className="text-base font-semibold">
        アカウントを削除
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        スタンプ帳も含めて、このアカウントの記録がすべて消えます。元には戻せません。
      </p>

      {confirming ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <p className="mr-2 text-sm font-semibold text-red-600 dark:text-red-400">
            本当に削除しますか?
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => void remove()}
          >
            {busy && <Loader2 className="animate-spin" aria-hidden />}
            削除する
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => setConfirming(false)}
          >
            やめる
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-5 text-red-600 hover:text-red-700 dark:text-red-400"
          onClick={() => setConfirming(true)}
        >
          アカウントを削除
        </Button>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
