"use client";

import { useState } from "react";
import { Check, Copy, Link2, Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatStampDate } from "@/lib/stamps";
import { createStampInviteAction } from "@/utils/actions/stamp-friends";

/**
 * 旅仲間を招待するリンクを作って渡すボタン。/stamps と /stamps/together に出る。
 *
 * 相手を検索してつなぐ口は無い(理由は schema.prisma の StampInvite)。
 * リンクを作り、LINE などで直接送ってもらう。
 *
 * 作ったリンクは1人ぶんで、使われた時点で消える。DB には値のハッシュしか
 * 残らないので、この画面を閉じると同じリンクは二度と出せない。見失ったら
 * もう1本作ればよく、そのためのボタンを常に出しておく。
 */

/** 送る文面。リンクだけ送ると、受け取った人が何のリンクか分からない。 */
function inviteMessage(url: string): string {
  return `ジャスト・ロンドンのスタンプ帳をつなぎませんか。お互いが行った場所を重ねて、まだ誰も行っていない場所を一覧にできます。\n${url}`;
}

export default function InviteLinkButton({
  className,
}: {
  className?: string;
}) {
  const { toast } = useToast();
  const [invite, setInvite] = useState<{ url: string; expiresAt: string } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const result = await createStampInviteAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInvite({
        url: `${window.location.origin}${result.path}`,
        expiresAt: result.expiresAt,
      });
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopied(true);
      toast({ description: "招待リンクをコピーしました。" });
    } catch {
      // 権限が無い・http で開いているなど。欄を選んで手でコピーしてもらう。
      toast({ description: "コピーできませんでした。リンクを長押しして選んでください。" });
    }
  };

  const share = async () => {
    if (!invite) return;
    try {
      await navigator.share({ text: inviteMessage(invite.url) });
    } catch {
      // 共有シートを閉じただけでも例外になる。何もしない。
    }
  };

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className={className}>
      {invite ? (
        <div className="space-y-3 rounded-xl border border-rose-500/40 bg-rose-500/5 p-4">
          <p className="text-sm font-semibold">
            このリンクを、つなぎたい相手に送ってください
          </p>
          <input
            readOnly
            value={invite.url}
            aria-label="招待リンク"
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void copy()}>
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied ? "コピーしました" : "コピー"}
            </Button>
            <Button type="button" size="sm" variant="outline" asChild>
              <a
                href={`https://line.me/R/share?text=${encodeURIComponent(inviteMessage(invite.url))}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LINEで送る
              </a>
            </Button>
            {canShare && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void share()}
              >
                <Share2 aria-hidden />
                ほかのアプリで送る
              </Button>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            1本のリンクでつながれるのは1人だけです。
            {formatStampDate(invite.expiresAt)}まで使えます。
            ほかの人も招待するときは、もう1本作ってください。
          </p>
          <button
            type="button"
            onClick={() => void create()}
            disabled={busy}
            className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-50 dark:text-rose-400"
          >
            {busy ? "作っています…" : "もう1本作る"}
          </button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => void create()}
          disabled={busy}
          className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
        >
          {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Link2 aria-hidden />}
          招待リンクを作る
        </Button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
