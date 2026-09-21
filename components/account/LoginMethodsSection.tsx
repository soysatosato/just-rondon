"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { Loader2, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  providerLabel,
  toLoginMethods,
  type LoginMethods,
} from "@/lib/login-methods";

/**
 * /account の「ログイン方法」欄。メールアドレスの変更・登録と、
 * Google・LINE との連携の表示。
 *
 * メールアドレスは1人1つで、「追加」ではなく「変更」として見せる。
 * Clerk には変更の操作が無いので、裏では
 * 追加 → 確認コード → メインに設定 → ほかのアドレスを削除 を続けて行う。
 * 確認が済むまでは今のアドレスのまま。
 *
 * LINE だけで登録した人はアドレスを持っていないことがある(LINE が
 * 渡してこず、登録時にも必須にしていないため)。その人には「未登録」と
 * 登録ボタンを出す。流れは変更と同じで、消す古いアドレスが無いだけ。
 *
 * 連携の追加・解除は置かない。どれか1つでログインできれば足りる。
 */

type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;
type EmailAddress = ClerkUser["emailAddresses"][number];

type Step =
  | { kind: "view" }
  | { kind: "enter" }
  | { kind: "code"; target: EmailAddress };

type Failure = { message: string; signInAgain?: boolean };

/** Clerk のエラーコードごとの言い方。Clerk の文言は英語で返ってくる。 */
const ERROR_MESSAGES: Record<string, string> = {
  form_identifier_exists: "このメールアドレスは別のアカウントで使われています",
  form_param_format_invalid: "メールアドレスの形式が正しくありません",
  form_code_incorrect:
    "コードが違います。届いたメールにある6桁の数字を入れてください",
  verification_expired:
    "コードの有効期限が切れました。「コードを送り直す」を押してください",
  verification_failed:
    "間違いが続いたため、このコードは使えなくなりました。「コードを送り直す」を押してください",
  too_many_requests: "操作が続いたため、少し時間をおいてからお試しください",
};

/**
 * Clerk の設定で「大事な操作の前に本人確認をし直す」が有効だと、
 * ログインから時間の経ったセッションでアドレスを変えようとしたときに
 * これが返る。Clerk の画面ならその場で確認し直せるが、自前の欄からは
 * その画面を呼べないので、ログインし直してもらう。
 */
const REVERIFICATION_REQUIRED = "session_reverification_required";

function describeError(error: unknown): Failure {
  if (!isClerkAPIResponseError(error)) {
    return { message: "通信に失敗しました。もう一度お試しください" };
  }
  const code = error.errors[0]?.code ?? "";
  if (code === REVERIFICATION_REQUIRED) {
    return {
      message: "安全のため、ログインし直してから変更してください",
      signInAgain: true,
    };
  }
  return {
    message:
      ERROR_MESSAGES[code] ??
      "変更できませんでした。時間をおいてもう一度お試しください",
  };
}

/** アドレスを消す。消せなかった数を返し、流れは止めない。 */
async function discard(addresses: EmailAddress[]): Promise<number> {
  const results = await Promise.allSettled(
    addresses.map((address) => address.destroy()),
  );
  const failures = results.filter((result) => result.status === "rejected");
  for (const failure of failures) {
    console.error("discard email address", failure.reason);
  }
  return failures.length;
}

