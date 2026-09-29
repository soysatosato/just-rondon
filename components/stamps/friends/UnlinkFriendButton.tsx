"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { unlinkStampFriendAction } from "@/utils/actions/stamp-friends";

/**
 * 旅仲間とのつながりを解除するボタン。/stamps/together の下にある一覧で使う。
 *
 * 押し間違いで切れると、相手に招待リンクを作り直してもらうしかない。
 * だから1回目は「解除しますか」に切り替えるだけにして、2回目で解除する
 * (アカウント削除と同じ2段階)。
 *
 * 解除は相手に通知しない。相手のページからも、次に開いたときに消えている。
 */
export default function UnlinkFriendButton({
  friendId,
  username,
}: {
  friendId: string;
  username: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlink = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await unlinkStampFriendAction(friendId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
    } finally {
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-muted-foreground hover:text-destructive hover:underline"
      >
        解除
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
      <span className="text-muted-foreground">
        {username} とのつながりを解除しますか?
      </span>
      <button
        type="button"
        onClick={() => void unlink()}
        disabled={busy}
        className="inline-flex items-center gap-1 font-semibold text-destructive hover:underline disabled:opacity-50"
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
        解除する
      </button>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
        disabled={busy}
        className="text-muted-foreground hover:underline"
      >
        やめる
      </button>
      {error && (
        <span role="alert" className="basis-full text-right text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
