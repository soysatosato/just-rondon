"use client";

import { useClerk } from "@clerk/nextjs";
import { AlertTriangle, CloudCheck, CloudOff, Loader2 } from "lucide-react";

import { useAuthAppearance } from "@/components/stamps/AuthCard";
import { retryPlanSync, usePlanSyncStatus } from "./plan-sync";

/**
 * プランがどこに保存されているかの1行。/plan の日割りの上に出る。
 *
 * ログインしていない読者には「このブラウザにだけある」ことと、ログインすれば
 * 別の端末でも開けることを出す。プランを組み終えてから知るより、組んでいる
 * 途中で知るほうが、旅先のスマホに持ち出す手段を選べる。
 *
 * 食い違い(conflict)はここでは出さない。どちらを残すかを選ぶ大きな
 * 枠が PlanBuilder の先頭に出る。
 */
export default function PlanSyncStatus({ hasPlan }: { hasPlan: boolean }) {
  const status = usePlanSyncStatus();
  const { openSignIn } = useClerk();
  const authAppearance = useAuthAppearance();

  if (status.kind === "pending" || status.kind === "conflict") return null;

  // 空のプランについて保存先を言っても意味が無い。ただ、別の端末で組んだ
  // プランを読みに行っている間だけは、空の画面が答えではないことを出す。
  if (!hasPlan && status.kind !== "loading") return null;

  if (status.kind === "off") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-dashed border-indigo-200 px-4 py-3 print:hidden dark:border-indigo-900/60">
        <p className="flex min-w-0 flex-1 items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            このプランはこのブラウザにだけ保存されています。ログインすると
            アカウントにも保存され、パソコンで組んだ旅程を旅先のスマホで開けます。
          </span>
        </p>
        <button
          type="button"
          onClick={() =>
            // Google・LINE で登録した人もこの画面へ戻す。戻ってきた時点で
            // 手元のプランがアカウントへ送られる(plan-sync.ts)。
            openSignIn({
              forceRedirectUrl: "/plan",
              signUpForceRedirectUrl: "/plan",
              appearance: authAppearance,
            })
          }
          className="shrink-0 rounded-full border border-indigo-300 bg-background px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-500 dark:border-indigo-800 dark:text-indigo-300"
        >
          ログインして保存する
        </button>
      </div>
    );
  }

  if (status.kind === "error") {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs print:hidden">
        <p className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          アカウントに保存できませんでした。このブラウザには残っています。
        </p>
        <button
          type="button"
          onClick={retryPlanSync}
          className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400"
        >
          もう一度試す
        </button>
      </div>
    );
  }

  const busy = status.kind === "loading" || status.kind === "saving";
  const label =
    status.kind === "loading"
      ? "アカウントに保存したプランを確かめています…"
      : status.kind === "saving"
        ? "アカウントに保存しています…"
        : "アカウントに保存済み。ほかの端末でも、ログインすれば同じプランが開きます。";

  return (
    <p
      // 保存のたびに読み上げると、並べ替えのたびに割り込む。黙って変える。
      className="flex items-center gap-1.5 text-xs text-muted-foreground print:hidden"
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
      ) : (
        <CloudCheck
          className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          aria-hidden
        />
      )}
      {label}
    </p>
  );
}
