"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Check, Loader2, MapPin, Sparkles, Stamp } from "lucide-react";

import { useAuthAppearance } from "@/components/stamps/AuthCard";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  formatStampDate,
  STAMP_BOOK_HREF,
  STAMP_META,
  type StampType,
} from "@/lib/stamps";

/**
 * 「スタンプを押す」ボタン。観光スポット・美術館・ミュージカルの詳細ページに出る。
 *
 * -------------------------------------------------------------------
 * なぜ状態をサーバーから受け取らないのか
 *
 * 詳細ページは ISR でキャッシュされ、同じHTMLが全員に配られる。
 * 「押した/押していない」を props で渡すと、最初に開いた人の状態が
 * キャッシュに焼き付いて他人に配られることになる。だから押した状態は
 * 描画後に /api/stamps へ問い合わせて自分で持つ。
 *
 * 読み込み中もボタンの形と大きさは変えない。押せるようになるまでの
 * ちらつきは、押したつもりが押せていない事故に直結する。
 * -------------------------------------------------------------------
 *
 * 押し方は2つ。ただのタップと、位置情報を付けた「現地で押す」。
 * 後者は施設から lib/stamps.ts の ON_SITE_RADIUS_KM 以内でだけ金になる。
 * 判定はサーバー側でやるので、ここは座標を送るだけ。
 */

type StampState = {
  stamped: boolean;
  onSite: boolean;
  stampedAt: string | null;
};

/** 押そうとしてログインに飛んだ人の「押しかけ」を覚えておく鍵。 */
const PENDING_KEY = "just-rondon-stamp-pending";

function readPending(): string | null {
  try {
    return sessionStorage.getItem(PENDING_KEY);
  } catch {
    // プライベートモードなどで読めないことがある。押し直してもらえばよい。
    return null;
  }
}

function writePending(value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(PENDING_KEY);
    else sessionStorage.setItem(PENDING_KEY, value);
  } catch {
    // 保存できなくても押す操作自体は成立する。
  }
}

/** 端末の現在地。取れなければ理由を文言にして返す。 */
function getPosition(): Promise<
  | { ok: true; lat: number; lng: number; accuracy: number }
  | { ok: false; message: string }
> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({
        ok: false,
        message: "この端末では位置情報が使えません。通常のスタンプは押せます。",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          ok: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) =>
        resolve({
          ok: false,
          message:
            error.code === error.PERMISSION_DENIED
              ? "位置情報の利用が許可されていません。通常のスタンプは押せます。"
              : "現在地が取れませんでした。屋外でもう一度試すか、通常のスタンプを押してください。",
        }),
      // 屋内では高精度測位に時間がかかる。15秒待って諦める。直前の測位は
      // 1分まで使い回す(同じ館で何度も押すときに毎回待たせない)。
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

export default function StampButton({
  type,
  id,
  name,
}: {
  type: StampType;
  /** 対象の id(uuid)。slug ではないので、URLを変えてもスタンプは外れない。 */
  id: string;
  name: string;
}) {
  const meta = STAMP_META[type];
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const authAppearance = useAuthAppearance();
  const pathname = usePathname();
  const { toast } = useToast();

  const [state, setState] = useState<StampState | null>(null);
  const [busy, setBusy] = useState<null | "tap" | "onsite" | "remove">(null);

  /** 二重に押しかけを消化しないための旗。 */
  const resumed = useRef(false);

  /*
    押した/取り消した回数。読み込み中の GET が、あとから届いて
    押した結果を上書きするのを防ぐために数える。

    ログイン後に押しかけを消化する場面で実際に起きる。初回描画で
    GET と POST が同時に飛び、POST が先に返ると、遅れて届いた
    GET の「まだ押していない」で画面が戻ってしまう。
  */
  const writes = useRef(0);

  const press = useCallback(
    async (withPosition: boolean) => {
      setBusy(withPosition ? "onsite" : "tap");
      try {
        let body: Record<string, unknown> = { type, id };

        if (withPosition) {
          const position = await getPosition();
          if (!position.ok) {
            toast({ description: position.message });
            return;
          }
          body = {
            ...body,
            lat: position.lat,
            lng: position.lng,
            accuracy: position.accuracy,
          };
        }

        const res = await fetch("/api/stamps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          toast({
            description:
              res.status === 401
                ? "ログインするとスタンプを押せます。"
                : "スタンプを押せませんでした。時間をおいて試してください。",
          });
          return;
        }
        const data = (await res.json()) as StampState & {
          upgraded?: boolean;
          outOfRange?: boolean;
        };
        writes.current += 1;
        setState({
          stamped: data.stamped,
          onSite: data.onSite,
          stampedAt: data.stampedAt,
        });

        if (data.outOfRange) {
          toast({
            title: "現地判定にはなりませんでした",
            description: `${name}から離れた場所のようです。スタンプは押せているので、現地で押し直すと金になります。`,
          });
        } else if (data.upgraded) {
          toast({
            title: "金のスタンプになりました",
            description: `${name}で押した記録がスタンプ帳に残ります。`,
          });
        } else {
          toast({
            title: data.onSite
              ? `${meta.onSiteLabel}スタンプを押しました`
              : "スタンプを押しました",
            description: `${name}をスタンプ帳に追加しました。`,
          });
        }
      } catch {
        toast({
          description: "通信に失敗しました。接続を確かめて試してください。",
        });
      } finally {
        setBusy(null);
      }
    },
    [id, meta.onSiteLabel, name, toast, type],
  );

  // 押した状態を読む。未ログインなら押していない状態として描く。
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setState({ stamped: false, onSite: false, stampedAt: null });
      return;
    }
    let alive = true;
    const seen = writes.current;
    fetch(`/api/stamps?type=${type}&id=${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive || !data || writes.current !== seen) return;
        setState({
          stamped: Boolean(data.stamped),
          onSite: Boolean(data.onSite),
          stampedAt: data.stampedAt ?? null,
        });
      })
      .catch(() => {
        // 読めなければ「押していない」として出す。押せば正しい状態に揃う。
        if (alive && writes.current === seen) {
          setState({ stamped: false, onSite: false, stampedAt: null });
        }
      });
    return () => {
      alive = false;
    };
  }, [id, isLoaded, isSignedIn, type]);

  /*
    ログインの前に押しかけていた分を、戻ってきた時点で押す。
    「押す→ログイン→もう一度押す」の2度手間は、1度目を押した記憶が
    残っている人には「反映されていない」と映る。
  */
  useEffect(() => {
    if (!isLoaded || !isSignedIn || resumed.current) return;
    if (readPending() !== `${type}:${id}`) return;
    resumed.current = true;
    writePending(null);
    void press(false);
  }, [id, isLoaded, isSignedIn, press, type]);

  const handlePress = (withPosition: boolean) => {
    if (!isSignedIn) {
      // 位置情報はユーザー操作の直後にしか取れない。ログインを挟むと
      // 許可ダイアログが出せないので、押しかけは通常のスタンプで消化する。
      writePending(`${type}:${id}`);
      // 新規登録(Google/LINE で初めて来た人も含む)でもこのページへ戻す。
      // signUpForceRedirectUrl を渡さないと登録後の既定の行き先(/stamps)に
      // 飛び、押しかけのスタンプはこのページに戻るまで押されない。
      openSignIn({
        forceRedirectUrl: pathname,
        signUpForceRedirectUrl: pathname,
        appearance: authAppearance,
      });
      return;
    }
    void press(withPosition);
  };

  const remove = async () => {
    setBusy("remove");
    try {
      const res = await fetch(
        `/api/stamps?type=${type}&id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        writes.current += 1;
        setState({ stamped: false, onSite: false, stampedAt: null });
        toast({ description: `${name}のスタンプを取り消しました。` });
      }
    } catch {
      toast({ description: "取り消せませんでした。時間をおいて試してください。" });
    } finally {
      setBusy(null);
    }
  };

  const loading = state === null;
  const stamped = state?.stamped ?? false;
  const onSite = state?.onSite ?? false;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 押す前 / 押したあとで同じ位置に出す主ボタン。 */}
      <button
        type="button"
        onClick={() => (stamped ? undefined : handlePress(false))}
        disabled={loading || busy !== null || stamped}
        aria-pressed={stamped}
        aria-label={stamped ? `${name}は${meta.doneLabel}` : `${name}に${meta.actionLabel}`}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition",
          "disabled:cursor-default",
          stamped
            ? onSite
              ? "border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/30"
              : "border-rose-600 bg-rose-600 text-white"
            : "border-border bg-background text-foreground hover:border-rose-400 hover:text-rose-600 disabled:opacity-60 dark:hover:text-rose-400",
        )}
      >
        {busy === "tap" ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : stamped ? (
          onSite ? (
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Check className="h-4 w-4 shrink-0" aria-hidden />
          )
        ) : (
          <Stamp className="h-4 w-4 shrink-0" aria-hidden />
        )}
        {stamped
          ? `${onSite ? meta.onSiteLabel : meta.doneLabel}${
              state?.stampedAt ? `・${formatStampDate(state.stampedAt)}` : ""
            }`
          : meta.actionLabel}
      </button>

      {/*
        現地で押すボタン。まだ金でない間だけ出す。押してある赤いスタンプも
        ここから金に上げられるので、旅行前に押した人の行き先にもなる。
      */}
      {!onSite && (
        <button
          type="button"
          onClick={() => handlePress(true)}
          disabled={loading || busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/70 bg-background px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60 dark:text-amber-400 dark:hover:bg-amber-500/10"
        >
          {busy === "onsite" ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {stamped ? "現地で押して金にする" : "現地で押す"}
        </button>
      )}

      {stamped && (
        <>
          <Link
            href={STAMP_BOOK_HREF}
            className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
          >
            スタンプ帳を見る
          </Link>
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            className="text-xs text-muted-foreground underline hover:text-foreground disabled:opacity-60"
          >
            取り消す
          </button>
        </>
      )}

      {/* 押す前だけ、何のための機能かを1行で添える。 */}
      {!stamped && !loading && (
        <p className="text-xs text-muted-foreground">
          {isSignedIn
            ? "押した記録はスタンプ帳に残ります"
            : "ログインするとスタンプ帳に記録できます"}
        </p>
      )}
    </div>
  );
}
