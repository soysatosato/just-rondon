"use client";

import { useEffect, useState } from "react";
import { BookOpen, Check, Copy, ExternalLink, Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  publishShioriAction,
  regenerateShioriAction,
  unpublishShioriAction,
} from "@/utils/actions/stamp-share";

/**
 * 旅のしおりのリンクを作って渡す欄。/stamps の ShioriShareCard の中に出る。
 *
 * 招待リンク(InviteLinkButton)と違い、リンクは1人1本で何度でも使える。
 * 値を DB に持っているので、あとから開いても同じリンクが出る。
 * 渡した相手に見せるのをやめたいときは、作り直す(前のリンクが開けなくなる)か、
 * 公開をやめる。どちらも押し間違えると渡した全員のリンクが切れるので、
 * 1回目は確かめるだけにして2回目で実行する。
 */

/** 送る文面。リンクだけ送ると、受け取った人が何のリンクか分からない。 */
function shareMessage(url: string): string {
  return `ロンドンで行った場所を、旅のしおりにまとめました。行く前に見てみてください。\n${url}`;
}

type Pending = "publish" | "regenerate" | "unpublish" | null;

export default function ShioriLinkPanel({
  initialPath,
  canPublish,
}: {
  /** 公開中のしおりのパス。公開していなければ null。 */
  initialPath: string | null;
  /** まだスタンプが1個も無い人には作らせない。空のしおりを渡しても仕方がない。 */
  canPublish: boolean;
}) {
  const { toast } = useToast();
  const [path, setPath] = useState(initialPath);
  // オリジンはブラウザで足す(サーバーアクションがパスしか返さない理由と同じ)。
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState<Pending>(null);
  const [confirming, setConfirming] = useState<"regenerate" | "unpublish" | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  const url = path && origin ? `${origin}${path}` : null;

  const run = async (kind: Exclude<Pending, null>) => {
    setBusy(kind);
    setError(null);
    setCopied(false);
    try {
      if (kind === "unpublish") {
        const result = await unpublishShioriAction();
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setPath(null);
        toast({ description: "しおりの公開をやめました。" });
      } else {
        const result =
          kind === "publish"
            ? await publishShioriAction()
            : await regenerateShioriAction();
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setPath(result.path);
        if (kind === "regenerate") {
          toast({ description: "新しいリンクを作りました。前のリンクはもう開けません。" });
        }
      }
      setConfirming(null);
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ description: "しおりのリンクをコピーしました。" });
    } catch {
      // 権限が無い・http で開いているなど。欄を選んで手でコピーしてもらう。
      toast({ description: "コピーできませんでした。リンクを長押しして選んでください。" });
    }
  };

  const share = async () => {
    if (!url) return;
    try {
      await navigator.share({ text: shareMessage(url) });
    } catch {
      // 共有シートを閉じただけでも例外になる。何もしない。
    }
  };

  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  if (!path) {
    return (
      <div>
        <Button
          type="button"
          onClick={() => void run("publish")}
          disabled={!canPublish || busy !== null}
          className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
        >
          {busy === "publish" ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <BookOpen aria-hidden />
          )}
          しおりのリンクを作る
        </Button>
        {!canPublish && (
          <p className="mt-2 text-xs text-muted-foreground">
            スタンプを1個押すと作れます。
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        readOnly
        value={url ?? path}
        aria-label="旅のしおりのリンク"
        onFocus={(event) => event.currentTarget.select()}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => void copy()} disabled={!url}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "コピーしました" : "コピー"}
        </Button>
        <Button type="button" size="sm" variant="outline" asChild>
          <a
            href={
              url
                ? `https://line.me/R/share?text=${encodeURIComponent(shareMessage(url))}`
                : undefined
            }
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
            disabled={!url}
          >
            <Share2 aria-hidden />
            ほかのアプリで送る
          </Button>
        )}
        <Button type="button" size="sm" variant="ghost" asChild>
          <a href={path} target="_blank" rel="noopener">
            <ExternalLink aria-hidden />
            しおりを見る
          </a>
        </Button>
      </div>

      {confirming ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-muted-foreground">
            {confirming === "regenerate"
              ? "作り直すと、いままで渡したリンクは開けなくなります。"
              : "公開をやめると、渡したリンクは開けなくなります。"}
          </span>
          <button
            type="button"
            onClick={() => void run(confirming)}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 font-semibold text-destructive hover:underline disabled:opacity-50"
          >
            {busy === confirming && (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            )}
            {confirming === "regenerate" ? "作り直す" : "公開をやめる"}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(null);
              setError(null);
            }}
            disabled={busy !== null}
            className="text-muted-foreground hover:underline"
          >
            やめる
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <button
            type="button"
            onClick={() => setConfirming("regenerate")}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            リンクを作り直す
          </button>
          <button
            type="button"
            onClick={() => setConfirming("unpublish")}
            className="text-muted-foreground hover:text-destructive hover:underline"
          >
            公開をやめる
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
