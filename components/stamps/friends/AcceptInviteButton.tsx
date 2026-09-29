"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { togetherHref } from "@/lib/stamp-friends-shared";
import { acceptStampInviteAction } from "@/utils/actions/stamp-friends";

/**
 * 招待リンクのページ(/stamps/invite/[token])の「つなぐ」ボタン。
 *
 * 開いただけではつながらず、このボタンを押して初めてつながる。LINE などは
 * 送られたリンクのプレビューを作るために URL を先に開きに来るので、
 * 開いた時点でつなぐ作りにすると、プレビューがリンクを使い切ってしまう。
 */
export default function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await acceptStampInviteAction(token);
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }
      // 遷移が終わるまでボタンは押せないままにしておく。
      router.push(togetherHref([result.friendId]));
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
      setBusy(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        onClick={() => void accept()}
        disabled={busy}
        className="rounded-full bg-rose-600 px-6 text-white hover:bg-rose-700"
      >
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Users aria-hidden />}
        スタンプ帳をつなぐ
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
