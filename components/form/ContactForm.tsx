"use client";

import { sendContact } from "@/utils/actions/contact";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import BotGuardFields from "./BotGuardFields";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "送信中…" : "確認メールを送る"}
    </Button>
  );
}

/** 入力欄に渡す属性。ラベル・補足・エラーと欄を結び付ける。 */
type FieldControlProps = {
  id: string;
  "aria-required": true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

/**
 * ラベル付きの入力欄。
 *
 * 以前は <label> に htmlFor が無く、欄とつながっていなかった。読み上げでは
 * 欄が名前の無い「編集テキスト」になり、ラベルを押しても欄に移らなかった。
 * ラベルは htmlFor で、補足とエラーは aria-describedby で欄に結ぶ。
 *
 * 必須は required 属性ではなく aria-required で伝える。required にすると
 * 送信前にブラウザの吹き出しが出て、サーバーの検証(utils/schemas.ts)の
 * 日本語のエラーと二重の仕組みになる。
 */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: FieldControlProps) => React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold">
        {label}
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          必須
        </span>
      </label>
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-required": true,
        ...(error ? { "aria-invalid": true as const } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })}
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** エラーがあったときにフォーカスを移す順。画面の上から。 */
const FIELD_ORDER = ["name", "email", "message"] as const;

export default function ContactForm() {
  const [state, formAction] = useFormState<{
    success: boolean;
    errors?: Record<string, string[] | undefined>;
    error?: string;
  }, FormData>(sendContact, {
    success: false,
    errors: {},
  });

  // 送信してエラーが返ったら、最初の誤りの欄へ移す。エラー文は欄の下に
  // 出るだけなので、移さないと読み上げの利用者には何も起きないように聞こえる。
  // 欄に移ればラベルとエラー文(aria-describedby)が続けて読まれる。
  useEffect(() => {
    const first = FIELD_ORDER.find((key) => state.errors?.[key]?.length);
    if (first) document.getElementById(`contact-${first}`)?.focus();
  }, [state]);

  if (state.success) {
    return (
      <div className="flex gap-3 rounded-lg border border-emerald-600/30 bg-emerald-50 p-5 dark:bg-emerald-950/30">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            確認メールを送信しました
          </p>
          <p className="text-sm leading-7 text-emerald-800 dark:text-emerald-300/90">
            メール内のリンクをクリックすると、お問い合わせが完了します。
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/*
        入力直後ではなく、確認メールのリンクを踏んだ時点で送信が完了する。
        ボタンを押しても手元では何も起きないように見えるので、
        押す前にその段取りを書いておく。
      */}
      <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
        送信すると確認メールが届きます。メール内のリンクを開いていただいた時点で、お問い合わせが完了します。
      </p>

      <BotGuardFields />

      <div className="space-y-6">
        <Field id="contact-name" label="お名前" error={state.errors?.name?.[0]}>
          {(props) => <Input {...props} name="name" autoComplete="name" />}
        </Field>

        <Field
          id="contact-email"
          label="メールアドレス"
          error={state.errors?.email?.[0]}
        >
          {(props) => (
            <Input {...props} name="email" type="email" autoComplete="email" />
          )}
        </Field>

        {/* 文字数の条件は utils/schemas.ts の contactSchema と揃える。
            書いておかないと、短い問い合わせが送ってから弾かれる。 */}
        <Field
          id="contact-message"
          label="お問い合わせ内容"
          hint="10文字以上、1,000文字以内でお書きください。"
          error={state.errors?.message?.[0]}
        >
          {(props) => <Textarea {...props} name="message" rows={7} />}
        </Field>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
