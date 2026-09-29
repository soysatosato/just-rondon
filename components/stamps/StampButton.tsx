"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Loader2, MapPin, Stamp } from "lucide-react";

import { useAuthAppearance } from "@/components/stamps/AuthCard";
import StampCelebration, {
  type StampCelebrationData,
} from "@/components/stamps/StampCelebration";
import StampImpression, {
  StampSlot,
  type StampArt,
} from "@/components/stamps/StampImpression";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { StampPressProgress } from "@/lib/stamp-rallies";
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
 * 押す前は空いた判の枠を、押したあとはその場所の判そのものを左に置く。
 * ページそのものにスタンプが押された見た目になり、押した直後は
 * 判が落ちてくる画面(StampCelebration)で進み具合を見せる。
 *
 * 押し方は2つ。ただのタップと、位置情報を付けた「現地で押す」。
 * 後者は施設から lib/stamps.ts の ON_SITE_RADIUS_KM 以内でだけ金になる。
 * 判定はサーバー側でやるので、ここは座標を送るだけ。
 */

type StampState = {
  stamped: boolean;
  onSite: boolean;
  stampedAt: string | null;
  /** Stamp.id。判の傾きをスタンプ帳と揃えるのに使う。 */
  stampId: string | null;
};

const UNSTAMPED: StampState = {
  stamped: false,
  onSite: false,
  stampedAt: null,
  stampId: null,
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

/** 押せた瞬間の小さな振動。対応していない端末(iPhone など)では何もしない。 */
function thud() {
  try {
    if ("vibrate" in navigator) navigator.vibrate(12);
  } catch {
    // 振動は飾り。失敗しても押した結果は変わらない。
  }
}

export default function StampButton({
  type,
  id,
  name,
  engName,
  category = null,
}: {
  type: StampType;
  /** 対象の id(uuid)。slug ではないので、URLを変えてもスタンプは外れない。 */
  id: string;
  name: string;
  /** 判の外周に彫る英語名。 */
  engName: string;
  /** Attraction.category。判の中央の絵を選ぶ。 */
  category?: string | null;
}) {
  const meta = STAMP_META[type];
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const authAppearance = useAuthAppearance();
  const pathname = usePathname();
  const { toast } = useToast();

  const [state, setState] = useState<StampState | null>(null);
  const [busy, setBusy] = useState<null | "tap" | "onsite" | "remove">(null);
  const [celebration, setCelebration] = useState<StampCelebrationData | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  /** このページで押したか。押した判にだけ、落ちてくる動きを付ける。 */
  const [pressedHere, setPressedHere] = useState(false);

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

  const artFor = useCallback(
    (s: StampState): StampArt => ({
      type,
      engName,
      category,
      stampedAt: s.stampedAt ?? new Date().toISOString(),
      onSite: s.onSite,
      seed: s.stampId ?? `${type}:${id}`,
    }),
    [category, engName, id, type],
  );

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
          created?: boolean;
          upgraded?: boolean;
          outOfRange?: boolean;
          progress?: StampPressProgress | null;
        };
        writes.current += 1;
        const next: StampState = {
          stamped: data.stamped,
          onSite: data.onSite,
          stampedAt: data.stampedAt,
          stampId: data.stampId ?? null,
        };
        setState(next);

        if (data.created || data.upgraded) {
          setPressedHere(true);
          setCelebration({
            id: Date.now(),
            art: artFor(next),
            name,
            change: data.upgraded ? "upgraded" : "created",
            outOfRange: Boolean(data.outOfRange),
            progress: data.progress ?? null,
          });
          setCelebrating(true);
          thud();
        } else if (data.outOfRange) {
          toast({
            title: "現地判定にはなりませんでした",
            description: `${name}から離れた場所のようです。現地で押し直すと金になります。`,
          });
        } else {
          toast({ description: `${name}はスタンプ帳に記録済みです。` });
        }
      } catch {
        toast({
          description: "通信に失敗しました。接続を確かめて試してください。",
        });
      } finally {
        setBusy(null);
      }
    },
    [artFor, id, name, toast, type],
  );

  // 押した状態を読む。未ログインなら押していない状態として描く。
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setState(UNSTAMPED);
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
          stampId: data.stampId ?? null,
        });
      })
      .catch(() => {
        // 読めなければ「押していない」として出す。押せば正しい状態に揃う。
        if (alive && writes.current === seen) setState(UNSTAMPED);
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
        setState(UNSTAMPED);
        setPressedHere(false);
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
  const disabled = loading || busy !== null;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 rounded-2xl border p-3 pr-4 transition-colors sm:gap-5 sm:p-4",
          stamped
            ? onSite
              ? "border-amber-300/80 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-950/15"
              : "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/15"
            : "border-dashed border-rose-200 dark:border-rose-900/50",
        )}
      >
        <div className="w-[4.5rem] shrink-0 sm:w-20">
          {stamped && state ? (
            <StampImpression
              // 赤から金に上がったときも、押し直した判として落とし直す。
              key={`${state.stampId}-${onSite}`}
              art={artFor(state)}
              pressing={pressedHere}
              label={`${name}のスタンプ`}
            />
          ) : (
            // 空いた判の枠も押せるようにする。読み上げと Tab 移動は
            // 隣の「スタンプを押す」ボタンに任せる。
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => handlePress(false)}
              disabled={disabled}
              className="group block w-full disabled:cursor-default"
            >
              <StampSlot
                type={type}
                engName={engName}
                category={category}
                className="text-rose-200 transition group-hover:scale-105 group-hover:text-rose-400 group-disabled:group-hover:scale-100 dark:text-rose-900 dark:group-hover:text-rose-600"
              />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
            Stamp Book
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {stamped
              ? `${onSite ? meta.onSiteLabel : meta.doneLabel}${
                  state?.stampedAt ? `・${formatStampDate(state.stampedAt)}` : ""
                }`
              : meta.invite}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            {!stamped && (
              <button
                type="button"
                onClick={() => handlePress(false)}
                disabled={disabled}
                aria-label={`${name}に${meta.actionLabel}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-600/25 transition hover:bg-rose-700 active:scale-95 disabled:opacity-60 disabled:active:scale-100"
              >
                {busy === "tap" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Stamp className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {meta.actionLabel}
              </button>
            )}

            {/*
              現地で押すボタン。まだ金でない間だけ出す。押してある赤いスタンプも
              ここから金に上げられるので、旅行前に押した人の行き先にもなる。
            */}
            {!onSite && (
              <button
                type="button"
                onClick={() => handlePress(true)}
                disabled={disabled}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-500/70 bg-background px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 active:scale-95 disabled:opacity-60 disabled:active:scale-100 dark:text-amber-400 dark:hover:bg-amber-500/10"
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
                  className="text-xs font-semibold text-rose-600 underline-offset-2 hover:underline dark:text-rose-400"
                >
                  スタンプ帳を見る
                </Link>
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy !== null}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-60"
                >
                  取り消す
                </button>
              </>
            )}
          </div>

          {/* 押す前だけ、押すと何が起きるかを1行で添える。読み込み中も行の高さは取っておく。 */}
          {!stamped && (
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {!isLoaded
                ? " "
                : isSignedIn
                  ? "現地で押すと、金のスタンプになります"
                  : "ログインするとスタンプ帳に記録できます"}
            </p>
          )}
        </div>
      </div>

      <StampCelebration
        data={celebration}
        open={celebrating}
        onOpenChange={setCelebrating}
      />
    </>
  );
}