export default function LoginMethodsSection({
  initial,
}: {
  /** サーバーで作った値。Clerk の読み込みが終わるまではこれを出す。 */
  initial: LoginMethods;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const methods = user ? toLoginMethods(user) : initial;

  const [step, setStep] = useState<Step>({ kind: "view" });
  const [draft, setDraft] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<null | "send" | "verify" | "resend">(null);
  const [error, setError] = useState<Failure | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (
    kind: "send" | "verify" | "resend",
    action: () => Promise<void>,
  ) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setBusy(null);
    }
  };

  /** target をメインのアドレスにして、ほかのアドレスを消す。 */
  const switchTo = async (current: ClerkUser, target: EmailAddress) => {
    const hadEmail = current.primaryEmailAddress !== null;
    const others = current.emailAddresses.filter(
      (address) => address.id !== target.id,
    );
    await current.update({ primaryEmailAddressId: target.id });
    // 前のアドレスが残ると、そちらでもログインできてしまう。消せなくても
    // 新しいアドレスはもう使えるので変更は済ませ、残ったことだけ伝える。
    // 残ったものは、次に変えたときにもう一度消しにいく。
    const leftovers = await discard(others);
    await current.reload();

    setStep({ kind: "view" });
    setDraft("");
    setCode("");
    const done = hadEmail
      ? "メールアドレスを変更しました"
      : "メールアドレスを登録しました";
    setNotice(
      leftovers > 0
        ? `${done}。前のアドレスは消せなかったため、そちらでもまだログインできます`
        : done,
    );
  };

  const sendCode = (current: ClerkUser) =>
    run("send", async () => {
      const email = draft.trim();
      if (!email) {
        setError({ message: "メールアドレスを入力してください" });
        return;
      }
      const lower = email.toLowerCase();
      if (lower === methods.email?.toLowerCase()) {
        setError({ message: "今のアドレスと同じです" });
        return;
      }

      const others = current.emailAddresses.filter(
        (address) => address.id !== current.primaryEmailAddressId,
      );
      const same = others.find(
        (address) => address.emailAddress.toLowerCase() === lower,
      );
      // 前に確認の途中でやめたアドレスが残っていれば片付ける。
      await discard(
        others.filter(
          (address) =>
            address !== same && address.verification.status !== "verified",
        ),
      );
      // 確認済みのアドレスなら、コードを送るまでもなく切り替えてよい。
      if (same?.verification.status === "verified") {
        await switchTo(current, same);
        return;
      }

      const target = same ?? (await current.createEmailAddress({ email }));
      await target.prepareVerification({ strategy: "email_code" });
      setCode("");
      setStep({ kind: "code", target });
    });

  const verify = (current: ClerkUser, target: EmailAddress) =>
    run("verify", async () => {
      const verified = await target.attemptVerification({ code });
      if (verified.verification.status !== "verified") {
        setError({ message: ERROR_MESSAGES.form_code_incorrect });
        return;
      }
      await switchTo(current, verified);
    });

  const resend = (target: EmailAddress) =>
    run("resend", async () => {
      await target.prepareVerification({ strategy: "email_code" });
      setCode("");
      setNotice("コードを送り直しました");
    });

  const open = () => {
    setStep({ kind: "enter" });
    setDraft("");
    setError(null);
    setNotice(null);
  };

  const close = () => {
    // 確認の途中でやめたアドレスはログインに使えないまま残るので消しておく。
    if (step.kind === "code") void discard([step.target]);
    setStep({ kind: "view" });
    setDraft("");
    setCode("");
    setError(null);
  };

  const signInAgain = () =>
    void signOut({
      redirectUrl: `/sign-in?redirect_url=${encodeURIComponent("/account")}`,
    });

  const providers = methods.accounts
    .map((account) => providerLabel(account.provider))
    .join("・");

  return (
    <section
      aria-labelledby="login-heading"
      className="rounded-xl border border-border p-5 sm:p-6"
    >
      <h2 id="login-heading" className="text-base font-semibold">
        ログイン方法
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        このアカウントにログインする方法です。パスワードはありません。
      </p>

      <div className="mt-5">
        <h3 className="text-sm font-medium text-muted-foreground">
          メールアドレス
        </h3>

        {step.kind === "view" && (
          <>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
              {methods.email ? (
                <p className="font-semibold [overflow-wrap:anywhere]">
                  {methods.email}
                </p>
              ) : (
                <p className="text-muted-foreground">未登録</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                // 変更には Clerk の読み込みを待つ必要がある。
                disabled={!user}
                onClick={open}
              >
                {methods.email ? <Pencil aria-hidden /> : <Plus aria-hidden />}
                {methods.email ? "変更する" : "登録する"}
              </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {methods.email
                ? "ログイン画面でこのアドレスを入れると、確認コードが届きます。"
                : `登録しておくと、${providers || "いまの方法"}が使えなくなってもログインできます。`}
            </p>
          </>
        )}

        {step.kind === "enter" && (
          <form
            className="mt-2 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (user) void sendCode(user);
            }}
          >
            <label htmlFor="email-input" className="sr-only">
              {methods.email ? "新しいメールアドレス" : "メールアドレス"}
            </label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="email-input"
                type="email"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                aria-invalid={error !== null}
                aria-describedby="email-hint"
                className="max-w-xs"
              />
              <Button type="submit" className="h-9" disabled={busy !== null}>
                {busy === "send" && (
                  <Loader2 className="animate-spin" aria-hidden />
                )}
                確認コードを送る
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9"
                disabled={busy !== null}
                onClick={close}
              >
                やめる
              </Button>
            </div>
            <p id="email-hint" className="text-xs text-muted-foreground">
              {methods.email
                ? "新しいアドレスに6桁の確認コードを送ります。確認が済むまでは今のアドレスのままです。"
                : "このアドレスに6桁の確認コードを送ります。"}
            </p>
          </form>
        )}

        {step.kind === "code" && (
          <form
            className="mt-2 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (user) void verify(user, step.target);
            }}
          >
            <p className="text-sm leading-relaxed">
              <span className="font-semibold [overflow-wrap:anywhere]">
                {step.target.emailAddress}
              </span>{" "}
              に届いた6桁のコードを入れてください。
            </p>
            <label htmlFor="email-code-input" className="sr-only">
              確認コード
            </label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="email-code-input"
                value={code}
                // 貼り付けたときの空白やハイフンは落とす。
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                aria-invalid={error !== null}
                className="w-32 text-center tracking-[0.3em]"
              />
              <Button
                type="submit"
                className="h-9"
                disabled={busy !== null || code.length !== 6}
              >
                {busy === "verify" && (
                  <Loader2 className="animate-spin" aria-hidden />
                )}
                確認する
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9"
                disabled={busy !== null}
                onClick={close}
              >
                やめる
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-muted-foreground"
              disabled={busy !== null}
              onClick={() => void resend(step.target)}
            >
              {busy === "resend" && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              コードを送り直す
            </Button>
          </form>
        )}

        {notice && (
          <p
            role="status"
            className="mt-3 text-sm text-emerald-700 dark:text-emerald-400"
          >
            {notice}
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-red-600 dark:text-red-400"
          >
            <p>{error.message}</p>
            {error.signInAgain && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={signInAgain}
              >
                ログインし直す
              </Button>
            )}
          </div>
        )}
      </div>

      {methods.accounts.length > 0 && (
        <ul className="mt-5 space-y-4 border-t border-border pt-5">
          {methods.accounts.map((account, index) => (
            <li key={`${account.provider}-${index}`}>
              <h3 className="text-sm font-medium text-muted-foreground">
                {providerLabel(account.provider)}
              </h3>
              <p className="mt-1 [overflow-wrap:anywhere]">
                連携済み
                {account.email && (
                  <span className="text-muted-foreground">
                    ({account.email})
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
