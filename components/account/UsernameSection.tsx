"use client";

import { useState } from "react";
import { Dices, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  type UsernameResult,
} from "@/lib/username";
import {
  rerollUsernameAction,
  updateUsernameAction,
} from "@/utils/actions/account";

/**
 * /account のユーザーネーム欄。
 *
 * 名前は登録したときにランダムで付いている(lib/username.ts)。ここでは
 * 自分で打って変えるか、ランダムで引き直すかを選べる。引き直しは編集欄を
 * 開かずに押せるようにしてある。付いた名前が気に入らない人の多くは、
 * 自分で考えるより別の地名と名詞を見てみたいだけなので。
 */
export default function UsernameSection({
  initialUsername,
}: {
  initialUsername: string;
}) {
  const [username, setUsername] = useState(initialUsername);
  /** 編集中の入力。null なら編集欄を閉じている。 */
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "save" | "reroll">(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (
    kind: "save" | "reroll",
    action: () => Promise<UsernameResult>,
  ) => {
    setBusy(kind);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUsername(result.username);
      setDraft(null);
    } catch {
      setError("通信に失敗しました。もう一度お試しください");
    } finally {
      setBusy(null);
    }
  };

  const closeEditor = () => {
    setDraft(null);
    setError(null);
  };

  return (
    <section
      aria-labelledby="username-heading"
      className="rounded-xl border border-border p-5 sm:p-6"
    >
      <h2 id="username-heading" className="text-base font-semibold">
        ユーザーネーム
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        スタンプ帳に出る名前です。登録したときに、ロンドンの地名にちなんだ名前が自動で付いています。
      </p>

      {draft === null ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
          <p
            aria-live="polite"
            className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere]"
          >
            {username}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => {
                setDraft(username);
                setError(null);
              }}
            >
              <Pencil aria-hidden />
              変更する
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => void run("reroll", rerollUsernameAction)}
            >
              {busy === "reroll" ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Dices aria-hidden />
              )}
              ランダムで引き直す
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="mt-5 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run("save", () => updateUsernameAction(draft));
          }}
        >
          <label htmlFor="username-input" className="sr-only">
            新しいユーザーネーム
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="username-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={USERNAME_MAX_LENGTH}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              aria-invalid={error !== null}
              aria-describedby="username-hint"
              className="max-w-xs"
            />
            <Button type="submit" className="h-9" disabled={busy !== null}>
              {busy === "save" && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              保存
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9"
              disabled={busy !== null}
              onClick={closeEditor}
            >
              やめる
            </Button>
          </div>
          <p id="username-hint" className="text-xs text-muted-foreground">
            半角英数字と _ で{USERNAME_MIN_LENGTH}〜{USERNAME_MAX_LENGTH}文字
          </p>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
